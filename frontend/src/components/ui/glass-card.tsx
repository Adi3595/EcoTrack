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
        "rounded-lg bg-surface/5 backdrop-blur-[20px] border border-outline-variant/50 shadow-[0_8px_32px_0_rgba(8,28,21,0.4)] relative overflow-hidden group",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {props.children as React.ReactNode}
    </motion.div>
  )
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
