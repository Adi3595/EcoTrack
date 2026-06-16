"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Leaf, Bot, Users, Trophy, Globe, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Magnetic } from '@/components/ui/magnetic';
import { TextReveal } from '@/components/ui/text-reveal';

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const HorizonHeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Layer Refs for Extreme 2.5D Volumetric Depth
  const bgSkyRef = useRef<HTMLDivElement>(null);      // Deepest (Sky)
  const bgMidRef = useRef<HTMLDivElement>(null);      // Midground (Mountains behind text)
  const fog1Ref = useRef<HTMLDivElement>(null);       // Volumetric Fog 1
  const fog2Ref = useRef<HTMLDivElement>(null);       // Volumetric Fog 2
  const fog3Ref = useRef<HTMLDivElement>(null);       // Volumetric Fog 3
  const fgTextRef = useRef<HTMLDivElement>(null);     // Text Layer
  const maskGroundRef = useRef<HTMLDivElement>(null); // Foreground (Ground overlapping text)
  const maskCloseRef = useRef<HTMLDivElement>(null);  // Extreme Foreground (Bottom edge)
  
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollProgressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

  // GSAP Mouse Tracking 3D Parallax
  useGSAP(() => {
    setIsReady(true);
    
    // QuickTo for 60fps tracking
    const xToSky = gsap.quickTo(bgSkyRef.current, "x", { duration: 1.2, ease: "power3.out" });
    const yToSky = gsap.quickTo(bgSkyRef.current, "y", { duration: 1.2, ease: "power3.out" });
    
    const xToMid = gsap.quickTo(bgMidRef.current, "x", { duration: 0.9, ease: "power3.out" });
    const yToMid = gsap.quickTo(bgMidRef.current, "y", { duration: 0.9, ease: "power3.out" });
    
    const xToFog1 = gsap.quickTo(fog1Ref.current, "x", { duration: 0.8, ease: "power3.out" });
    const yToFog1 = gsap.quickTo(fog1Ref.current, "y", { duration: 0.8, ease: "power3.out" });
    
    const xToFog2 = gsap.quickTo(fog2Ref.current, "x", { duration: 0.85, ease: "power3.out" });
    const yToFog2 = gsap.quickTo(fog2Ref.current, "y", { duration: 0.85, ease: "power3.out" });
    
    const xToFog3 = gsap.quickTo(fog3Ref.current, "x", { duration: 0.9, ease: "power3.out" });
    const yToFog3 = gsap.quickTo(fog3Ref.current, "y", { duration: 0.9, ease: "power3.out" });

    const xToText = gsap.quickTo(fgTextRef.current, "x", { duration: 0.7, ease: "power3.out" });
    const yToText = gsap.quickTo(fgTextRef.current, "y", { duration: 0.7, ease: "power3.out" });

    const xToGround = gsap.quickTo(maskGroundRef.current, "x", { duration: 0.5, ease: "power3.out" });
    const yToGround = gsap.quickTo(maskGroundRef.current, "y", { duration: 0.5, ease: "power3.out" });

    const xToClose = gsap.quickTo(maskCloseRef.current, "x", { duration: 0.3, ease: "power3.out" });
    const yToClose = gsap.quickTo(maskCloseRef.current, "y", { duration: 0.3, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;

      // Deep Sky moves very little and in reverse
      xToSky(x * -15);
      yToSky(y * -15);
      
      // Midground mountains move more in reverse
      xToMid(x * -40);
      yToMid(y * -40);
      
      // Fog layers move at different speeds
      xToFog1(x * -20);
      yToFog1(y * -20);
      
      xToFog2(x * 10);
      yToFog2(y * 10);
      
      xToFog3(x * -30);
      yToFog3(y * -30);

      // Text moves slightly WITH the mouse
      xToText(x * 20);
      yToText(y * 20);

      // Foreground ground moves extremely in reverse (pop out effect)
      xToGround(x * -90);
      yToGround(y * -90);

      // Extreme foreground edge moves the fastest
      xToClose(x * -150);
      yToClose(y * -150);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, { scope: containerRef });

  // Entrance Animations
  useGSAP(() => {
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

    // Infinite Fog Drift Animations
    gsap.to(".fog-inner-1", {
      xPercent: -15,
      yPercent: 10,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    gsap.to(".fog-inner-2", {
      xPercent: 20,
      yPercent: -15,
      duration: 25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    gsap.to(".fog-inner-3", {
      xPercent: -25,
      yPercent: 5,
      duration: 18,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

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
      
      // We apply vertical shift to background layers, but KEEP FOREGROUND PINNED
      if (bgSkyRef.current) {
        gsap.to(bgSkyRef.current, { yPercent: progress * 5, duration: 0.5, ease: "power2.out" });
      }
      if (bgMidRef.current) {
        gsap.to(bgMidRef.current, { yPercent: progress * 15, duration: 0.5, ease: "power2.out" });
      }
      if (fog1Ref.current) {
        gsap.to(fog1Ref.current, { yPercent: progress * 10, duration: 0.5, ease: "power2.out" });
      }
      if (fog2Ref.current) {
        gsap.to(fog2Ref.current, { yPercent: progress * 12, duration: 0.5, ease: "power2.out" });
      }
      if (fog3Ref.current) {
        gsap.to(fog3Ref.current, { yPercent: progress * 20, duration: 0.5, ease: "power2.out" });
      }
      // Foreground masks intentionally left out so they stay permanently locked to the screen 
      // preventing them from scrolling away and maintaining the deep 3D frame.
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
    <div ref={containerRef} className="relative w-full text-white bg-black font-sans selection:bg-primary/30">

      {/* 3D Scroll Experience Container */}
      <div className="relative w-full h-[300vh] overflow-hidden">
        
        {/* Layer 1: Deepest Background (Sky/Top) */}
        <div className="fixed inset-[-5%] w-[110%] h-[110%] z-0 pointer-events-none overflow-hidden">
          <div 
            ref={bgSkyRef}
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/bg-landscape.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transformOrigin: "center center",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 60%)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 60%)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
          </div>
        </div>

        {/* Layer 2: Midground (Mountains) */}
        <div className="fixed inset-[-10%] w-[120%] h-[120%] z-[1] pointer-events-none overflow-hidden">
          <div 
            ref={bgMidRef}
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/bg-landscape.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transformOrigin: "center center",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 85%)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 85%)"
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

        {/* Layer 2.1: Volumetric Fog 1 */}
        <div className="fixed inset-[-20%] w-[140%] h-[140%] z-[2] pointer-events-none mix-blend-screen opacity-60">
          <div ref={fog1Ref} className="absolute inset-0">
            <div className="fog-inner-1 absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(255,255,255,0.15)_0%,_transparent_60%)] blur-3xl" />
          </div>
        </div>

        {/* Layer 2.2: Volumetric Fog 2 */}
        <div className="fixed inset-[-20%] w-[140%] h-[140%] z-[3] pointer-events-none mix-blend-screen opacity-50">
          <div ref={fog2Ref} className="absolute inset-0">
            <div className="fog-inner-2 absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,_rgba(255,255,255,0.2)_0%,_transparent_50%)] blur-2xl" />
          </div>
        </div>

        {/* Layer 2.3: Volumetric Fog 3 */}
        <div className="fixed inset-[-20%] w-[140%] h-[140%] z-[4] pointer-events-none mix-blend-screen opacity-40">
          <div ref={fog3Ref} className="absolute inset-0">
            <div className="fog-inner-3 absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_rgba(149,212,179,0.1)_0%,_transparent_70%)] blur-[100px]" />
          </div>
        </div>

        {/* Side menu */}
        <div ref={menuRef} className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-12 z-20 invisible">
          <div className="flex flex-col gap-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity drop-shadow-xl">
            <span className="w-6 h-px bg-white block"></span>
            <span className="w-6 h-px bg-white block"></span>
            <span className="w-4 h-px bg-white block"></span>
          </div>
          <div className="rotate-180 [writing-mode:vertical-rl] tracking-[0.5em] text-xs font-semibold opacity-80 drop-shadow-xl">
            CLIMATE
          </div>
        </div>

        {/* Scroll progress indicator */}
        <div ref={scrollProgressRef} className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20 invisible">
          <div className="rotate-180 [writing-mode:vertical-rl] tracking-widest text-[10px] font-bold opacity-80 drop-shadow-xl">
            SCROLL
          </div>
          <div className="w-px h-32 bg-white/30 relative drop-shadow-xl">
            <div
              className="absolute top-0 left-0 w-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(149,212,179,0.8)]"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>
          <div className="text-xs font-mono opacity-90 drop-shadow-xl font-bold">
            {String(currentSection + 1).padStart(2, '0')} / {String(totalSections + 1).padStart(2, '0')}
          </div>
        </div>

        {/* Layer 3: Text Layer (Midground) */}
        <div ref={fgTextRef} className="relative z-10 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <section key={i} className="h-screen w-full flex flex-col items-center justify-center text-center px-6">
              <motion.h1 
                ref={(el) => { titleRefs.current[i] = el; }} 
                initial={{ y: 150, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
                className="text-6xl md:text-[120px] font-extrabold tracking-tighter leading-none mb-6 flex drop-shadow-[0_0_50px_rgba(0,0,0,0.9)]"
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
                <div className="text-xl md:text-3xl font-bold tracking-wide text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
                    <p className="subtitle-line">{subtitles[i].line1}</p>
                    <p className="subtitle-line">{subtitles[i].line2}</p>
                </div>
                <p className="subtitle-line text-sm md:text-lg text-white/90 leading-relaxed font-medium mt-6 max-w-2xl mx-auto drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
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
                      className="px-8 py-4 bg-primary text-[#001209] font-bold rounded-full text-lg shadow-[0_0_30px_rgba(149,212,179,0.5)] hover:shadow-[0_0_50px_rgba(149,212,179,0.8)] transition-all duration-300 transform hover:scale-105 inline-block backdrop-blur-md relative z-30"
                    >
                      Enter EcoTrack
                    </a>
                  </Magnetic>
                </motion.div>
              )}
            </section>
          ))}
        </div>

        {/* Layer 4: Foreground Mask (Ground, overlaps text) */}
        <div className="fixed inset-[-15%] w-[130%] h-[130%] z-20 pointer-events-none overflow-hidden">
          <div 
            ref={maskGroundRef}
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/bg-landscape.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transformOrigin: "center center",
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 45%)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 45%)"
            }}
          />
        </div>

        {/* Layer 5: Extreme Foreground Mask (Bottom edge popping out) */}
        <div className="fixed inset-[-20%] w-[140%] h-[140%] z-30 pointer-events-none overflow-hidden">
          <div 
            ref={maskCloseRef}
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/bg-landscape.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              transformOrigin: "center center",
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 25%)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 25%)"
            }}
          />
        </div>
      </div>

      {/* Sticky Navbar (appears on scroll) */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: scrollProgress > 0.3 ? 0 : -100, opacity: scrollProgress > 0.3 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-black/50 border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-2 drop-shadow-md">
          <Leaf className="text-primary h-6 w-6" /> EcoTrack
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-semibold text-white/90 hover:text-white transition-colors drop-shadow-md">Sign In</a>
          <a href="/login" className="px-5 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-[#001209] font-bold rounded-full text-sm border border-primary/50 transition-all duration-300 backdrop-blur-md">
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* Standard Content Flow below the 3D Experience */}
      <div className="relative z-10 bg-transparent w-full">

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
              &copy; {new Date().getFullYear()} EcoTrack AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
