
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanGenerationError, PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling/planGenerationError';

interface PlanGenerationErrorHandlerProps {
  error: PlanGenerationError | Error;
  resetError: () => void;
  onBack: () => void;
  onRetry: () => void;
}

/**
 * Specialized error handler component for plan generation errors
 * Provides context-specific guidance based on error type
 */
export const PlanGenerationErrorHandler: React.FC<PlanGenerationErrorHandlerProps> = ({
  error,
  resetError,
  onBack,
  onRetry
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine if this is our specialized error or a generic one
  const isPlanError = error instanceof PlanGenerationError;
  const errorType = isPlanError ? error.type : PlanGenerationErrorType.UNEXPECTED;
  const errorMessage = isPlanError ? error.userMessage : error.message;
  const suggestions = isPlanError ? error.suggestions : undefined;
  
  // Define header and icon based on error type
  const getErrorHeader = () => {
    switch (errorType) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return "We Need More Information";
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return "Unable to Identify Health Needs";
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return "Service Matching Error";
      case PlanGenerationErrorType.BUDGET_CALCULATION:
        return "Budget Calculation Issue";
      case PlanGenerationErrorType.PRACTITIONER_MATCHING: // Fixed: This was missing in the enum
        return "Practitioner Matching Error";
      default:
        return "Health Plan Error";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-red-50 dark:bg-gray-900/60 rounded-lg border border-red-100 dark:border-red-800/40 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {getErrorHeader()}
        </h2>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300">
          {errorMessage || "An error occurred while generating your health plan."}
        </p>
        
        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-md p-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Suggestions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-400 text-sm">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Technical error details (collapsible) */}
        <div className="mt-6">
          <button 
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="text-xs">{showDetails ? '▼' : '►'}</span> 
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </button>
          
          {showDetails && (
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-60">
              {error.stack || error.toString()}
            </pre>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          Go Back
        </Button>
        
        <Button 
          onClick={() => {
            resetError();
            onRetry();
          }}
          variant="default"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <HelpCircle className="h-4 w-4" />
          <p>
            Need help? Try being more specific about your health needs or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanGenerationErrorHandler;
