import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Search, Box } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ModelCard from "@/components/ModelCard";
import ModelViewer from "@/components/ModelViewer";
import { useModels } from "@/hooks/useModels";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-3d-library.jpg";

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { models, loading, refetch, toggleLike, downloadModel, incrementViews } = useModels();
  const { user } = useAuth();

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (searchQuery.trim() === '') {
      return models;
    } else {
      return models.filter(model => 
        model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [models, searchQuery]);

  const handleEdit = (id: string) => {
    console.log('Editing model:', id);
    // Will implement model editor
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onModelsUpdate={refetch}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60"></div>
        <img 
          src={heroImage} 
          alt="3D Model Library" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        <div className="relative container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Shape Archive
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Discover, upload, and share stunning 3D models in our cutting-edge library
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button variant="hero" size="lg" className="min-w-[200px]">
                  <Upload className="mr-2" />
                  Upload Your Model
                </Button>
              ) : (
                <Button variant="hero" size="lg" className="min-w-[200px]" asChild>
                  <Link to="/auth">
                    <Upload className="mr-2" />
                    Sign In to Upload
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <Search className="mr-2" />
                Explore Library
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <Box className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">3D Viewer</h3>
                <p className="text-muted-foreground text-sm">
                  Interactive 3D preview with advanced rendering
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Easy Upload</h3>
                <p className="text-muted-foreground text-sm">
                  Support for OBJ, GLB, STL and more formats
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Smart Search</h3>
                <p className="text-muted-foreground text-sm">
                  Find models by tags, categories, and content
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured 3D Viewer */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience 3D in Real-time</h2>
            <p className="text-muted-foreground text-lg">
              Interact with models directly in your browser
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ModelViewer height="500px">
              {/* Featured demo model */}
              <group>
                <mesh position={[0, 1, 0]} castShadow>
                  <cylinderGeometry args={[0.8, 1.2, 2, 8]} />
                  <meshStandardMaterial 
                    color="#00ffff" 
                    metalness={0.8} 
                    roughness={0.2}
                    emissive="#001a1a"
                    emissiveIntensity={0.1}
                  />
                </mesh>
                <mesh position={[2, 0.5, -1]} castShadow>
                  <sphereGeometry args={[0.7, 32, 32]} />
                  <meshStandardMaterial 
                    color="#ff00ff" 
                    metalness={0.6} 
                    roughness={0.3}
                    emissive="#1a0011"
                    emissiveIntensity={0.1}
                  />
                </mesh>
                <mesh position={[-2, 0.5, 1]} castShadow>
                  <torusGeometry args={[0.8, 0.3, 16, 100]} />
                  <meshStandardMaterial 
                    color="#ffff00" 
                    metalness={0.7} 
                    roughness={0.1}
                    emissive="#1a1a00"
                    emissiveIntensity={0.1}
                  />
                </mesh>
              </group>
            </ModelViewer>
          </div>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              {searchQuery ? `Search Results (${filteredModels.length})` : 'Featured Models'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading models...</p>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? `No models found for "${searchQuery}"` : 'No models uploaded yet. Be the first to share your creations!'}
              </p>
              {!user && !searchQuery && (
                <Button className="mt-4" asChild>
                  <Link to="/auth">Sign In to Upload Models</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  id={model.id}
                  title={model.title}
                  author={model.profiles?.display_name || model.profiles?.username || 'Anonymous'}
                  tags={model.tags}
                  downloads={model.downloads_count}
                  likes={model.likes_count}
                  views={model.views_count}
                  isOwner={model.is_owner}
                  onDownload={() => downloadModel(model.id)}
                  onLike={() => toggleLike(model.id)}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 mt-20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-background rounded-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ShapeArchive
            </span>
          </div>
          
          <p className="text-muted-foreground mb-4">
            The ultimate platform for 3D model sharing and collaboration
          </p>
          
          <p className="text-sm text-muted-foreground">
            {user ? `Welcome back, ${user.email}!` : 'Join our community of 3D creators'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
