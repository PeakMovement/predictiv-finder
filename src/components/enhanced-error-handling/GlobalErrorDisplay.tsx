
import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling/planGenerationError';
import { isPlanGenerationError } from '@/utils/planGenerator/errorHandling';

export interface GlobalErrorDisplayProps {
  error: Error | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  autoHideAfter?: number;
}

/**
 * Enhanced global error display with offline detection and network-aware messaging
 */
export const GlobalErrorDisplay: React.FC<GlobalErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  className,
  autoHideAfter
}) => {
  const { toast } = useToast();
  const { isOffline, isOnline } = useOfflineStatus();
  
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
  
  // Check if this is a network-related error
  const isNetworkError = error.message.toLowerCase().includes('network') || 
                         error.message.toLowerCase().includes('fetch') ||
                         error.message.toLowerCase().includes('connection') ||
                         isOffline;
  
  // Extract error information
  const isPlanError = isPlanGenerationError(error);
  const errorType = isPlanError ? (error as any).type : PlanGenerationErrorType.UNEXPECTED;
  const userMessage = isPlanError ? (error as any).userMessage : error.message;
  
  // Tailor the error message based on error type and network status
  const getErrorTitle = () => {
    if (isOffline) {
      return "You're Offline";
    }
    
    if (isNetworkError) {
      return "Connection Problem";
    }
    
    switch (errorType) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return "Please Check Your Input";
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return "Unable to Process Health Information";
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return "Service Matching Issue";
      case PlanGenerationErrorType.EXTERNAL_SERVICE:
        return "Service Unavailable";
      default:
        return "Something Went Wrong";
    }
  };

  const getErrorMessage = () => {
    if (isOffline) {
      return "Please check your internet connection. Your data will be saved when you're back online.";
    }
    
    if (isNetworkError) {
      return "We're having trouble connecting to our services. Please check your connection and try again.";
    }
    
    return userMessage;
  };

  const getErrorIcon = () => {
    if (isOffline || isNetworkError) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getRetryButtonText = () => {
    if (isOffline) {
      return "Offline - Check Connection";
    }
    return "Try Again";
  };
  
  // Display the error as a toast notification as well (but only once)
  React.useEffect(() => {
    if (error) {
      toast({
        title: getErrorTitle(),
        description: getErrorMessage(),
        variant: "destructive",
        action: (onRetry && isOnline) ? (
          <Button size="sm" onClick={onRetry} disabled={isOffline}>
            {getRetryButtonText()}
          </Button>
        ) : undefined
      });
    }
  }, [error, isOffline]); // Add isOffline dependency to update toast when status changes

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg shadow-md p-4 mb-4 ${className || ''}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            {getErrorIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              {getErrorTitle()}
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-200">
              <p>{getErrorMessage()}</p>
              {isOffline && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-300">
                  Some features may be limited while offline.
                </p>
              )}
            </div>
            <div className="mt-3 flex gap-x-2">
              {onRetry && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
                  onClick={onRetry}
                  disabled={isOffline}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isOffline ? 'opacity-50' : ''}`} />
                  {getRetryButtonText()}
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

export default GlobalErrorDisplay;
