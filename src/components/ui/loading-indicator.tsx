
import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

/**
 * Props for the LoadingIndicator component
 * 
 * @interface LoadingIndicatorProps
 * @property {boolean} isLoading - Whether the component is in loading state
 * @property {string} [loadingText] - Optional text to display while loading
 * @property {boolean} [showSpinner] - Whether to show a spinner
 * @property {React.ReactNode} [children] - Content to render when not loading
 * @property {string} [className] - Optional additional styling
 * @property {boolean} [preserveSpace] - Whether to keep space for content even while loading
 * @property {"sm" | "md" | "lg"} [spinnerSize] - Size of the spinner
 */
export interface LoadingIndicatorProps {
  /** Whether the component is in loading state */
  isLoading: boolean;
  /** Optional text to display while loading */
  loadingText?: string;
  /** Whether to show a spinner */
  showSpinner?: boolean;
  /** Content to render when not loading */
  children?: React.ReactNode;
  /** Optional additional styling */
  className?: string;
  /** Whether to keep space for content even while loading (prevents layout shifts) */
  preserveSpace?: boolean;
  /** Size of the spinner */
  spinnerSize?: "sm" | "md" | "lg";
}

/**
 * Loading indicator component that shows a spinner and/or text while content is loading
 * Handles showing children when not in loading state
 *
 * @example
 * ```tsx
 * <LoadingIndicator isLoading={isLoading} loadingText="Fetching data...">
 *   <MyContent />
 * </LoadingIndicator>
 * ```
 */
export const LoadingIndicator = ({
  isLoading,
  loadingText = "Loading...",
  showSpinner = true,
  children,
  className,
  preserveSpace = false,
  spinnerSize = "md"
}: LoadingIndicatorProps) => {
  // If not loading, render children normally
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-2 sm:p-4",
        className
      )}
      aria-busy={true}
      aria-live="polite"
    >
      {showSpinner && (
        <Spinner size={spinnerSize} className="mb-2" />
      )}
      
      {loadingText && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{loadingText}</p>
      )}
      
      {preserveSpace && children && (
        <div className="invisible" aria-hidden="true">{children}</div>
      )}
    </div>
  );
};

/**
 * Progress bar component that visualizes completion percentage
 * Color changes based on progress value
 * 
 * @example
 * ```tsx
 * <ProgressBar value={75} className="my-4" />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {number} props.value - Progress value (0-100)
 * @param {string} [props.className] - Optional additional styling
 * @returns {JSX.Element} Progress bar component
 */
export const ProgressBar = ({ 
  value = 0, 
  className 
}: { 
  value: number;
  className?: string;
}) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div 
      className={cn(
        "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-in-out",
          clampedValue < 30 ? "bg-health-purple" : 
          clampedValue < 70 ? "bg-health-teal" :
          "bg-health-orange"
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
