
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling';

interface PlanGenerationErrorDisplayProps {
  error: string;
  errorType?: PlanGenerationErrorType;
  onRetry: () => void;
  suggestions?: string[];
}

const PlanGenerationErrorDisplay: React.FC<PlanGenerationErrorDisplayProps> = ({
  error,
  errorType,
  onRetry,
  suggestions = []
}) => {
  // Determine error message based on error type
  const getErrorHeader = () => {
    switch (errorType) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return "We Need More Information";
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return "Couldn't Identify Health Needs";
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return "Service Matching Issue";
      case PlanGenerationErrorType.BUDGET_CALCULATION:
        return "Budget Issue";
      default:
        return "Plan Generation Issue";
    }
  };

  return (
    <Card className="mb-6 border-red-200 dark:border-red-900">
      <CardHeader className="bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-700 dark:text-red-400">
            {errorType ? getErrorHeader() : "Error Creating Plan"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {error}
        </p>
        
        {suggestions.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium mb-2">Suggestions:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="text-gray-600 dark:text-gray-400">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-3">
        <Button 
          onClick={onRetry} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanGenerationErrorDisplay;
