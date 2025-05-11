
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorBoundaryKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component that provides detailed error reporting
 * and proper error recovery mechanisms.
 */
export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log the error
    console.error('Error caught by EnhancedErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Show a toast notification
    toast({
      variant: "destructive",
      title: "An error occurred",
      description: error.message || "Something went wrong. Please try again.",
    });
  }
  
  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function' && this.state.error) {
          const FallbackComponent = this.props.fallback;
          return <FallbackComponent 
            error={this.state.error} 
            resetErrorBoundary={this.reset} 
          />;
        }
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">
              Something went wrong
            </h2>
          </div>
          
          <div className="mb-6">
            <p className="text-red-700 dark:text-red-300 mb-2">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <details className="mt-2">
              <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                View technical details
              </summary>
              <pre className="mt-2 text-xs border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 p-3 rounded overflow-auto max-h-60">
                {this.state.error?.stack}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // When there's no error, just render children
    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
