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
    
    setRipples(prev => [...prev.slice(-15), newRipple]) // Keep max 15 ripples at a time
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
      }, 1000)
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
              scale: 2,
              x: "-50%",
              y: "-50%"
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut" 
            }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(2px)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
