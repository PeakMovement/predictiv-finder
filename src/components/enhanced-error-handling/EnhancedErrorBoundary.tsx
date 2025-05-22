
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PlanGenerationError } from '@/utils/planGenerator/errorHandling';

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: FallbackProps) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: Array<unknown>;
  onReset?: () => void;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced error boundary component with detailed error handling
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  // Constructor initializes state with no error
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  // Get derived state from error
  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  // ComponentDidCatch logs the error and calls onError if provided
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Enhanced error boundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Reset the error state
  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    this.setState({
      hasError: false,
      error: null
    });
  };

  // Check if error state should be reset based on resetKeys
  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      if (
        !prevProps.resetKeys ||
        this.props.resetKeys.some(
          (key, index) => key !== prevProps.resetKeys?.[index]
        )
      ) {
        this.resetErrorBoundary();
      }
    }
  }

  // Render the fallback UI if there's an error
  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary
      });
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
