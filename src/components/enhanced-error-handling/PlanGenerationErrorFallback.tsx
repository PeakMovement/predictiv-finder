
import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling';

interface PlanGenerationErrorFallbackProps {
  error: Error;
  errorType?: PlanGenerationErrorType;
  userMessage?: string;
  suggestions?: string[];
  onBack: () => void;
  onRetry?: () => void;
}

/**
 * Specialized error fallback component for plan generation errors
 */
export const PlanGenerationErrorFallback: React.FC<PlanGenerationErrorFallbackProps> = ({
  error,
  errorType,
  userMessage,
  suggestions = [],
  onBack,
  onRetry
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button 
          className="mr-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-semibold">Health Plan Creation</h2>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-1">
                Unable to generate health plans
              </h3>
              <p className="text-red-700 dark:text-red-400">
                {userMessage || error.message || "We encountered a problem creating your health plans."}
              </p>
            </div>
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Suggestions to try:
            </h4>
            <ul className="list-disc ml-5 text-gray-600 dark:text-gray-400 space-y-1">
              {suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/30 flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded transition-colors"
          >
            Go Back
          </button>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanGenerationErrorFallback;
