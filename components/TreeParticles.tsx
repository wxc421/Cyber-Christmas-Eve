import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aRandom;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  
  // Rotation matrix helper
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    vec3 pos = position;
    
    // --- ANIMATION CONFIG ---
    float startY = -6.0; 
    float speed = 3.0;   
    float delay = 0.5;   
    
    // The "scanline" moves up over time
    float currentY = startY + max(0.0, uTime - delay) * speed;
    
    // Calculate how "settled" the particle is based on the scanline passing it
    // 0.0 = just appeared (at scanline), 1.0 = fully settled (scanline passed by 2.0 units)
    float settleProgress = smoothstep(0.0, 2.5, currentY - pos.y);
    
    // Visibility: Only draw if the scanline has reached this height
    float visible = step(pos.y, currentY);

    // --- ENTRANCE ANIMATION (Spiral In) ---
    // 1. Expansion: Start with radius multiplied by 4, shrink to 1
    float expansion = mix(4.0, 1.0, pow(settleProgress, 0.5));
    
    // 2. Rotation: Spin into place
    float entranceRotation = (1.0 - pow(settleProgress, 0.5)) * 3.0; // Rotate 3 radians as it enters

    // Apply modifiers
    vec3 animatedPos = pos;
    animatedPos.xz *= expansion;
    animatedPos.xz *= rotate2d(entranceRotation);
    
    // --- IDLE ANIMATION ---
    // Gentle sway and breathe after settled
    float breathe = sin(uTime * 1.5 + aRandom * 5.0) * 0.5 + 0.5; 
    
    // Continuous slow rotation
    float idleAngle = uTime * 0.1 * aSpeed;
    animatedPos.xz *= rotate2d(idleAngle);

    // Slight vertical float
    animatedPos.y += sin(uTime * 0.8 + aRandom) * 0.05 * settleProgress;

    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // --- SIZE ---
    // Scale up from 0 when appearing
    float appearScale = smoothstep(0.0, 0.5, settleProgress);
    float finalSize = aSize * visible * appearScale;
    
    // Intense Twinkle for ornaments
    float twinkle = sin(uTime * 8.0 + aRandom * 50.0);
    if (aSize > 0.2) { 
        finalSize += twinkle * 0.15; 
    }
    
    gl_PointSize = finalSize * (350.0 / -mvPosition.z);
    
    // --- COLOR ---
    // Flash white/cyan when first appearing
    vColor = mix(vec3(1.5, 2.0, 2.5), aColor, pow(settleProgress, 4.0)); 
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Starburst shape glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.5); 
    
    gl_FragColor = vec4(vColor, glow);
  }
`;

export const TreeParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const particleCount = 4500; 
  const treeHeight = 10;
  const maxRadius = 3.8;

  const { positions, colors, sizes, speeds, randomness } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    const spd = new Float32Array(particleCount);
    const rnd = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color('#cbd5e1'), // Slate 300 (Silver)
      new THREE.Color('#22d3ee'), // Cyan 400
      new THREE.Color('#60a5fa'), // Blue 400
      new THREE.Color('#facc15'), // Yellow 400
      new THREE.Color('#fbbf24'), // Amber 400
    ];

    for (let i = 0; i < particleCount; i++) {
      const relativeY = Math.random(); // 0 to 1
      const y = (relativeY * treeHeight) - (treeHeight / 2);
      
      // Structure: Galaxy arms logic for better volume
      const spiralArms = 7;
      const armAngle = (relativeY * 12.0) + (Math.PI * 2 * (i % spiralArms) / spiralArms);
      const angleRandomness = (Math.random() - 0.5) * 1.2; 
      const finalAngle = armAngle + angleRandomness;

      // Radius
      let radiusAtHeight = maxRadius * (1 - relativeY);
      // Volume: Bias towards outside but fill inside
      let r = (Math.random() * 0.3 + 0.7) * radiusAtHeight; 
      
      // Add random scattered particles (dust) to break the pattern
      if (Math.random() > 0.8) {
        r = Math.random() * radiusAtHeight;
      }

      pos[i * 3] = Math.cos(finalAngle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(finalAngle) * r;

      // Colors
      const isOrnament = Math.random() > 0.7;
      let color;
      
      if (isOrnament) {
          const isGold = Math.random() > 0.6;
          color = isGold 
            ? (Math.random() > 0.5 ? colorPalette[3] : colorPalette[4])
            : (Math.random() > 0.5 ? colorPalette[1] : colorPalette[2]);
      } else {
          color = colorPalette[0];
          color.lerp(colorPalette[2], 0.15); // Slightly bluer silver
      }

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // Sizes
      if (isOrnament) {
          siz[i] = Math.random() * 0.3 + 0.15; // Prominent ornaments
      } else {
          siz[i] = Math.random() * 0.1 + 0.03; // Fine dust
      }
      
      spd[i] = Math.random() * 0.5 + 0.5;
      rnd[i] = Math.random();
    }

    return {
      positions: pos,
      colors: col,
      sizes: siz,
      speeds: spd,
      randomness: rnd
    };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={particleCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={particleCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={particleCount} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={particleCount} array={randomness} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uTime: { value: 0 } }}
      />
    </points>
  );
};
