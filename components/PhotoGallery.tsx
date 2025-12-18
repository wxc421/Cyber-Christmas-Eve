import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface PhotoGalleryProps {
  mode: 'tree' | 'universe';
  onSelectPhoto: (url: string) => void;
}

// Fixed reliable holiday-themed image URLs to replace the broken ones
const IMAGE_URLS = [
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
      const targetPos = mode === 'tree' ? treePos : universePos;
      // Faster transition when assembling tree, smoother when scattering
      const lerpSpeed = mode === 'universe' ? 1.2 : 2.5;
      groupRef.current.position.lerp(targetPos, delta * lerpSpeed);

      // Scale significantly up in universe mode for a gallery feel
      const targetScale = (mode === 'tree' ? 0.65 : 3.5) * (hovered ? 1.15 : 1.0);
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
      
      if (mode === 'universe') {
          // Add a subtle drift to make it feel like floating in a void
          groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.4 + treePos.x * 2.0) * 0.005;
          groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + treePos.y * 1.5) * 0.08;
      } else {
          groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 5);
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
            e.stopPropagation();
            onSelect();
          }}
        />
        {/* Memory Frame Glow */}
        <mesh position={[0,0,-0.03]} scale={[1.15, 1.15, 1]}>
            <planeGeometry />
            <meshBasicMaterial 
              color={hovered ? "#67e8f9" : "#ffffff"} 
              transparent 
              opacity={hovered ? 0.8 : 0.1} 
            />
        </mesh>
      </Billboard>
    </group>
  );
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ mode, onSelectPhoto }) => {
  const treeHeight = 10;
  const maxRadius = 3.8;

  const photos = useMemo(() => {
    return IMAGE_URLS.map((url, i) => {
      // Tree placement: distributed around the tree surface in a spiral
      const relativeY = (i / IMAGE_URLS.length);
      const y = (relativeY * treeHeight * 0.75) - (treeHeight / 2) + 1.2;
      const radiusAtHeight = maxRadius * (1 - relativeY) + 0.45;
      const angle = (i * Math.PI * 2 * 1.618); // Golden ratio distribution
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * radiusAtHeight,
        y,
        Math.sin(angle) * radiusAtHeight
      );

      // Universe placement: spread out across the entire view area
      // Positioned to surround the camera at various depths
      const uRadius = 18 + (i * 4); 
      const uTheta = (i / IMAGE_URLS.length) * Math.PI * 2 + (Math.random() - 0.5);
      const uPhi = Math.acos(2 * Math.random() - 1); // Spherical distribution
      
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