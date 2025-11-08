import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

interface ParticleWaveLoaderProps {
  onComplete?: () => void;
}

export function ParticleWaveLoader({ onComplete }: ParticleWaveLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = 300;
    const height = 300;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Particle system
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Color gradient: electric blue -> violet -> magenta
    const colorStops = [
      new THREE.Color(0x00d4ff), // Electric blue
      new THREE.Color(0x8b5cf6), // Violet
      new THREE.Color(0xff00ff), // Magenta
    ];

    // Initialize particles in a blob-like formation
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Create blob shape using spherical coordinates with noise
      const radius = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Gradient colors
      const colorIndex = Math.floor((i / particleCount) * colorStops.length);
      const nextColorIndex = Math.min(colorIndex + 1, colorStops.length - 1);
      const t = ((i / particleCount) * colorStops.length) % 1;
      
      const color = colorStops[colorIndex].clone().lerp(colorStops[nextColorIndex], t);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for glow effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        
        void main() {
          vColor = color;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular particle with soft glow
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Soft glow falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.0);
          
          // Add outer glow
          float glow = exp(-dist * 8.0) * 0.8;
          
          vec3 finalColor = vColor * (alpha + glow);
          gl_FragColor = vec4(finalColor, alpha + glow * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation
    let time = 0;
    const animate = () => {
      time += 0.016;
      
      const positions = geometry.attributes.position.array as Float32Array;
      
      // Morphing wave animation
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Calculate base position
        const theta = Math.atan2(y, x);
        const phi = Math.acos(z / Math.sqrt(x * x + y * y + z * z));
        const baseRadius = 30 + Math.random() * 20;
        
        // Apply multiple wave functions for organic movement
        const wave1 = Math.sin(phi * 3 + time) * 5;
        const wave2 = Math.cos(theta * 2 + time * 0.7) * 3;
        const wave3 = Math.sin(time * 0.5) * 2;
        const pulse = Math.sin(time * 2) * 2;
        
        const radius = baseRadius + wave1 + wave2 + wave3 + pulse;
        
        // Update positions with smooth morphing
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation
      particles.rotation.y += 0.002;
      particles.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      // Update shader time
      (material.uniforms.time as any).value = time;
      
      renderer.render(scene, camera);
      const animationId = requestAnimationFrame(animate);
      
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    const animationId = requestAnimationFrame(animate);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      animationId,
    };

    // Cleanup
    return () => {
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        container.removeChild(sceneRef.current.renderer.domElement);
        sceneRef.current.renderer.dispose();
        sceneRef.current.scene.clear();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)",
          borderRadius: "12px",
          boxShadow: "0 0 60px rgba(139, 92, 246, 0.3), 0 0 120px rgba(0, 212, 255, 0.2)",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: [
            "0 0 40px rgba(139, 92, 246, 0.4)",
            "0 0 80px rgba(0, 212, 255, 0.6)",
            "0 0 40px rgba(255, 0, 255, 0.4)",
            "0 0 40px rgba(139, 92, 246, 0.4)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          borderRadius: "12px",
        }}
      />
    </motion.div>
  );
}
