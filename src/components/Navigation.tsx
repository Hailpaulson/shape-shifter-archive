import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, User, Grid3X3, List, Filter, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import UploadModal from "./UploadModal";

interface NavigationProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onModelsUpdate?: () => void;
}

export default function Navigation({ 
  viewMode, 
  onViewModeChange, 
  searchQuery, 
  onSearchChange,
  onModelsUpdate
}: NavigationProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-background rounded-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ShapeArchive
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className={`relative transition-all duration-300 ${
              isSearchFocused ? 'scale-105' : ''
            }`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search 3D models..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-10 bg-card border-border focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-card rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            {user ? (
              <>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>

                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={() => {
          onModelsUpdate?.();
          setShowUploadModal(false);
        }}
      />
    </nav>
  );
}