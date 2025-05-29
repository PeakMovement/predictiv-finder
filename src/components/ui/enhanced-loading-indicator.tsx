
import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { Skeleton } from "./skeleton";
import { WifiOff, Loader } from "lucide-react";
import { Alert, AlertDescription } from "./alert";

/**
 * Enhanced loading states for different scenarios
 */
export type LoadingState = 
  | "idle" 
  | "loading" 
  | "success" 
  | "error" 
  | "offline";

/**
 * Props for the EnhancedLoadingIndicator component
 */
export interface EnhancedLoadingIndicatorProps {
  /** Current loading state */
  state: LoadingState;
  /** Content to show when not loading */
  children?: React.ReactNode;
  /** Loading text to display */
  loadingText?: string;
  /** Error message to display */
  errorMessage?: string;
  /** Retry function for error states */
  onRetry?: () => void;
  /** Whether to show skeleton instead of spinner */
  showSkeleton?: boolean;
  /** Number of skeleton lines to show */
  skeletonLines?: number;
  /** Custom skeleton component */
  skeletonComponent?: React.ReactNode;
  /** Additional styling */
  className?: string;
  /** Minimum loading time to prevent flashing */
  minLoadingTime?: number;
}

/**
 * Enhanced loading indicator with multiple states and skeleton support
 */
export const EnhancedLoadingIndicator: React.FC<EnhancedLoadingIndicatorProps> = ({
  state,
  children,
  loadingText = "Loading...",
  errorMessage = "Something went wrong",
  onRetry,
  showSkeleton = false,
  skeletonLines = 3,
  skeletonComponent,
  className,
  minLoadingTime = 300
}) => {
  const [showLoading, setShowLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Handle minimum loading time to prevent flashing
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state === "loading") {
      timer = setTimeout(() => setShowLoading(true), minLoadingTime);
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, minLoadingTime]);

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline state
  if (!isOnline || state === "offline") {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Please check your connection and try again.
          </AlertDescription>
        </Alert>
        {children && (
          <div className="opacity-50 pointer-events-none">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className={cn("text-center py-8", className)}>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Loading state
  if (state === "loading" && showLoading) {
    if (showSkeleton) {
      return (
        <div className={cn("space-y-3", className)}>
          {skeletonComponent || (
            <>
              {Array.from({ length: skeletonLines }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className={cn(
                    "h-4 w-full",
                    i === skeletonLines - 1 && "w-3/4" // Last line shorter
                  )} 
                />
              ))}
            </>
          )}
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <Spinner size="md" className="mb-3" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  // Success state or idle - show children
  return <>{children}</>;
};

/**
 * Hook for managing loading states with automatic error handling
 */
export const useLoadingState = (initialState: LoadingState = "idle") => {
  const [state, setState] = React.useState<LoadingState>(initialState);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const setLoading = () => {
    setState("loading");
    setErrorMessage(null);
  };

  const setSuccess = () => {
    setState("success");
    setErrorMessage(null);
  };

  const setError = React.useCallback((message: string) => {
    setState("error");
    setErrorMessage(message);
  }, []);

  const setOffline = () => setState("offline");
  const reset = () => {
    setState("idle");
    setErrorMessage(null);
  };

  return {
    state,
    error: errorMessage,
    isLoading: state === "loading",
    isError: state === "error",
    isSuccess: state === "success",
    isOffline: state === "offline",
    setLoading,
    setSuccess,
    setError,
    setOffline,
    reset
  };
};
