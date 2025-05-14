
import React from 'react';
import { AIHealthPlan } from '@/types';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import PlansList from './PlansList';
import PlanGenerationErrorDisplay from './PlanGenerationErrorDisplay';
import { PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling';

interface SafeAIPlansDisplayProps {
  plans: AIHealthPlan[];
  userInput: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
  errorType?: PlanGenerationErrorType;
  onRetry?: () => void;
  suggestions?: string[];
}

const SafeAIPlansDisplay: React.FC<SafeAIPlansDisplayProps> = ({
  plans,
  userInput,
  onSelectPlan,
  onBack,
  isLoading,
  error,
  errorType,
  onRetry,
  suggestions = []
}) => {
  // Handle loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Display error if there is one
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <PlanGenerationErrorDisplay
          error={error}
          errorType={errorType}
          onRetry={onRetry || onBack}
          suggestions={suggestions}
        />
      </div>
    );
  }

  // Handle no plans scenario
  if (!plans || plans.length === 0) {
    return <EmptyState onBack={onBack} />;
  }

  // Display plans
  return <PlansList plans={plans} userInput={userInput} onSelectPlan={onSelectPlan} onBack={onBack} />;
};

export default SafeAIPlansDisplay;
