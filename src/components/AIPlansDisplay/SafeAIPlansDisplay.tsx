
import React from 'react';
import { AIHealthPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import PlanDetailsView from '@/components/PlanDetailsView';
import { Spinner } from '@/components/ui/spinner';
import HealthPlanCard from '@/components/HealthPlanCard';
import { EnhancedErrorBoundary } from '@/components/enhanced-error-handling';
import { FallbackProps } from '@/components/enhanced-error-handling/EnhancedErrorBoundary';
import { PlanGenerationErrorHandler } from '@/components/enhanced-error-handling/PlanGenerationErrorHandler';

interface SafeAIPlansDisplayProps {
  plans: AIHealthPlan[];
  isLoading?: boolean;
  userInput: string;
  onSelectPlan?: (plan: AIHealthPlan) => void;
  onBack?: () => void;
}

/**
 * SafeAIPlansDisplay component renders the AI-generated health plans with error handling
 */
const SafeAIPlansDisplay: React.FC<SafeAIPlansDisplayProps> = ({
  plans,
  isLoading = false,
  userInput,
  onSelectPlan,
  onBack,
}) => {
  // Error state
  const [errorKey, setErrorKey] = React.useState<string>('ai-plans-error-boundary');

  // Handlers
  const handleSelectPlan = (plan: AIHealthPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="mb-4" />
        <h2 className="text-2xl font-semibold text-center mb-2">Generating Your Custom Health Plans</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          Our AI is analyzing your health needs and creating personalized plans to help you reach your goals.
        </p>
      </div>
    );
  }

  // Render empty state
  if (plans.length === 0 && !isLoading) {
    return (
      <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">No Plans Generated Yet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please provide information about your health needs to generate personalized plans.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
      </div>
    );
  }

  // Fallback component for error handling
  const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
    <PlanGenerationErrorHandler
      error={error}
      resetError={resetErrorBoundary}
      onBack={() => onBack && onBack()}
      onRetry={() => setErrorKey(`ai-plans-${Date.now()}`)}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Your Personalized Health Plans</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your health needs, we've generated these customized plans
          </p>
        </div>
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <EnhancedErrorBoundary
            key={index}
            fallback={ErrorFallback}
            resetKeys={[errorKey]}
          >
            <HealthPlanCard
              key={plan.id || index}
              plan={plan}
              userQuery={userInput}
              onSelect={() => handleSelectPlan(plan)}
            />
          </EnhancedErrorBoundary>
        ))}
      </div>

      {plans.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          These plans are customized based on your input. Select any plan to view detailed information.
        </p>
      )}
    </div>
  );
};

export default SafeAIPlansDisplay;
