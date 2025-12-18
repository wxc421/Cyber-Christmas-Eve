import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MagicSpiral: React.FC<{ mode: 'tree' | 'universe' }> = ({ mode }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const count = 600;

  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
        pos[i*3] = 0;
        pos[i*3+1] = -100; 
        pos[i*3+2] = 0;
    }
    return { positions: pos };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || !materialRef.current) return;
    
    // Fade out spiral in universe mode
    const targetOpacity = mode === 'universe' ? 0 : 0.8;
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 3);

    if (materialRef.current.opacity < 0.01) {
        pointsRef.current.visible = false;
        return;
    }
    pointsRef.current.visible = true;

    const time = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const startY = -6.0;
    const speed = 3.0; 
    const delay = 0.5;
    const currentMaxY = startY + Math.max(0, time - delay) * speed;

    for (let i = 0; i < count; i++) {
        const t = (time * 0.5 + i * 0.005) % 1;
        const height = t * 11 - 5.5; 
        
        if (height > currentMaxY) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -100;
            positions[i * 3 + 2] = 0;
            continue;
        }

        const radius = 4.0 * (1 - t);
        const angle = t * Math.PI * 12 - time * 0.5;
        const jitter = 0.2;

        positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * jitter;
        positions[i * 3 + 1] = height + (Math.random() - 0.5) * jitter;
        positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * jitter;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color="#67e8f9"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};