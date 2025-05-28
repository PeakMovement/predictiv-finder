
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        silver: "border-transparent bg-modern-silver-100 text-modern-charcoal-700 hover:bg-modern-silver-200 dark:bg-modern-silver-800 dark:text-modern-silver-100",
        charcoal: "border-transparent bg-modern-charcoal-100 text-modern-charcoal-800 hover:bg-modern-charcoal-200 dark:bg-modern-charcoal-700 dark:text-modern-charcoal-100",
        accent: "border-transparent bg-modern-silver-200 text-modern-charcoal-700 hover:bg-modern-silver-300 dark:bg-modern-charcoal-600 dark:text-modern-silver-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
