import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['.glb', '.gltf', '.obj', '.stl', '.fbx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a 3D model file (.glb, .gltf, .obj, .stl, .fbx)",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
      
      // Auto-fill title from filename if not set
      if (!formData.title) {
        const fileName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('models')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('models')
        .getPublicUrl(fileName);

      // Save model metadata to database
      const { error: dbError } = await supabase
        .from('models')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          tags: formData.tags,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type || `application/${fileExt}`,
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful!",
        description: "Your 3D model has been uploaded successfully."
      });

      // Reset form
      setFile(null);
      setFormData({ title: '', description: '', tags: [] });
      onUploadComplete?.();
      onClose();

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload 3D Model</DialogTitle>
          <DialogDescription>
            Share your 3D creations with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>3D Model File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {file ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div>
                    <Button variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".glb,.gltf,.obj,.stl,.fbx"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported: GLB, GLTF, OBJ, STL, FBX
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter model title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your 3D model..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || !formData.title || uploading}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {uploading ? "Uploading..." : "Upload Model"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}