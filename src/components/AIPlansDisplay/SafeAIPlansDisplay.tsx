
import React, { useState } from 'react';
import AIPlansDisplay from '@/components/AIPlansDisplay';
import { AIHealthPlan } from '@/types';
import { LoadingIndicator, ProgressBar } from '@/components/ui/loading-indicator';
import { EnhancedErrorBoundary } from '@/components/enhanced-error-handling';
import { PlanGenerationErrorFallback } from '@/components/enhanced-error-handling/PlanGenerationErrorFallback';
import { PlanGenerationErrorHandler } from '@/components/enhanced-error-handling/PlanGenerationErrorHandler';
import { isPlanGenerationError } from '@/utils/planGenerator/errorHandling/index';

interface SafeAIPlansDisplayProps {
  plans: AIHealthPlan[];
  userQuery: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
  onRetry?: () => void;
  isLoading: boolean;
}

const SafeAIPlansDisplay = (props: SafeAIPlansDisplayProps) => {
  const [key, setKey] = useState(0); // Used to reset the error boundary
  
  const handleRetry = () => {
    setKey(prevKey => prevKey + 1); // Change key to remount error boundary
    props.onRetry?.(); // Call the parent retry handler if provided
  };

  const handleReset = () => {
    setKey(prevKey => prevKey + 1); // Change key to remount error boundary
  };

  // If loading, show enhanced loading state
  if (props.isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button 
            className="mr-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={props.onBack}
            aria-label="Go back"
          >
            ←
          </button>
          <h2 className="text-2xl font-semibold">Analyzing Your Health Needs</h2>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block mb-6">
            <span className="text-4xl animate-pulse">🧠</span>
          </div>
          
          <h3 className="text-xl font-medium mb-3">Creating your personalized health plans</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Our AI is analyzing your needs and creating customized recommendations...
          </p>

          <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span>Analyzing symptoms</span>
                <span>Complete</span>
              </div>
              <ProgressBar value={100} />
            </div>
            
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span>Matching with professionals</span>
                <span>In progress</span>
              </div>
              <ProgressBar value={65} />
            </div>
            
            <div className="w-full space-y-1">
              <div className="flex justify-between text-sm">
                <span>Building recommendations</span>
                <span>Starting</span>
              </div>
              <ProgressBar value={25} />
            </div>
          </div>
          
          <p className="mt-8 text-sm text-gray-500">
            This usually takes less than 15 seconds
          </p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedErrorBoundary
      key={key}
      fallback={(error) => {
        if (isPlanGenerationError(error)) {
          // Use specialized error handler for plan generation errors
          return (
            <PlanGenerationErrorHandler
              error={error}
              resetError={handleReset}
              onBack={props.onBack}
              onRetry={handleRetry}
            />
          );
        }
        
        // Use generic fallback for other errors
        return (
          <PlanGenerationErrorFallback 
            error={error}
            onBack={props.onBack}
            onRetry={handleRetry}
            suggestions={[
              "Try describing your health needs more specifically",
              "Include details about your budget if possible",
              "Mention any specific conditions you're experiencing",
              "Specify your location for better practitioner matching"
            ]}
          />
        );
      }}
      errorBoundaryKey={`ai-plans-${key}`}
    >
      <AIPlansDisplay {...props} />
    </EnhancedErrorBoundary>
  );
};

export default SafeAIPlansDisplay;
