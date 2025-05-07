
import React from 'react';
import AIPlansDisplay from '@/components/AIPlansDisplay';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AIHealthPlan } from '@/types';
import { LoadingIndicator, ProgressBar } from '@/components/ui/loading-indicator';

interface SafeAIPlansDisplayProps {
  plans: AIHealthPlan[];
  userQuery: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
  isLoading: boolean;
}

const AIPlansErrorFallback = ({ onBack }: { onBack: () => void }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to display health plans</h2>
    <p className="text-red-700 mb-4">
      We encountered a problem displaying your health plans. Please try again with different wording.
    </p>
    <button
      onClick={onBack}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Go Back
    </button>
  </div>
);

const SafeAIPlansDisplay = (props: SafeAIPlansDisplayProps) => {
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
    <ErrorBoundary
      fallback={<AIPlansErrorFallback onBack={props.onBack} />}
    >
      <AIPlansDisplay {...props} />
    </ErrorBoundary>
  );
};

export default SafeAIPlansDisplay;
