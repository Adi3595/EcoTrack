"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-container text-white hover:bg-primary-container/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "border border-outline-variant bg-surface/5 backdrop-blur-[20px] text-on-surface hover:bg-surface/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

// @ts-ignore
const MotionSlot = motion.create ? motion.create(Slot) : motion(Slot)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? MotionSlot : motion.button
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {asChild ? (
          children as React.ReactNode
        ) : (
          <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children as React.ReactNode}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
