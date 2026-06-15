"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Activity, Leaf, Bot, Users, Trophy, Globe, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Magnetic } from '@/components/ui/magnetic';
import { TextReveal } from '@/components/ui/text-reveal';

gsap.registerPlugin(ScrollTrigger);

export const HorizonHeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2; // 0, 1, 2 = 3 total sections

  const threeRefs = useRef<any>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 300,
    locations: []
  });

  // Initialize Three.js
  useEffect(() => {
    const initThree = () => {
      const refs = threeRefs.current;

      // Scene setup
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      // Renderer
      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true,
        alpha: true
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      // Post-processing
      refs.composer = new EffectComposer(refs.renderer);
      const renderPass = new RenderPass(refs.scene, refs.camera);
      refs.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,
        0.4,
        0.85
      );
      refs.composer.addPass(bloomPass);

      // Create scene elements
      createStarField();
      createNebula();
      createLights();
      createMountains();
      createAtmosphere();
      getLocation();

      // Start animation
      animate();

      setIsReady(true);
    };

    const createStarField = () => {
      const refs = threeRefs.current;
      const starCount = 5000;

      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2); // White-ish
          } else if (colorChoice < 0.9) {
            color.setHSL(0.4, 0.5, 0.8); // Primary (Green-ish)
          } else {
            color.setHSL(0.2, 0.5, 0.8); // Yellow-ish
          }

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i }
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;
            
            void main() {
              vColor = color;
              vec3 pos = position;
              
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              
              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const refs = threeRefs.current;
      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x053121) },
          color2: { value: new THREE.Color(0x95d4b3) },
          opacity: { value: 0.3 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createLights = () => {
      const refs = threeRefs.current;
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      refs.scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0x95d4b3, 2);
      mainLight.position.set(100, 200, 50);
      refs.scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0x0a192f, 3);
      fillLight.position.set(-100, 100, -100);
      refs.scene.add(fillLight);
    };

    const createMountains = () => {
      const refs = threeRefs.current;

      const geometry = new THREE.PlaneGeometry(4000, 4000, 200, 200);
      geometry.rotateX(-Math.PI / 2);

      const positionAttribute = geometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const z = positionAttribute.getZ(i);

        let y = Math.sin(x * 0.003) * Math.cos(z * 0.003) * 150;
        y += Math.sin(x * 0.01 + z * 0.02) * 50;
        y += Math.sin(x * 0.04) * Math.cos(z * 0.05) * 15;

        const distFromCenter = Math.abs(x);
        const valleyFactor = Math.min(1, distFromCenter / 600);

        y = (y * valleyFactor) - 100;

        positionAttribute.setY(i, y);
      }

      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: 0x053121,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true,
      });

      const terrain = new THREE.Mesh(geometry, material);
      terrain.position.z = -500;
      refs.scene.add(terrain);
      refs.mountains = [terrain];
    };

    const createAtmosphere = () => {
      const refs = threeRefs.current;
      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = vec3(0.0, 0.2, 0.1) * intensity;
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;
            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
    };

    const animate = () => {
      const refs = threeRefs.current;
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      refs.stars.forEach((starField: any) => {
        if (starField.material.uniforms) {
          starField.material.uniforms.time.value = time;
        }
      });

      if (refs.nebula && refs.nebula.material.uniforms) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const smoothingFactor = 0.05;
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;

        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;

        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((terrain: any) => {
        terrain.position.z = -1000 + (time * 50) % 500; // Fly forward effect
      });

      if (refs.composer) {
        refs.composer.render();
      }
    };

    initThree();

    const handleResize = () => {
      const refs = threeRefs.current;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      const refs = threeRefs.current;
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener('resize', handleResize);

      refs.stars.forEach((starField: any) => {
        starField.geometry.dispose();
        starField.material.dispose();
      });

      refs.mountains.forEach((mountain: any) => {
        mountain.geometry.dispose();
        mountain.material.dispose();
      });

      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        refs.nebula.material.dispose();
      }

      if (refs.renderer) refs.renderer.dispose();
    };
  }, []);

  const getLocation = () => {
    const refs = threeRefs.current;
    const locations: number[] = [];
    refs.mountains.forEach((mountain: any, i: number) => {
      locations[i] = mountain.position.z
    })
    refs.locations = locations
  }

  // GSAP Animations
  useEffect(() => {
    if (!isReady) return;

    gsap.set([menuRef.current, ...titleRefs.current, ...subtitleRefs.current, scrollProgressRef.current], {
      visibility: 'visible'
    });

    const tl = gsap.timeline();

    if (menuRef.current) {
      tl.from(menuRef.current, {
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    if (titleRefs.current[0]) {
      const titleChars = titleRefs.current[0]!.querySelectorAll('.title-char');
      tl.from(titleChars, {
        y: 200,
        opacity: 0,
        duration: 1.5,
        stagger: 0.05,
        ease: "power4.out"
      }, "-=0.5");
    }

    if (subtitleRefs.current[0]) {
      const subtitleLines = subtitleRefs.current[0]!.querySelectorAll('.subtitle-line');
      tl.from(subtitleLines, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      }, "-=0.8");
    }

    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power2.out"
      }, "-=0.5");
    }

    return () => {
      tl.kill();
    };
  }, [isReady]);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

      setScrollProgress(progress);
      const newSection = Math.floor(progress * totalSections);
      setCurrentSection(newSection);

      const refs = threeRefs.current;

      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      const cameraPositions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 }
      ];

      const currentPos = cameraPositions[newSection] || cameraPositions[0];
      const nextPos = cameraPositions[newSection + 1] || currentPos;

      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;

      refs.mountains.forEach((terrain: any) => {
        if (progress > 0.7) {
          terrain.position.y = -600000; // Hide when fully scrolled down
        } else {
          terrain.position.y = 0;
        }
      });
      if (refs.nebula) {
        refs.nebula.position.z = -1050 + progress * 500;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  const titles = ['ECOTRACK', 'AUTOMATED', 'NET ZERO'];
  const subtitles = [
    {
      line1: 'Where vision meets reality,',
      line2: 'we shape the future of tomorrow.',
      paragraph: 'EcoTrack V2 is live. Experience the ultimate platform for analyzing your mobility patterns and energy consumption. Reach net-zero effortlessly with real-time AI guidance.'
    },
    {
      line1: 'AI-driven insights analyzing',
      line2: 'your mobility and energy data.',
      paragraph: 'Connect your mobility apps or upload receipts to instantly track your footprint. Our advanced AI identifies high-emission patterns and suggests personalized, actionable alternatives.'
    },
    {
      line1: 'Start tracking today and',
      line2: 'reach carbon neutrality effortlessly.',
      paragraph: 'Compete with friends, join global challenges, and earn exclusive rewards for making sustainable choices. The journey to zero emissions starts here.'
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full text-white bg-[#001209] font-sans selection:bg-primary/30">

      {/* 3D Scroll Experience Container */}
      <div className="relative w-full h-[300vh]">
        {/* Fixed Canvas */}
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

        {/* Side menu */}
        <div ref={menuRef} className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 z-20 invisible">
          <div className="flex flex-col gap-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
            <span className="w-6 h-px bg-white block"></span>
            <span className="w-6 h-px bg-white block"></span>
            <span className="w-4 h-px bg-white block"></span>
          </div>
          <div className="rotate-180 [writing-mode:vertical-rl] tracking-[0.5em] text-xs font-semibold opacity-50">
            CLIMATE
          </div>
        </div>

        {/* Scroll progress indicator */}
        <div ref={scrollProgressRef} className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20 invisible">
          <div className="rotate-180 [writing-mode:vertical-rl] tracking-widest text-[10px] font-bold opacity-50">
            SCROLL
          </div>
          <div className="w-px h-32 bg-white/20 relative">
            <div
              className="absolute top-0 left-0 w-full bg-primary transition-all duration-300"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
          <div className="text-xs font-mono opacity-70">
            {String(currentSection + 1).padStart(2, '0')} / {String(totalSections + 1).padStart(2, '0')}
          </div>
        </div>

        {/* Scroll Sections Overlay */}
        <div className="relative z-10 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <section key={i} className="h-screen w-full flex flex-col items-center justify-center text-center px-6">
              <motion.h1 
                ref={(el) => { titleRefs.current[i] = el; }} 
                initial={{ y: 150, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                className="text-6xl md:text-[120px] font-extrabold tracking-tighter leading-none mb-6 flex drop-shadow-2xl"
              >
                <TextReveal text={titles[i]} delay={0.1 * i} />
              </motion.h1>
          
              <motion.div 
                ref={(el) => { subtitleRefs.current[i] = el; }} 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
                className="space-y-4 max-w-3xl"
              >
                <div className="text-xl md:text-3xl font-light tracking-wide text-white/90 drop-shadow-md">
                    <p className="subtitle-line">{subtitles[i].line1}</p>
                    <p className="subtitle-line">{subtitles[i].line2}</p>
                </div>
                <p className="subtitle-line text-sm md:text-lg text-white/60 leading-relaxed font-normal mt-6 max-w-2xl mx-auto drop-shadow-sm">
                    {subtitles[i].paragraph}
                </p>
              </motion.div>
              
              {i === 2 && (
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
                  className="mt-12 pointer-events-auto"
                >
                  <Magnetic strength={0.3}>
                    <a 
                      href="/login" 
                      className="px-8 py-4 bg-primary text-[#001209] font-bold rounded-full text-lg shadow-[0_0_20px_rgba(149,212,179,0.3)] hover:shadow-[0_0_40px_rgba(149,212,179,0.6)] transition-all duration-300 transform hover:scale-105 inline-block"
                    >
                      Enter EcoTrack
                    </a>
                  </Magnetic>
                </motion.div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Sticky Navbar (appears on scroll) */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: scrollProgress > 0.3 ? 0 : -100, opacity: scrollProgress > 0.3 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-[#001209]/70 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2">
          <Leaf className="text-primary h-6 w-6" /> EcoTrack
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">Sign In</a>
          <a href="/login" className="px-5 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-[#001209] font-bold rounded-full text-sm border border-primary/50 transition-all duration-300">
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* Standard Content Flow below the 3D Experience */}
      <div className="relative z-10 bg-[#001209] w-full border-t border-primary/10">

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

        {/* Animated Features Grid */}
        <section className="px-6 py-32 max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
              Everything you need. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Nothing you don't.</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">The ultimate toolkit for tracking, optimizing, and drastically reducing your carbon footprint through the power of Artificial Intelligence.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Live Tracking", desc: "Monitor your daily carbon footprint across all your activities in real-time, pulling data securely from your mobility apps.", icon: Activity, delay: 0.1 },
              { title: "Smart AI Insights", desc: "Interact with Zap, your personal sustainability coach, to get tailored, AI-driven recommendations to reduce emissions.", icon: Bot, delay: 0.3 },
              { title: "Eco Challenges", desc: "Compete with friends, climb the global leaderboard, and earn real rewards for making environmentally conscious choices.", icon: Trophy, delay: 0.5 }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: feat.delay }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="p-8 h-full rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:border-primary/50 transition-colors shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />

                <div className="h-14 w-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-primary mb-8 shadow-[0_0_15px_rgba(149,212,179,0.2)]">
                  <feat.icon className="w-7 h-7" />
                </div>
                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5 inline-block">Feature</span>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-white/60 leading-relaxed text-base">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-32 bg-black/50 relative border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">How EcoTrack Works</h2>
              <p className="text-white/60 text-lg">Three simple steps to net-zero.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Decorative line connecting steps */}
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent w-2/3 mx-auto" />

              {[
                { step: "01", title: "Connect & Track", desc: "Upload receipts or connect transport apps to automatically log your emissions.", icon: Zap },
                { step: "02", title: "AI Analysis", desc: "Our proprietary AI analyzes your data to find high-impact areas for reduction.", icon: Bot },
                { step: "03", title: "Offset & Earn", desc: "Complete daily tasks to offset remaining emissions and earn real rewards.", icon: ShieldCheck }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  <div className="w-24 h-24 rounded-full bg-[#001209] border-2 border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(149,212,179,0.1)] relative">
                    <div className="absolute -top-3 -right-3 text-4xl font-black text-white/5">{item.step}</div>
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 text-base max-w-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="px-6 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 mix-blend-screen" />
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { value: "50K+", label: "kg CO2 Offset" },
              { value: "10K+", label: "Active Users" },
              { value: "1M+", label: "Activities Tracked" },
              { value: "99%", label: "AI Accuracy" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-2 drop-shadow-lg">{stat.value}</div>
                <div className="text-sm md:text-base font-bold text-primary uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enhanced Footer CTA */}
        <section className="py-32 relative overflow-hidden text-center px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10 border-t border-primary/20" />

          {/* Glowing Orbs for CTA */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 mix-blend-screen pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] -translate-y-1/2 mix-blend-screen pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative max-w-3xl mx-auto z-10"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter">Ready to make an <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">impact?</span></h2>
            <p className="text-xl md:text-2xl text-white/60 mb-12 font-light">Join thousands of others tracking and reducing their emissions today.</p>

              <Magnetic strength={0.4}>
                <a href="/login" className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-[#001209] font-black rounded-full text-lg hover:bg-primary transition-all duration-300 overflow-hidden transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(149,212,179,0.5)]">
                  <span className="relative z-10 flex items-center gap-2">Start for free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </a>
              </Magnetic>
          </motion.div>
        </section>

        {/* Minimal Footer */}
        <footer className="border-t border-white/10 py-12 px-6 bg-black relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-xl font-extrabold text-white">
              <Leaf className="text-primary h-5 w-5" /> EcoTrack
            </div>
            <div className="text-white/40 text-sm font-medium">
              © 2026 EcoTrack. All rights reserved. Building a sustainable future.
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
};
