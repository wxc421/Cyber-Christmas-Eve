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
    
    // Target position based on mode
    let targetX = Math.sin(t * 0.1) * 14;
    let targetZ = Math.cos(t * 0.1) * 14;
    let targetY = 2;
    let lookAtVec = new THREE.Vector3(0, 0, 0);

    if (viewMode === 'universe') {
       // Pull back significantly to see the universe
       targetX = Math.sin(t * 0.05) * 25;
       targetZ = Math.cos(t * 0.05) * 25;
       targetY = 5;
    }

    // Smooth camera transition
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.02);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.02);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.02);
    
    state.camera.lookAt(lookAtVec);
  });
  return null;
};

const Scene = ({ viewMode, setViewMode, onSelectPhoto }: { viewMode: 'tree' | 'universe', setViewMode: (m: 'tree' | 'universe') => void, onSelectPhoto: (url: string) => void }) => {
  return (
    <>
      <color attach="background" args={['#020617']} /> {/* Very dark slate */}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#475569" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f472b6" />
      
      {/* Objects */}
      <group position={[0, -2, 0]}>
        {/* Invisible Click Trigger for Tree */}
        <mesh 
          visible={false} 
          position={[0, 5, 0]} 
          onClick={(e) => {
             e.stopPropagation();
             if (viewMode === 'tree') setViewMode('universe');
             else setViewMode('tree');
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <coneGeometry args={[4.5, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <TreeParticles />
        <StarRings />
        <MagicSpiral />
        <TopStar />
        <PhotoGallery mode={viewMode} onSelectPhoto={onSelectPhoto} />
      </group>
      
      <Snow />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Post Processing */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* Camera */}
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
    // Royalty-free calming holiday ambient music placeholder
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
      <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-500 font-mono">Initializing Neural Christmas...</div>}>
        <Canvas gl={{ antialias: false, alpha: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
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
