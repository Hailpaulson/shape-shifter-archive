import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Heart, Eye, MoreVertical, Edit } from "lucide-react";
import { useState } from "react";
import ModelViewer from "./ModelViewer";

interface ModelCardProps {
  id: string;
  title: string;
  author: string;
  tags: string[];
  downloads: number;
  likes: number;
  views: number;
  thumbnail?: string;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onLike?: (id: string) => void;
}

export default function ModelCard({
  id,
  title,
  author,
  tags,
  downloads,
  likes,
  views,
  isOwner = false,
  onEdit,
  onDownload,
  onLike
}: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(id);
  };

  return (
    <Card 
      className="group bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-glow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-viewer-bg">
          {/* 3D Model Preview */}
          <ModelViewer height="200px" showGrid={false}>
            {/* Demo rotating cube for now */}
            <mesh position={[0, 0, 0]} rotation={[0.5, 0.5, 0]}>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial 
                color="#00ffff" 
                metalness={0.6} 
                roughness={0.3} 
                emissive="#001a1a"
                emissiveIntensity={0.1}
              />
            </mesh>
          </ModelViewer>
          
          {/* Overlay Actions */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center space-x-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button size="sm" variant="secondary" onClick={() => onDownload?.(id)}>
              <Download className="w-4 h-4" />
            </Button>
            {isOwner && (
              <Button size="sm" variant="secondary" onClick={() => onEdit?.(id)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="secondary">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats Overlay */}
          <div className="absolute top-3 left-3 flex space-x-2">
            <Badge variant="secondary" className="text-xs bg-black/70 backdrop-blur-sm">
              <Eye className="w-3 h-3 mr-1" />
              {views}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Author */}
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">by {author}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors hover:text-accent ${
                  isLiked ? 'text-accent' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes + (isLiked ? 1 : 0)}</span>
              </button>
              
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{downloads}</span>
              </div>
            </div>

            <Button size="sm" variant="outline" onClick={() => onDownload?.(id)}>
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}