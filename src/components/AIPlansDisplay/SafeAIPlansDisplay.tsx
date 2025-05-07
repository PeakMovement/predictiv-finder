
import React from 'react';
import AIPlansDisplay from '@/components/AIPlansDisplay';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AIHealthPlan } from '@/types';

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
  return (
    <ErrorBoundary
      fallback={<AIPlansErrorFallback onBack={props.onBack} />}
    >
      <AIPlansDisplay {...props} />
    </ErrorBoundary>
  );
};

export default SafeAIPlansDisplay;
