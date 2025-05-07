
import React from "react";
import { cn } from "@/lib/utils";
import { Loader, LoaderCircle } from "lucide-react";

/**
 * Props for the Spinner component
 * 
 * @interface SpinnerProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @property {"sm" | "md" | "lg"} [size] - Size of the spinner (small, medium, large)
 * @property {"circle" | "dots" | "default"} [variant] - Visual style of the spinner
 */
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "circle" | "dots" | "default";
}

/**
 * Spinner component for indicating loading states
 * Supports multiple sizes and visual variants
 *
 * @example
 * ```tsx
 * <Spinner size="md" variant="circle" className="text-primary" />
 * ```
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8"
    };

    // Classic border spinner (default)
    if (variant === "default") {
      return (
        <div 
          ref={ref}
          className={cn(
            "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
            sizeClasses[size],
            className
          )}
          role="status"
          aria-label="loading"
          {...props}
        />
      );
    }

    // Lucide circle spinner
    if (variant === "circle") {
      return (
        <div ref={ref} className={cn("inline-flex", className)} role="status" aria-label="loading" {...props}>
          <LoaderCircle className={cn("animate-spin", sizeClasses[size])} />
        </div>
      );
    }

    // Dots spinner
    if (variant === "dots") {
      return (
        <div 
          ref={ref}
          className={cn("flex items-center gap-1", className)} 
          role="status" 
          aria-label="loading"
          {...props}
        >
          <span className={`w-1.5 h-1.5 rounded-full bg-current animate-bounce`} style={{ animationDelay: "0ms" }}></span>
          <span className={`w-1.5 h-1.5 rounded-full bg-current animate-bounce`} style={{ animationDelay: "150ms" }}></span>
          <span className={`w-1.5 h-1.5 rounded-full bg-current animate-bounce`} style={{ animationDelay: "300ms" }}></span>
        </div>
      );
    }

    // Fallback to default Lucide loader
    return (
      <div ref={ref} className={cn("inline-flex", className)} role="status" aria-label="loading" {...props}>
        <Loader className={cn("animate-spin", sizeClasses[size])} />
      </div>
    );
  }
);

Spinner.displayName = "Spinner";
