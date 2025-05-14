
import React from 'react';
import { AIHealthPlan } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import HealthPlanCard from '@/components/HealthPlanCard';
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
  // Handle empty plans or loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Generating personalized health plans...</p>
        </Card>
      </div>
    );
  }

  // Display error if there is one
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
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
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Health Plans Available</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We couldn't generate any health plans based on your input. Please try providing more details.
          </p>
          <Button onClick={onBack}>Go Back</Button>
        </Card>
      </div>
    );
  }

  // Display plans
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Your Personalized Health Plans</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, index) => (
          <HealthPlanCard 
            key={plan.id || index}
            plan={plan}
            userQuery={userInput}
            onSelectPlan={() => onSelectPlan(plan)}
          />
        ))}
      </div>
    </div>
  );
};

export default SafeAIPlansDisplay;
