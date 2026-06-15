import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularGaugeProps {
  value: number
  max: number
  className?: string
  size?: number
  strokeWidth?: number
}

export function CircularGauge({
  value,
  max,
  className,
  size = 120,
  strokeWidth = 12,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(value / max, 1)
  const offset = circumference - percentage * circumference

  let strokeColor = "text-primary"
  if (percentage < 0.33) strokeColor = "text-error"
  else if (percentage < 0.66) strokeColor = "text-amber-500"

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-surface-container-highest fill-none"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn("fill-none transition-all duration-1000 ease-in-out", strokeColor)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-display-lg-mobile font-bold text-on-surface">{value}</span>
        <span className="text-label-sm text-on-surface-variant uppercase">Score</span>
      </div>
    </div>
  )
}
