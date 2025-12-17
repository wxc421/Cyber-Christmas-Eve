import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MagicSpiral: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 600;

  // Initial setup for spiral
  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    
    for(let i=0; i<count; i++) {
        // Initialize off-screen/default
        pos[i*3] = 0;
        pos[i*3+1] = -100; 
        pos[i*3+2] = 0;
        rnd[i] = Math.random();
    }
    return { positions: pos, randoms: rnd };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    
    const time = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Growth parameters matching the tree
    const startY = -6.0;
    const speed = 3.0; // Slightly faster than tree (2.5) to lead the way, but slowed from 3.5
    const delay = 0.5;
    const currentMaxY = startY + Math.max(0, time - delay) * speed;

    for (let i = 0; i < count; i++) {
        // Offset time for each particle to create a stream
        const t = (time * 0.5 + i * 0.005) % 1; // 0 to 1 cycle
        
        // Height calculation (bottom to top)
        const height = t * 11 - 5.5; // Maps 0..1 to -5.5..5.5
        
        // VISIBILITY CHECK:
        // If the particle's calculated height is above the current growth threshold, hide it.
        // We hide it by throwing it far away or setting scale (but here we just set Y low)
        if (height > currentMaxY) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -100; // Hidden
            positions[i * 3 + 2] = 0;
            continue;
        }

        // Radius tapers towards top
        const radius = 4.0 * (1 - t);
        
        // Spiral angle
        const angle = t * Math.PI * 12 - time * 0.5; // Multiple loops

        // Add some jitter/width to the ribbon
        const jitterX = (Math.random() - 0.5) * 0.2;
        const jitterY = (Math.random() - 0.5) * 0.2;
        const jitterZ = (Math.random() - 0.5) * 0.2;

        positions[i * 3] = Math.cos(angle) * radius + jitterX;
        positions[i * 3 + 1] = height + jitterY;
        positions[i * 3 + 2] = Math.sin(angle) * radius + jitterZ;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#67e8f9" // Cyan
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};