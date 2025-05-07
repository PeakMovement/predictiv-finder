
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/cache";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use the new logger utility instead of direct console.error
    logger.error("Error caught by ErrorBoundary:", error);
    logger.error("Component stack:", errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg mt-4">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">
            An error occurred while rendering this component.
          </p>
          {this.state.error && (
            <pre className="p-3 bg-red-100 rounded text-red-900 text-sm overflow-auto mb-4">
              {this.state.error.toString()}
            </pre>
          )}
          <Button onClick={this.handleReset} variant="destructive">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
