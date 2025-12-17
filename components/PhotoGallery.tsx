import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface PhotoGalleryProps {
  mode: 'tree' | 'universe';
  onSelectPhoto: (url: string) => void;
}

// Updated reliable holiday-themed image URLs
const IMAGE_URLS = [
  'https://images.pexels.com/photos/14733025/pexels-photo-14733025.jpeg',   // User provided replacement
  'https://images.pexels.com/photos/14733025/pexels-photo-14733025.jpeg',   
  'https://images.pexels.com/photos/14733025/pexels-photo-14733025.jpeg',   
];

const PhotoItem: React.FC<{
  url: string;
  treePos: THREE.Vector3;
  universePos: THREE.Vector3;
  mode: 'tree' | 'universe';
  onSelect: () => void;
}> = ({ url, treePos, universePos, mode, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 1. Interpolate Position
      const targetPos = mode === 'tree' ? treePos : universePos;
      // Lerp factor: faster when going to universe, smoother when returning
      const lerpSpeed = mode === 'universe' ? 2.0 : 1.5;
      groupRef.current.position.lerp(targetPos, delta * lerpSpeed);

      // 2. Scale Effect
      // Tree mode: smaller (0.6). Universe mode: larger (1.5).
      // Hover effect adds slight zoom.
      const targetScale = (mode === 'tree' ? 0.6 : 1.5) * (hovered ? 1.2 : 1.0);
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
      
      // 3. Look At Camera is handled by Billboard, but we can add floating drift in universe mode
      if (mode === 'universe') {
          groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime + treePos.x) * 0.1;
      } else {
          groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 3);
      }
    }
  });

  return (
    <group ref={groupRef} position={treePos}>
      <Billboard>
        <Image 
          url={url} 
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onClick={(e) => {
            e.stopPropagation(); // Prevent clicking through to the tree
            onSelect();
          }}
        />
        {/* Glow Frame */}
        <mesh position={[0,0,-0.01]} scale={[1.05, 1.05, 1]}>
            <planeGeometry />
            <meshBasicMaterial color={hovered ? "#22d3ee" : "#0ea5e9"} transparent opacity={hovered ? 0.8 : 0.3} />
        </mesh>
      </Billboard>
    </group>
  );
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ mode, onSelectPhoto }) => {
  const treeHeight = 10;
  const maxRadius = 3.5;

  const photos = useMemo(() => {
    return IMAGE_URLS.map((url, i) => {
      // --- TREE POSITION ---
      // Distribute along the cone
      const relativeY = (i / IMAGE_URLS.length); // 0 to 1
      const y = (relativeY * treeHeight * 0.7) - (treeHeight / 2) + 1.5; // Bias towards middle-top
      
      const radiusAtHeight = maxRadius * (1 - relativeY) + 0.5;
      const angle = (i * Math.PI * 2 * 1.618); // Golden ratio distribution
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * radiusAtHeight,
        y,
        Math.sin(angle) * radiusAtHeight
      );

      // --- UNIVERSE POSITION ---
      // Distribute on a large sphere
      const uRadius = 15 + Math.random() * 5;
      const uTheta = Math.random() * Math.PI * 2;
      const uPhi = Math.acos(2 * Math.random() - 1);
      
      const universePos = new THREE.Vector3(
        uRadius * Math.sin(uPhi) * Math.cos(uTheta),
        uRadius * Math.sin(uPhi) * Math.sin(uTheta),
        uRadius * Math.cos(uPhi)
      );

      return { url, treePos, universePos, id: i };
    });
  }, []);

  return (
    <group>
      {photos.map((photo) => (
        <PhotoItem 
            key={photo.id}
            url={photo.url}
            treePos={photo.treePos}
            universePos={photo.universePos}
            mode={mode}
            onSelect={() => onSelectPhoto(photo.url)}
        />
      ))}
    </group>
  );
};