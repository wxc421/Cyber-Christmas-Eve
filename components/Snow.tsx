import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Snow: React.FC = () => {
  const count = 1500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      
      // Add random rotation speeds
      const rotXSpeed = (Math.random() - 0.5) * 2;
      const rotYSpeed = (Math.random() - 0.5) * 2;
      const rotZSpeed = (Math.random() - 0.5) * 2;

      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, rotXSpeed, rotYSpeed, rotZSpeed, mx: 0, my: 0 });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor, rotXSpeed, rotYSpeed, rotZSpeed } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      // Update position
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      
      // Reset if too low
      if (dummy.position.y < -15) {
          particle.yFactor = 25; // reset to top
          particle.xFactor = -50 + Math.random() * 100; // randomize X
          particle.zFactor = -50 + Math.random() * 100; // randomize Z
          particle.t = Math.random() * 100; // randomize time
      } else {
         particle.yFactor -= 0.03; // Fall down constant
      }

      // Pulse size slightly, but keep them generally visible
      const scale = (s * 0.2 + 0.8) * 0.4; // Base size 0.4
      dummy.scale.set(scale, scale, scale);
      
      // Tumble rotation
      dummy.rotation.x += rotXSpeed * delta;
      dummy.rotation.y += rotYSpeed * delta;
      dummy.rotation.z += rotZSpeed * delta;
      
      dummy.updateMatrix();
      
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {/* Hexagonal flake shape */}
      <circleGeometry args={[0.2, 6]} /> 
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} />
    </instancedMesh>
  );
};
