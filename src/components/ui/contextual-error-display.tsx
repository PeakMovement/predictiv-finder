
import React, { useRef, useEffect } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppStage } from '@/types/app';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContextualErrorDisplayProps {
  error: string | null;
  currentStage: AppStage;
  onRetry?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const stageContexts: Record<AppStage, {
  action: string;
  suggestions: string[];
  fallbackActions: string[];
}> = {
  'home': {
    action: 'loading the application',
    suggestions: ['Refresh the page', 'Check your internet connection'],
    fallbackActions: ['Try again in a few moments']
  },
  'category-selector': {
    action: 'loading health categories',
    suggestions: ['Select at least one category to continue', 'Try refreshing the categories'],
    fallbackActions: ['Start over with AI assistant', 'Contact support if issue persists']
  },
  'category-questionnaire': {
    action: 'processing your questionnaire',
    suggestions: ['Complete all required fields', 'Check your answers for clarity'],
    fallbackActions: ['Go back to category selection', 'Try the AI assistant instead']
  },
  'practitioner-list': {
    action: 'finding matching practitioners',
    suggestions: ['Adjust your criteria', 'Try different categories'],
    fallbackActions: ['Use AI assistant for recommendations', 'Browse all categories']
  },
  'ai-input': {
    action: 'processing your health query',
    suggestions: ['Provide more specific health details', 'Describe your symptoms clearly'],
    fallbackActions: ['Try the category selector instead', 'Refresh and try again']
  },
  'ai-plans': {
    action: 'generating your health plans',
    suggestions: ['Make sure your query is health-related', 'Include specific symptoms or goals'],
    fallbackActions: ['Revise your health query', 'Try the practitioner finder']
  },
  'plan-details': {
    action: 'loading plan details',
    suggestions: ['Go back and select a different plan', 'Try refreshing the plan'],
    fallbackActions: ['View all plans again', 'Start a new search']
  }
};

export const ContextualErrorDisplay: React.FC<ContextualErrorDisplayProps> = ({
  error,
  currentStage,
  onRetry,
  onBack,
  onHome,
  onDismiss,
  className = ''
}) => {
  const { isOffline } = useOfflineStatus();
  const isMobile = useIsMobile();
  const context = stageContexts[currentStage];
  const errorRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (error && errorRef.current) {
      // Announce error to screen readers
      errorRef.current.focus();
    }
  }, [error]);

  if (!error) return null;

  const isNetworkError = error.toLowerCase().includes('network') || 
                         error.toLowerCase().includes('fetch') ||
                         error.toLowerCase().includes('connection') ||
                         isOffline;

  const getErrorTitle = () => {
    if (isOffline) return "You're Offline";
    if (isNetworkError) return "Connection Problem";
    return `Error ${context.action}`;
  };

  const getErrorMessage = () => {
    if (isOffline) {
      return `Cannot complete ${context.action} while offline. Your progress is saved and will sync when you're back online.`;
    }
    if (isNetworkError) {
      return `We're having trouble ${context.action}. Please check your connection and try again.`;
    }
    return error;
  };

  const getSuggestions = () => {
    if (isOffline || isNetworkError) {
      return ['Check your internet connection', 'Try again when back online'];
    }
    return context.suggestions;
  };

  const getRecoveryActions = () => {
    const actions = [];
    
    if (onRetry && !isOffline) {
      actions.push({
        label: 'Try Again',
        action: onRetry,
        icon: RefreshCw,
        variant: 'default' as const,
        description: 'Retry the last action'
      });
    }

    if (onBack && currentStage !== 'home') {
      actions.push({
        label: isMobile ? 'Back' : 'Go Back',
        action: onBack,
        icon: ArrowLeft,
        variant: 'outline' as const,
        description: 'Return to previous step'
      });
    }

    if (onHome && currentStage !== 'home') {
      actions.push({
        label: isMobile ? 'Home' : 'Start Over',
        action: onHome,
        icon: Home,
        variant: 'outline' as const,
        description: 'Return to home page'
      });
    }

    return actions;
  };

  const recoveryActions = getRecoveryActions();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        <Alert 
          variant="destructive" 
          className="mb-4"
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isOffline || isNetworkError ? (
                <WifiOff 
                  className="h-4 w-4" 
                  aria-hidden="true"
                />
              ) : (
                <AlertTriangle 
                  className="h-4 w-4" 
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <AlertTitle className="mb-2">
                {getErrorTitle()}
              </AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{getErrorMessage()}</p>
                
                <div className="bg-destructive/5 p-3 rounded-md border border-destructive/20">
                  <p className="text-sm font-medium mb-2">What you can try:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm" role="list">
                    {getSuggestions().map((suggestion, i) => (
                      <li key={i} role="listitem">{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-2 pt-2`}>
                  {recoveryActions.map((action, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={action.variant}
                      onClick={action.action}
                      disabled={isOffline && action.label.includes('Try')}
                      className={`flex items-center gap-1 min-h-[44px] touch-manipulation ${
                        isMobile ? 'w-full justify-center' : ''
                      }`}
                      aria-label={action.description}
                      title={action.description}
                    >
                      <action.icon className="h-3 w-3" aria-hidden="true" />
                      {action.label}
                    </Button>
                  ))}
                  {onDismiss && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={onDismiss}
                      className={`min-h-[44px] touch-manipulation ${
                        isMobile ? 'w-full justify-center' : ''
                      }`}
                      aria-label="Dismiss this error message"
                    >
                      Dismiss
                    </Button>
                  )}
                </div>

                {!isOffline && context.fallbackActions.length > 0 && (
                  <details className="text-sm">
                    <summary 
                      className="cursor-pointer text-muted-foreground hover:text-foreground min-h-[44px] touch-manipulation flex items-center"
                      aria-label="Show additional recovery options"
                    >
                      Other options
                    </summary>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground" role="list">
                      {context.fallbackActions.map((action, i) => (
                        <li key={i} role="listitem">{action}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualErrorDisplay;
