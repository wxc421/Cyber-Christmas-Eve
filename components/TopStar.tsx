import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const TopStar: React.FC<{ mode: 'tree' | 'universe' }> = ({ mode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const posRef = useRef(new THREE.Vector3(0, 5.2, 0));
  const universePos = useRef(new THREE.Vector3(0, 20, -10));
  
  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Interpolate position
      const targetPos = mode === 'tree' ? new THREE.Vector3(0, 5.2, 0) : universePos.current;
      posRef.current.lerp(targetPos, delta * 1.2);
      groupRef.current.position.copy(posRef.current);
      
      // Add hovering/floating
      groupRef.current.position.y += Math.sin(time * 2) * 0.1;

      groupRef.current.rotation.y = time * 0.2;

      if (ringRef1.current) {
        ringRef1.current.rotation.x = time * 0.5;
        ringRef1.current.rotation.y = time * 0.3;
      }
      if (ringRef2.current) {
        ringRef2.current.rotation.x = -time * 0.4;
        ringRef2.current.rotation.z = time * 0.2;
      }

      // Initial Appearance
      const appearTime = 5.0;
      let scale = groupRef.current.scale.x;
      
      if (time > appearTime) {
        if (scale < 0.1) scale = 0.1; // Jump start
        const targetScale = mode === 'universe' ? 2.5 : 1.0;
        scale = THREE.MathUtils.lerp(scale, targetScale, delta * 2);
      } else {
        scale = 0;
      }
      
      groupRef.current.scale.setScalar(scale);
    }
  });

  const starMaterial = new THREE.MeshStandardMaterial({
    color: "#e0f2fe",
    emissive: "#bae6fd",
    emissiveIntensity: 3,
    roughness: 0.1,
    metalness: 0.8,
    toneMapped: false
  });

  return (
    <group position={[0, 5.2, 0]} ref={groupRef} scale={[0,0,0]}>
      <group>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.12, 1.4, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 1.4, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0, 0, 0.4]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh position={[0, 0, -0.4]} rotation={[-Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.1, 1.2, 4]} />
          <primitive object={starMaterial} />
        </mesh>
        <mesh>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} toneMapped={false}/>
        </mesh>
      </group>
      
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.7, 0.01, 8, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh ref={ringRef2} scale={[1.2, 1.2, 1.2]}>
        <torusGeometry args={[0.7, 0.01, 8, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
      
      <pointLight color="#bae6fd" intensity={2} distance={10} decay={2} />
    </group>
  );
};