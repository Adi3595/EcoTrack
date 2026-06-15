import * as React from "react"
import { cn } from "@/lib/utils"

export interface CarbonChipProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: "low" | "mid" | "high" | "neutral"
}

const CarbonChip = React.forwardRef<HTMLDivElement, CarbonChipProps>(
  ({ className, level = "neutral", children, ...props }, ref) => {
    const levelColors = {
      low: "bg-error/10 text-error border-error/20",
      mid: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      high: "bg-primary/10 text-primary border-primary/20",
      neutral: "bg-surface-tint/10 text-on-surface-variant border-surface-tint/20",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          levelColors[level],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CarbonChip.displayName = "CarbonChip"

export { CarbonChip }
