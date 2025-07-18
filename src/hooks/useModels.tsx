import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Model {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  thumbnail_url: string | null;
  downloads_count: number;
  likes_count: number;
  views_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    display_name: string | null;
  } | null;
  is_liked?: boolean;
  is_owner?: boolean;
}

export function useModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('models')
        .select(`
          *,
          profiles!models_user_id_fkey (
            username,
            display_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which models are liked by current user
      let modelsWithLikes: Model[] = (data || []).map(model => ({
        ...model,
        profiles: Array.isArray(model.profiles) && model.profiles.length > 0 
          ? model.profiles[0] 
          : null,
        is_liked: false,
        is_owner: false
      } as Model));
      
      if (user) {
        const { data: likes } = await supabase
          .from('model_likes')
          .select('model_id')
          .eq('user_id', user.id);

        const likedModelIds = new Set(likes?.map(like => like.model_id) || []);
        
        modelsWithLikes = modelsWithLikes.map(model => ({
          ...model,
          is_liked: likedModelIds.has(model.id),
          is_owner: user.id === model.user_id
        }));
      }

      setModels(modelsWithLikes);
    } catch (error: any) {
      toast({
        title: "Failed to load models",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (modelId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like models",
        variant: "destructive"
      });
      return;
    }

    try {
      const model = models.find(m => m.id === modelId);
      if (!model) return;

      if (model.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('model_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('model_id', modelId);

        if (error) throw error;

        setModels(prev => prev.map(m => 
          m.id === modelId 
            ? { ...m, is_liked: false, likes_count: m.likes_count - 1 }
            : m
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('model_likes')
          .insert({ user_id: user.id, model_id: modelId });

        if (error) throw error;

        setModels(prev => prev.map(m => 
          m.id === modelId 
            ? { ...m, is_liked: true, likes_count: m.likes_count + 1 }
            : m
        ));
      }
    } catch (error: any) {
      toast({
        title: "Failed to update like",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const downloadModel = async (modelId: string) => {
    try {
      const model = models.find(m => m.id === modelId);
      if (!model) return;

      // Increment download count
      await supabase.rpc('increment_model_downloads', { model_id: modelId });

      // Update local state
      setModels(prev => prev.map(m => 
        m.id === modelId 
          ? { ...m, downloads_count: m.downloads_count + 1 }
          : m
      ));

      // Trigger download
      const link = document.createElement('a');
      link.href = model.file_url;
      link.download = `${model.title}.${model.file_type?.split('/')[1] || 'glb'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your model download has begun"
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const incrementViews = async (modelId: string) => {
    try {
      await supabase.rpc('increment_model_views', { model_id: modelId });
      
      setModels(prev => prev.map(m => 
        m.id === modelId 
          ? { ...m, views_count: m.views_count + 1 }
          : m
      ));
    } catch (error) {
      // Silently fail for view counting
      console.error('Failed to increment views:', error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [user]);

  return {
    models,
    loading,
    refetch: fetchModels,
    toggleLike,
    downloadModel,
    incrementViews
  };
}