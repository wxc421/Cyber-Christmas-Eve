import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  attribute float aSize;
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aTilt;
  
  varying vec3 vColor;
  
  // Rotation matrix helper
  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  void main() {
    // Standard Growth Logic (Must match TreeParticles)
    float startY = -6.0;
    float speed = 3.0;
    float delay = 0.5;
    float currentY = startY + max(0.0, uTime - delay) * speed;
    
    // Base Position
    vec3 pos = vec3(0.0);
    
    // Base ring rotation
    float angle = aAngle + uTime * aSpeed;
    
    // Calculate Ring Shape with Tilt
    // We start flat (y=0) then apply tilt
    float x = cos(angle) * aRadius;
    float z = sin(angle) * aRadius;
    float y = 0.0;
    
    // Apply Tilt around X axis based on aTilt
    // This makes rings look like atomic orbits or gyroscope
    float s = sin(aTilt);
    float c = cos(aTilt);
    float ty = y * c - z * s;
    float tz = y * s + z * c;
    z = tz;
    y = ty;
    
    // Set final position relative to tree height (handled in JS generation, passed in position.y attribute logic)
    // Wait, we need the base Y for the ring. Let's pass it in via a separate attribute or use the generated position.
    // The geometry passed in 'position' contains the center Y of the ring.
    vec3 centerPos = position; 
    
    pos = vec3(x, centerPos.y + y, z);
    
    // --- ANIMATION: Same Spiral-In as Tree ---
    float settleProgress = smoothstep(0.0, 2.5, currentY - pos.y);
    float visible = step(pos.y, currentY);

    float expansion = mix(3.5, 1.0, pow(settleProgress, 0.5));
    float entranceRotation = (1.0 - pow(settleProgress, 0.5)) * 2.0;

    pos.xz *= expansion;
    pos.xz *= rotate2d(entranceRotation);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size logic
    float appearScale = smoothstep(0.0, 0.5, settleProgress);
    gl_PointSize = aSize * visible * appearScale * (400.0 / -mvPosition.z);
    
    // Color logic: Bright Cyan/White rings with a pulse
    float pulse = sin(uTime * 3.0 + aAngle * 2.0) * 0.2 + 0.8;
    vColor = vec3(0.4, 0.8, 1.0) * pulse;
    
    // Bright flash on enter
    vColor += vec3(1.0) * (1.0 - settleProgress) * 0.5;
  }
`;

const FRAGMENT_SHADER = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Soft ring particle
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, glow);
  }
`;

export const StarRings: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Configuration
  const ringCount = 8; // More rings
  const particlesPerRing = 120;
  const totalParticles = ringCount * particlesPerRing;
  const treeHeight = 10;
  const maxRadius = 3.8; // Match tree max radius

  const { positions, sizes, angles, radii, speeds, tilts } = useMemo(() => {
    const pos = new Float32Array(totalParticles * 3);
    const siz = new Float32Array(totalParticles);
    const ang = new Float32Array(totalParticles);
    const rad = new Float32Array(totalParticles);
    const spd = new Float32Array(totalParticles);
    const tlt = new Float32Array(totalParticles);

    let idx = 0;
    for (let r = 0; r < ringCount; r++) {
      // Calculate height for this ring
      const relativeY = r / (ringCount - 1); 
      // Adjusted height distribution to match tree body better
      const y = (relativeY * treeHeight * 0.85) - (treeHeight / 2) + 0.5; 
      
      // Radius: Hug the tree closely. 
      // Tree radius formula approx: maxRadius * (1 - relativeY)
      // We add a small offset (+0.2) to hover just outside
      const ringRadius = (maxRadius * (1 - relativeY)) + 0.2; 

      // Alternate tilts for a dynamic look (every other ring tilts opposite way)
      // Or random small tilts
      const ringTilt = (Math.random() - 0.5) * 0.3; // Small tilt +/- 0.15 rad (~8 degrees)

      const ringSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3);

      for (let p = 0; p < particlesPerRing; p++) {
        const i = idx + p;
        
        // Store center Y in position
        pos[i * 3] = 0;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = 0;
        
        // Attributes for shader animation
        ang[i] = (p / particlesPerRing) * Math.PI * 2;
        rad[i] = ringRadius;
        spd[i] = ringSpeed;
        tlt[i] = ringTilt;
        siz[i] = Math.random() * 0.2 + 0.1; // Slightly larger particles
      }
      idx += particlesPerRing;
    }

    return { positions: pos, sizes: siz, angles: ang, radii: rad, speeds: spd, tilts: tlt };
  }, []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={totalParticles} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={totalParticles} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aAngle" count={totalParticles} array={angles} itemSize={1} />
        <bufferAttribute attach="attributes-aRadius" count={totalParticles} array={radii} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={totalParticles} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aTilt" count={totalParticles} array={tilts} itemSize={1} />
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
