"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Ripple {
  id: number
  x: number
  y: number
}

export function WaterRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Throttle ripple creation slightly based on distance or time to avoid too many DOM nodes
    const newRipple = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY
    }
    
    setRipples(prev => [...prev.slice(-40), newRipple]) // Keep max 40 ripples for a long trailing wake
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  // Clean up ripples after animation
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripples[0].id))
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [ripples])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ 
              opacity: 0.5, 
              scale: 0,
              x: "-50%",
              y: "-50%"
            }}
            animate={{ 
              opacity: 0, 
              scale: 3,
              x: "-50%",
              y: "-50%"
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2.5, 
              ease: "easeOut" 
            }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "3px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 0 40px rgba(149, 212, 179, 0.4), inset 0 0 40px rgba(149, 212, 179, 0.4)",
              backdropFilter: "blur(6px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
