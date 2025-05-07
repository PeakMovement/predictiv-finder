
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/cache";
import { AlertTriangle } from "lucide-react";

/**
 * Props for the ErrorBoundary component
 * @interface Props
 * @property {ReactNode} children - The child components to be rendered
 * @property {ReactNode} [fallback] - Optional custom fallback UI to show when an error occurs
 * @property {string} [componentName] - Optional name of the component being wrapped for better error reporting
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

/**
 * State for the ErrorBoundary component
 * @interface State
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error | null} error - The error object if an error occurred
 * @property {string} errorInfo - Additional component stack information
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * Provides a fallback UI when an error occurs to prevent the entire app from crashing
 * 
 * @example
 * ```tsx
 * <ErrorBoundary componentName="Dashboard" fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: ''
  };

  /**
   * Static method called during rendering when an error is thrown
   * Updates the component state to display fallback UI
   * 
   * @param {Error} error - The error that was thrown
   * @returns {State} New state object with error information
   */
  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: '' };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs error information for debugging purposes
   * 
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Component stack information
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Get component name for better error reporting
    const componentName = this.props.componentName || 'unknown component';
    
    // Use the new logger utility instead of direct console.error
    logger.error(`Error caught by ErrorBoundary in ${componentName}:`, error);
    logger.error("Component stack:", errorInfo.componentStack);
    
    // Update state with component stack for display
    this.setState({
      errorInfo: errorInfo.componentStack
    });
    
    // Optional: Send error to error reporting service
    // reportErrorToService(error, errorInfo, componentName);
  }

  /**
   * Resets the error state to allow recovery
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
  };

  /**
   * Reloads the current page
   */
  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg mt-4 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-semibold text-red-800">Something went wrong</h2>
          </div>
          
          <p className="text-red-700 mb-4 text-sm sm:text-base">
            We encountered a problem while rendering this component. Our team has been notified of the issue.
          </p>
          
          {this.state.error && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error details:</h3>
              <pre className="p-2 sm:p-3 bg-red-100 rounded text-red-900 text-xs sm:text-sm overflow-auto max-h-40 mb-2">
                {this.state.error.toString()}
              </pre>
              
              {this.state.errorInfo && (
                <details className="mb-2">
                  <summary className="text-xs text-red-700 cursor-pointer">Show technical details</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-red-900 text-xs overflow-auto max-h-60">
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={this.handleReset} variant="outline" size="sm">
              Try Again
            </Button>
            <Button onClick={this.handleReload} variant="destructive" size="sm">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
