"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Shared3DBackground() {
  const bgRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 3D Mouse Parallax
    const xToBg = gsap.quickTo(bgRef.current, "x", { duration: 1.2, ease: "power3.out" });
    const yToBg = gsap.quickTo(bgRef.current, "y", { duration: 1.2, ease: "power3.out" });

    const xToFog = gsap.quickTo(fogRef.current, "x", { duration: 0.8, ease: "power3.out" });
    const yToFog = gsap.quickTo(fogRef.current, "y", { duration: 0.8, ease: "power3.out" });

    const xToParticles = gsap.quickTo(".dashboard-particles", "x", { duration: 0.5, ease: "power3.out" });
    const yToParticles = gsap.quickTo(".dashboard-particles", "y", { duration: 0.5, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Background moves slightly opposite to mouse
      xToBg(x * -15);
      yToBg(y * -15);

      // Fog moves more aggressively
      xToFog(x * 10);
      yToFog(y * 10);

      // Particles move fastest (closest to camera)
      xToParticles(x * 30);
      yToParticles(y * 30);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Infinite Fog Drift
    gsap.to(".dashboard-fog", {
      xPercent: 5,
      yPercent: 3,
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-10] overflow-hidden bg-[#001209]">
        {/* Main Background Image - Base Layer */}
        <div 
          ref={bgRef}
          className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center opacity-100 will-change-transform"
          style={{ backgroundImage: 'url(/bg-dashboard.jpg)' }}
        />
        
        {/* Watery Image Layer 1 - Blurred Refraction */}
        <div 
          className="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center opacity-50 mix-blend-overlay blur-[2px] will-change-transform animate-pulse"
          style={{ backgroundImage: 'url(/bg-dashboard.jpg)', animationDuration: '8s' }}
        />

        {/* Watery Image Layer 2 - Wave Distortion Simulation */}
        <div 
          className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center opacity-20 mix-blend-screen blur-[2px] will-change-transform"
          style={{ 
            backgroundImage: 'url(/bg-dashboard.jpg)',
            transform: 'scale(1.05)',
            animation: 'liquidWave 12s ease-in-out infinite alternate'
          }}
        />

        {/* Dynamic Animated CSS Waves - FULL SCREEN FLUIDITY */}
        <div className="absolute inset-0 h-screen pointer-events-none overflow-hidden mix-blend-overlay z-[-1]">
          {/* Wave 1 - Back (Slowest) */}
          <div className="absolute top-[-10%] left-0 w-[200vw] h-[120%] opacity-20 will-change-transform" style={{
            background: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" fill="%232dd4bf"/></svg>')`,
            backgroundSize: '50% 100%',
            animation: 'wave-move 20s linear infinite'
          }} />
          {/* Wave 2 - Middle */}
          <div className="absolute top-[10%] left-0 w-[200vw] h-[120%] opacity-20 will-change-transform" style={{
            background: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,60 C150,0 350,120 600,60 C850,0 1050,120 1200,60 L1200,120 L0,120 Z" fill="%2306b6d4"/></svg>')`,
            backgroundSize: '50% 100%',
            animation: 'wave-move 15s linear infinite'
          }} />
          {/* Wave 3 - Front (Fastest) */}
          <div className="absolute top-[30%] left-0 w-[200vw] h-[140%] opacity-30 will-change-transform" style={{
            background: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,30 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z" fill="%235eead4"/></svg>')`,
            backgroundSize: '50% 100%',
            animation: 'wave-move 10s linear infinite'
          }} />
        </div>

        {/* Subtle Dynamic Fog/Light Layer */}
        <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none mix-blend-screen opacity-30 will-change-transform">
          <div ref={fogRef} className="absolute inset-0">
            <div className="dashboard-fog absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(149,212,179,0.15)_0%,_transparent_60%)]" />
          </div>
        </div>

        {/* 3D Liquid Water Blobs */}
        <div className="absolute inset-[-20%] pointer-events-none overflow-hidden blur-[80px] opacity-40 mix-blend-screen z-[-1]">
          <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-primary/30 animate-liquid will-change-transform" />
          <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-[#a8e7c5]/20 animate-liquid will-change-transform" style={{ animationDelay: '-5s', animationDirection: 'reverse' }} />
          <div className="absolute top-[40%] left-[50%] w-[35vw] h-[35vw] bg-[#00ff88]/10 animate-liquid will-change-transform" style={{ animationDelay: '-10s' }} />
        </div>

        {/* 3D Floating Particles (CSS base64 noise/dots for depth) */}
        <div className="dashboard-particles absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none opacity-20 will-change-transform" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0'
        }} />
        <div className="dashboard-particles absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none opacity-10 will-change-transform scale-150" style={{
          backgroundImage: 'radial-gradient(rgba(149,212,179,0.5) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
          backgroundPosition: '20px 20px'
        }} />
      </div>
    </>
  );
}
