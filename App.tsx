import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './components/TreeParticles';
import { MagicSpiral } from './components/MagicSpiral';
import { StarRings } from './components/StarRings';
import { Snow } from './components/Snow';
import { TopStar } from './components/TopStar';
import { CodeOverlay } from './components/CodeOverlay';
import { PhotoGallery } from './components/PhotoGallery';

// Camera rig for smooth movement
const CameraRig = ({ viewMode }: { viewMode: 'tree' | 'universe' }) => {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    let targetX, targetZ, targetY;
    let lookAtVec = new THREE.Vector3(0, 0, 0);

    if (viewMode === 'universe') {
       // Slow wide orbit in universe mode
       targetX = Math.sin(t * 0.08) * 25;
       targetZ = Math.cos(t * 0.08) * 25;
       targetY = 5 + Math.sin(t * 0.1) * 3;
    } else {
       // Closer focus for tree mode
       targetX = Math.sin(t * 0.15) * 12;
       targetZ = Math.cos(t * 0.15) * 12;
       targetY = 1.5;
    }

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.03);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.03);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.03);
    
    state.camera.lookAt(lookAtVec);
  });
  return null;
};

const Scene = ({ viewMode, setViewMode, onSelectPhoto }: { viewMode: 'tree' | 'universe', setViewMode: (m: 'tree' | 'universe') => void, onSelectPhoto: (url: string) => void }) => {
  return (
    <>
      <color attach="background" args={['#020617']} />
      
      <ambientLight intensity={0.5} color="#475569" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f472b6" />
      
      <group position={[0, -2, 0]}>
        {/* Transparent click area for toggling modes */}
        <mesh 
          visible={false} 
          position={[0, 5, 0]} 
          onClick={(e) => {
             e.stopPropagation();
             setViewMode(viewMode === 'tree' ? 'universe' : 'tree');
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <sphereGeometry args={[8]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <TreeParticles mode={viewMode} />
        <StarRings mode={viewMode} />
        <MagicSpiral mode={viewMode} />
        <TopStar mode={viewMode} />
        <PhotoGallery mode={viewMode} onSelectPhoto={onSelectPhoto} />
      </group>
      
      <Snow />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <EffectComposer enableNormalPass={false}>
        <Bloom luminanceThreshold={0.15} mipmapBlur intensity={1.8} radius={0.7} />
        <Noise opacity={0.06} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
      <CameraRig viewMode={viewMode} />
    </>
  );
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'universe'>('tree');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3?filename=christmas-tree-126685.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    return () => {
      if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    if(!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio autoplay block", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-full bg-slate-950">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-500 font-mono">Loading Neural Universe...</div>}>
        <Canvas gl={{ antialias: true, alpha: false, stencil: false, depth: true }} dpr={[1, 2]}>
          <Scene viewMode={viewMode} setViewMode={setViewMode} onSelectPhoto={setSelectedPhoto} />
        </Canvas>
      </Suspense>
      
      <CodeOverlay 
        isAudioPlaying={isPlaying} 
        toggleAudio={toggleAudio} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        selectedPhoto={selectedPhoto}
        onClosePhoto={() => setSelectedPhoto(null)}
      />
    </div>
  );
}