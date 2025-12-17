import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TopStar: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Hover effect
      groupRef.current.position.y = 5.2 + Math.sin(time * 2) * 0.1;

      // Rotate the whole star assembly slowly
      groupRef.current.rotation.y = time * 0.2;

      // Rotate rings
      if (ringRef1.current) {
        ringRef1.current.rotation.x = time * 0.5;
        ringRef1.current.rotation.y = time * 0.3;
      }
      if (ringRef2.current) {
        ringRef2.current.rotation.x = -time * 0.4;
        ringRef2.current.rotation.z = time * 0.2;
      }

      // Appearance Animation
      // Delayed to 5.0s per user request
      const appearTime = 5.0;
      let scale = 0;
      
      if (time > appearTime) {
        const progress = Math.min(1, (time - appearTime) * 1.5);
        const p = progress;
        // Elastic scale up
        scale = p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
        if (progress < 0.1) scale = progress * 10;
        if (progress >= 1) scale = 1;
      }
      
      groupRef.current.scale.setScalar(scale);
    }
  });

  const starMaterial = new THREE.MeshStandardMaterial({
    color: "#e0f2fe", // Very light cyan/white
    emissive: "#bae6fd", // Sky 200
    emissiveIntensity: 3,
    roughness: 0.1,
    metalness: 0.8,
    toneMapped: false
  });

  return (
    <group position={[0, 5.2, 0]} ref={groupRef} scale={[0,0,0]}>
      
      {/* Central Spiky Core */}
      <group>
        {/* Vertical Spike */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.12, 1.4, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 1.4, 4]} />
          <primitive object={starMaterial} />
        </mesh>

        {/* Horizontal Spikes */}
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        
        {/* Depth Spikes */}
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0, 0, -0.4]} rotation={[-Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>

        {/* Center Diamond */}
        <mesh>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} toneMapped={false}/>
        </mesh>
      </group>
      
      {/* Cyber Rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.7, 0.01, 8, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh ref={ringRef2} scale={[1.2, 1.2, 1.2]}>
        <torusGeometry args={[0.7, 0.01, 8, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Reduced Glow Halo - significantly smaller */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
            color="#bae6fd" 
            transparent 
            opacity={0.1} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
        />
      </mesh>
      
      <pointLight color="#bae6fd" intensity={2} distance={10} decay={2} />
    </group>
  );
};