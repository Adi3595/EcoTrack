"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-transparent pointer-events-none">
      {/* Dark underlying base with subtle grid */}
      <div className="absolute inset-0 bg-[#000804] opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
      
      {/* Primary glowing blob (Top Left) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen"
      />

      {/* Secondary glowing blob (Bottom Right) */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-900/40 blur-[150px] mix-blend-screen"
      />

      {/* Tertiary small accent blob (Center moving) */}
      <motion.div
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.1, 0.3, 0.1],
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-teal-500/10 blur-[100px] mix-blend-screen"
      />
    </div>
  );
}
