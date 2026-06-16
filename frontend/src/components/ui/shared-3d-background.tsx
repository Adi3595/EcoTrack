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

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      // Background moves slightly opposite to mouse
      xToBg(x * -15);
      yToBg(y * -15);

      // Fog moves more aggressively
      xToFog(x * 10);
      yToFog(y * 10);
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
        {/* Main Background Image */}
        <div 
          ref={bgRef}
          className="absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center opacity-40 will-change-transform"
          style={{ backgroundImage: 'url(/bg-dashboard.jpg)' }}
        />
        
        {/* Subtle Dynamic Fog/Light Layer */}
        <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none mix-blend-screen opacity-30 will-change-transform">
          <div ref={fogRef} className="absolute inset-0">
            <div className="dashboard-fog absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(149,212,179,0.15)_0%,_transparent_60%)]" />
          </div>
        </div>
      </div>
    </>
  );
}
