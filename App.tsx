import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './components/TreeParticles';
import { MagicSpiral } from './components/MagicSpiral';
import { StarRings } from './components/StarRings';
import { Snow } from './components/Snow';
import { TopStar } from './components/TopStar';
import { CodeOverlay } from './components/CodeOverlay';

// Camera rig for smooth movement
const CameraRig = () => {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Gentle floating camera
    state.camera.position.x = Math.sin(t * 0.1) * 14;
    state.camera.position.z = Math.cos(t * 0.1) * 14;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const Scene = () => {
  return (
    <>
      <color attach="background" args={['#020617']} /> {/* Very dark slate */}
      
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#475569" />
      <pointLight position={[10, 10, 10]} intensity={1} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f472b6" />
      
      {/* Objects */}
      <group position={[0, -2, 0]}>
        <TreeParticles />
        <StarRings />
        <MagicSpiral />
        <TopStar />
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
      <CameraRig />
    </>
  );
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Royalty-free calming holiday ambient music placeholder
    // Using a reliable source for ambient piano
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
          <Scene />
        </Canvas>
      </Suspense>
      
      <CodeOverlay isAudioPlaying={isPlaying} toggleAudio={toggleAudio} />
    </div>
  );
}