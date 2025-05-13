
import React, { 
  Component, 
  ErrorInfo, 
  ReactNode, 
  useState, 
  useEffect, 
  useCallback 
} from 'react';
import { AlertCircle } from 'lucide-react';
import { logger } from '@/utils/logger';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

type FallbackComponent = React.ComponentType<FallbackProps>;

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<unknown>;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component that provides better error handling and feedback
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('EnhancedErrorBoundary caught an error:', error, info);
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  resetErrorBoundary(): void {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    
    // Reset the error state if any of the resetKeys have changed
    if (resetKeys && this.state.hasError) {
      const hasKeyChanged = resetKeys.some(
        (key, idx) => key !== ((prevProps.resetKeys || [])[idx])
      );
      
      if (hasKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError && error) {
      // The proper way to handle different fallback types while ensuring TypeScript is happy
      if (fallback) {
        if (typeof fallback === 'function') {
          // Type assertion to help TypeScript understand this is a valid ReactNode
          return fallback({ 
            error, 
            resetErrorBoundary: this.resetErrorBoundary 
          }) as ReactNode;
        }
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-900">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Something went wrong</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {error.message || 'An unexpected error occurred'}
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={this.resetErrorBoundary}
                  className="px-2 py-1 text-sm rounded bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return children;
  }
}

export default EnhancedErrorBoundary;

/**
 * Hook to safely use error boundaries with functional components
 */
export function useErrorBoundary(): { 
  ErrorBoundary: typeof EnhancedErrorBoundary; 
  error: Error | null;
  resetBoundary: () => void;
} {
  const [error, setError] = useState<Error | null>(null);
  
  const resetBoundary = useCallback(() => {
    setError(null);
  }, []);
  
  const handleError = useCallback((error: Error) => {
    setError(error);
    logger.error('Error boundary caught an error:', error);
  }, []);
  
  // Clear error on unmount
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);
  
  return {
    ErrorBoundary: EnhancedErrorBoundary,
    error,
    resetBoundary
  };
}
