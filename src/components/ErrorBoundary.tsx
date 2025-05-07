
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/cache";

/**
 * Props for the ErrorBoundary component
 * @interface Props
 * @property {ReactNode} children - The child components to be rendered
 * @property {ReactNode} [fallback] - Optional custom fallback UI to show when an error occurs
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 * @interface State
 * @property {boolean} hasError - Whether an error has occurred
 * @property {Error | null} error - The error object if an error occurred
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * Provides a fallback UI when an error occurs to prevent the entire app from crashing
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
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
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called when an error is caught
   * Logs error information for debugging purposes
   * 
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Component stack information
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use the new logger utility instead of direct console.error
    logger.error("Error caught by ErrorBoundary:", error);
    logger.error("Component stack:", errorInfo.componentStack);
  }

  /**
   * Resets the error state to allow recovery
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg mt-4 w-full max-w-full overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4 text-sm sm:text-base">
            An error occurred while rendering this component.
          </p>
          {this.state.error && (
            <pre className="p-2 sm:p-3 bg-red-100 rounded text-red-900 text-xs sm:text-sm overflow-auto mb-4 max-w-full">
              {this.state.error.toString()}
            </pre>
          )}
          <Button onClick={this.handleReset} variant="destructive" size="sm" className="w-full sm:w-auto">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
