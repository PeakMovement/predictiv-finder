
import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppStage } from '@/types/app';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

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
  const context = stageContexts[currentStage];

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
        variant: 'default' as const
      });
    }

    if (onBack && currentStage !== 'home') {
      actions.push({
        label: 'Go Back',
        action: onBack,
        icon: ArrowLeft,
        variant: 'outline' as const
      });
    }

    if (onHome && currentStage !== 'home') {
      actions.push({
        label: 'Start Over',
        action: onHome,
        icon: Home,
        variant: 'outline' as const
      });
    }

    return actions;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        <Alert variant="destructive" className="mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {isOffline || isNetworkError ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <AlertTitle className="mb-2">{getErrorTitle()}</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{getErrorMessage()}</p>
                
                <div className="bg-destructive/5 p-3 rounded-md border border-destructive/20">
                  <p className="text-sm font-medium mb-2">What you can try:</p>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {getSuggestions().map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {getRecoveryActions().map((action, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={action.variant}
                      onClick={action.action}
                      disabled={isOffline && action.label === 'Try Again'}
                      className="flex items-center gap-1"
                    >
                      <action.icon className="h-3 w-3" />
                      {action.label}
                    </Button>
                  ))}
                  {onDismiss && (
                    <Button size="sm" variant="ghost" onClick={onDismiss}>
                      Dismiss
                    </Button>
                  )}
                </div>

                {!isOffline && context.fallbackActions.length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Other options
                    </summary>
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
                      {context.fallbackActions.map((action, i) => (
                        <li key={i}>{action}</li>
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
