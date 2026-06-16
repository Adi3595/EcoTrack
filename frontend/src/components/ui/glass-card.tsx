"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

export interface GlassCardProps extends HTMLMotionProps<"div"> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-[2rem] bg-surface/5 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(8,28,21,0.4),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden group animate-breathe",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />
      <div className="relative z-10">{props.children as React.ReactNode}</div>
    </motion.div>
  )
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
