import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uUniverseMix; // 0.0 = Tree, 1.0 = Universe
  
  attribute float aSize;
  attribute float aSpeed;
  attribute float aRandom;
  attribute vec3 aColor;
  attribute vec3 aUniversePos;
  
  varying vec3 vColor;
  
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    vec3 pos = position;
    
    // --- TREE ANIMATION ---
    float startY = -6.0; 
    float speed = 2.5;
    float delay = 0.5;   
    float currentY = startY + max(0.0, uTime - delay) * speed;
    float settleProgress = smoothstep(0.0, 2.5, currentY - pos.y);
    float visible = step(pos.y, currentY);

    float expansion = mix(4.0, 1.0, pow(settleProgress, 0.5));
    float entranceRotation = (1.0 - pow(settleProgress, 0.5)) * 3.0;

    vec3 treePos = pos;
    treePos.xz *= expansion;
    treePos.xz *= rotate2d(entranceRotation);
    
    // Idle tree motion
    float idleAngle = uTime * 0.1 * aSpeed;
    treePos.xz *= rotate2d(idleAngle);
    treePos.y += sin(uTime * 0.8 + aRandom) * 0.05 * settleProgress;

    // --- UNIVERSE ANIMATION ---
    // Particles scatter into a massive starfield
    vec3 uniPos = aUniversePos;
    float slowTime = uTime * 0.03;
    // Slow planetary/galactic rotation
    uniPos.xz *= rotate2d(slowTime * (aRandom + 0.1));
    uniPos.y += sin(uTime * 0.05 + aRandom * 10.0) * 4.0;

    // --- FINAL POSITION ---
    // Smoothly blend from tree structure to complete universe dispersion
    vec3 finalPos = mix(treePos, uniPos, uUniverseMix);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // --- SIZE ---
    float appearScale = smoothstep(0.0, 0.5, settleProgress);
    // Pulse sizes in universe mode to look like distant twinkling stars
    float sizeScale = mix(1.0, 1.8 + sin(uTime * 2.5 + aRandom * 50.0) * 0.8, uUniverseMix);
    float finalSize = aSize * visible * appearScale * sizeScale;
    
    gl_PointSize = finalSize * (350.0 / -mvPosition.z);
    
    // --- COLOR ---
    vec3 treeColor = mix(vec3(1.5, 2.0, 2.5), aColor, pow(settleProgress, 4.0));
    // In universe mode, particles become brilliant white-blue stars
    vec3 uniColor = mix(vec3(0.9, 0.95, 1.0), vec3(1.0, 1.0, 1.5), aRandom);
    vColor = mix(treeColor, uniColor, uUniverseMix);
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float glow = 1.0 - (r * 2.0);
    // Concentrated core for a "star" look
    glow = pow(glow, 2.2); 
    gl_FragColor = vec4(vColor, glow);
  }
`;

export const TreeParticles: React.FC<{ mode: 'tree' | 'universe' }> = ({ mode }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const universeMixRef = useRef(0);

  const particleCount = 7500; // Even more particles for a "vast" universe feel
  const treeHeight = 10;
  const maxRadius = 3.8;

  const { positions, colors, sizes, speeds, randomness, universePositions } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    const spd = new Float32Array(particleCount);
    const rnd = new Float32Array(particleCount);
    const uniPos = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color('#e2e8f0'), // White/Silver
      new THREE.Color('#67e8f9'), // Cyan
      new THREE.Color('#38bdf8'), // Blue
      new THREE.Color('#fbbf24'), // Gold
      new THREE.Color('#f59e0b'), // Amber
    ];

    for (let i = 0; i < particleCount; i++) {
      // Tree Distribution Logic
      const relativeY = Math.random();
      const y = (relativeY * treeHeight) - (treeHeight / 2);
      const spiralArms = 7;
      const armAngle = (relativeY * 12.0) + (Math.PI * 2 * (i % spiralArms) / spiralArms);
      const finalAngle = armAngle + (Math.random() - 0.5) * 1.2;
      let radiusAtHeight = maxRadius * (1 - relativeY);
      let r = (Math.random() * 0.3 + 0.7) * radiusAtHeight; 
      if (Math.random() > 0.85) r = Math.random() * radiusAtHeight; // Fill interior

      pos[i * 3] = Math.cos(finalAngle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(finalAngle) * r;

      // Universe Positions - Massive dispersion for "浩瀚宇宙" (vast universe)
      // We use a much larger radius and spherical spread
      const uRadius = 15 + Math.random() * 50; 
      const uTheta = Math.random() * Math.PI * 2;
      const uPhi = Math.acos(2 * Math.random() - 1);
      
      uniPos[i * 3] = uRadius * Math.sin(uPhi) * Math.cos(uTheta);
      uniPos[i * 3 + 1] = uRadius * Math.sin(uPhi) * Math.sin(uTheta);
      uniPos[i * 3 + 2] = uRadius * Math.cos(uPhi);

      const isOrnament = Math.random() > 0.9;
      let color;
      if (isOrnament) {
          const isGold = Math.random() > 0.5;
          color = isGold ? colorPalette[3] : colorPalette[1];
      } else {
          color = colorPalette[0].clone().lerp(colorPalette[2], Math.random() * 0.3);
      }

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      siz[i] = isOrnament ? Math.random() * 0.35 + 0.2 : Math.random() * 0.1 + 0.05;
      spd[i] = Math.random() * 0.5 + 0.5;
      rnd[i] = Math.random();
    }

    return { positions: pos, colors: col, sizes: siz, speeds: spd, randomness: rnd, universePositions: uniPos };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      const target = mode === 'universe' ? 1 : 0;
      universeMixRef.current = THREE.MathUtils.lerp(universeMixRef.current, target, delta * 1.0);
      materialRef.current.uniforms.uUniverseMix.value = universeMixRef.current;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={particleCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={particleCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={particleCount} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={particleCount} array={randomness} itemSize={1} />
        <bufferAttribute attach="attributes-aUniversePos" count={particleCount} array={universePositions} itemSize={3} />
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