
import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

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
        "flex flex-col items-center justify-center p-4",
        className
      )}
    >
      {showSpinner && (
        <Spinner size={spinnerSize} className="mb-2" />
      )}
      
      {loadingText && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{loadingText}</p>
      )}
      
      {preserveSpace && children && (
        <div className="invisible">{children}</div>
      )}
    </div>
  );
};

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
