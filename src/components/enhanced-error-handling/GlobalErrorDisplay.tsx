
import React from 'react';
import { AlertCircle, RefreshCw, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling/planGenerationError';

// Import isPlanGenerationError from the correct location
import { isPlanGenerationError } from '@/utils/planGenerator/errorHandling/index';

export interface GlobalErrorDisplayProps {
  error: Error | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  autoHideAfter?: number; // in milliseconds
}

/**
 * A consistent global error display component that can be used throughout the app
 */
export const GlobalErrorDisplay: React.FC<GlobalErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  className,
  autoHideAfter
}) => {
  const { toast } = useToast();
  
  // Auto-hide after specified duration
  React.useEffect(() => {
    if (error && autoHideAfter && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoHideAfter, onDismiss]);
  
  // If there's no error, don't render anything
  if (!error) return null;
  
  // Extract error information (specialized for PlanGenerationError if applicable)
  const isPlanError = isPlanGenerationError(error);
  const errorType = isPlanError ? (error as any).type : PlanGenerationErrorType.UNEXPECTED;
  const userMessage = isPlanError ? (error as any).userMessage : error.message;
  
  // Tailor the error message based on error type
  const getErrorTitle = () => {
    switch (errorType) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return "Please Check Your Input";
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return "Unable to Process Health Information";
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return "Service Matching Issue";
      case PlanGenerationErrorType.EXTERNAL_SERVICE: // We'll add this to the enum
        return "Connection Error";
      default:
        return "Something Went Wrong";
    }
  };
  
  // Display the error as a toast notification as well
  React.useEffect(() => {
    if (error) {
      toast({
        title: getErrorTitle(),
        description: userMessage,
        variant: "destructive",
        action: onRetry ? <Button size="sm" onClick={onRetry}>Retry</Button> : undefined
      });
    }
  }, [error, toast, onRetry]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg shadow-md p-4 mb-4 ${className}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              {getErrorTitle()}
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-200">
              <p>{userMessage}</p>
            </div>
            <div className="mt-3 flex gap-x-2">
              {onRetry && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                  onClick={onRetry}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                  onClick={onDismiss}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook to manage global error state throughout the app
 */
export const useGlobalError = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const showError = (newError: Error | string) => {
    if (typeof newError === 'string') {
      setError(new Error(newError));
    } else {
      setError(newError);
    }
  };
  
  const clearError = () => setError(null);
  
  return {
    error,
    showError,
    clearError
  };
};

export default GlobalErrorDisplay;
