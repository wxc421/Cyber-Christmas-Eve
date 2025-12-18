import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uUniverseMix;
  
  attribute float aSize;
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aTilt;
  attribute vec3 aUniversePos;
  
  varying vec3 vColor;
  
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    float startY = -6.0;
    float speed = 2.5;
    float delay = 0.5;
    float currentY = startY + max(0.0, uTime - delay) * speed;
    
    // Ring Position Logic
    float angle = aAngle + uTime * aSpeed;
    float x = cos(angle) * aRadius;
    float z = sin(angle) * aRadius;
    float y = 0.0;
    
    float s = sin(aTilt);
    float c = cos(aTilt);
    float ty = y * c - z * s;
    float tz = y * s + z * c;
    z = tz;
    y = ty;
    
    vec3 treePos = vec3(x, position.y + y, z);
    
    // Growth/Entrance
    float settleProgress = smoothstep(0.0, 2.5, currentY - treePos.y);
    float visible = step(treePos.y, currentY);
    float expansion = mix(3.5, 1.0, pow(settleProgress, 0.5));
    float entranceRotation = (1.0 - pow(settleProgress, 0.5)) * 2.0;
    treePos.xz *= expansion;
    treePos.xz *= rotate2d(entranceRotation);

    // Final Position
    vec3 finalPos = mix(treePos, aUniversePos, uUniverseMix);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float appearScale = smoothstep(0.0, 0.5, settleProgress);
    gl_PointSize = aSize * visible * appearScale * (400.0 / -mvPosition.z);
    
    float pulse = sin(uTime * 3.0 + aAngle * 2.0) * 0.2 + 0.8;
    vColor = vec3(0.4, 0.8, 1.0) * pulse;
    vColor += vec3(1.0) * (1.0 - settleProgress) * 0.5;
    
    // Fade out slightly in universe mode
    vColor *= (1.0 - uUniverseMix * 0.3);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    gl_FragColor = vec4(vColor, glow);
  }
`;

export const StarRings: React.FC<{ mode: 'tree' | 'universe' }> = ({ mode }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mixRef = useRef(0);

  const ringCount = 8;
  const particlesPerRing = 120;
  const totalParticles = ringCount * particlesPerRing;
  const treeHeight = 10;
  const maxRadius = 3.8;

  const { positions, sizes, angles, radii, speeds, tilts, universePositions } = useMemo(() => {
    const pos = new Float32Array(totalParticles * 3);
    const siz = new Float32Array(totalParticles);
    const ang = new Float32Array(totalParticles);
    const rad = new Float32Array(totalParticles);
    const spd = new Float32Array(totalParticles);
    const tlt = new Float32Array(totalParticles);
    const uniPos = new Float32Array(totalParticles * 3);

    let idx = 0;
    for (let r = 0; r < ringCount; r++) {
      const relativeY = r / (ringCount - 1); 
      const y = (relativeY * treeHeight * 0.85) - (treeHeight / 2) + 0.5; 
      const ringRadius = (maxRadius * (1 - relativeY)) + 0.2; 
      const ringTilt = (Math.random() - 0.5) * 0.3;
      const ringSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3);

      for (let p = 0; p < particlesPerRing; p++) {
        const i = idx + p;
        pos[i * 3] = 0;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        ang[i] = (p / particlesPerRing) * Math.PI * 2;
        rad[i] = ringRadius;
        spd[i] = ringSpeed;
        tlt[i] = ringTilt;
        siz[i] = Math.random() * 0.2 + 0.1;

        const uRadius = 20 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        uniPos[i * 3] = uRadius * Math.sin(phi) * Math.cos(theta);
        uniPos[i * 3 + 1] = uRadius * Math.sin(phi) * Math.sin(theta);
        uniPos[i * 3 + 2] = uRadius * Math.cos(phi);
      }
      idx += particlesPerRing;
    }

    return { positions: pos, sizes: siz, angles: ang, radii: rad, speeds: spd, tilts: tlt, universePositions: uniPos };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      mixRef.current = THREE.MathUtils.lerp(mixRef.current, mode === 'universe' ? 1 : 0, delta * 1.5);
      materialRef.current.uniforms.uUniverseMix.value = mixRef.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={totalParticles} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={totalParticles} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aAngle" count={totalParticles} array={angles} itemSize={1} />
        <bufferAttribute attach="attributes-aRadius" count={totalParticles} array={radii} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={totalParticles} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aTilt" count={totalParticles} array={tilts} itemSize={1} />
        <bufferAttribute attach="attributes-aUniversePos" count={totalParticles} array={universePositions} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ 
            uTime: { value: 0 },
            uUniverseMix: { value: 0 }
        }}
      />
    </points>
  );
};