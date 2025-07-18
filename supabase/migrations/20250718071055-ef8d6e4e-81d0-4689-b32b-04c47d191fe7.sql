-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create models table
CREATE TABLE public.models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  thumbnail_url TEXT,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create model_likes table for tracking user likes
CREATE TABLE public.model_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('models', 'models', true),
  ('thumbnails', 'thumbnails', true),
  ('avatars', 'avatars', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for models
CREATE POLICY "Public models are viewable by everyone" 
ON public.models 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own models" 
ON public.models 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" 
ON public.models 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" 
ON public.models 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for model_likes
CREATE POLICY "Users can view all likes" 
ON public.model_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can like/unlike models" 
ON public.model_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.model_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for models
CREATE POLICY "Models are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'models');

CREATE POLICY "Users can upload their own models" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own models" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own models" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for thumbnails
CREATE POLICY "Thumbnails are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload their own thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for avatars
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON public.models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update model stats
CREATE OR REPLACE FUNCTION public.increment_model_downloads(model_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.models 
  SET downloads_count = downloads_count + 1 
  WHERE id = model_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_model_views(model_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.models 
  SET views_count = views_count + 1 
  WHERE id = model_id;
END;
$$ LANGUAGE plpgsql;