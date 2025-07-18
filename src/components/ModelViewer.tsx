import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Mesh } from 'three';

interface ModelViewerProps {
  width?: string;
  height?: string;
  showGrid?: boolean;
  children?: React.ReactNode;
}

function Scene({ showGrid = true, children }: { showGrid?: boolean; children?: React.ReactNode }) {
  const meshRef = useRef<Mesh>(null);

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 5, 5]} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
      />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffff" />
      
      <Environment preset="studio" />
      
      {showGrid && (
        <Grid 
          args={[10.5, 10.5]} 
          cellSize={0.5} 
          cellThickness={0.5} 
          cellColor="#334155" 
          sectionSize={2} 
          sectionThickness={1} 
          sectionColor="#475569" 
          fadeDistance={25} 
          fadeStrength={1} 
          infiniteGrid 
        />
      )}
      
      {children || (
        // Default demo cube with modern material
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color="#00ffff" 
            metalness={0.7} 
            roughness={0.2} 
            emissive="#001a1a"
            emissiveIntensity={0.1}
          />
        </mesh>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-viewer-bg">
      <div className="text-primary animate-pulse">Loading 3D Model...</div>
    </div>
  );
}

export default function ModelViewer({ 
  width = "100%", 
  height = "600px", 
  showGrid = true,
  children 
}: ModelViewerProps) {
  return (
    <div 
      className="relative rounded-lg overflow-hidden shadow-model border border-border"
      style={{ width, height }}
    >
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        className="bg-viewer-bg"
      >
        <Suspense fallback={null}>
          <Scene showGrid={showGrid}>
            {children}
          </Scene>
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-md px-3 py-1 text-xs text-white">
        Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}