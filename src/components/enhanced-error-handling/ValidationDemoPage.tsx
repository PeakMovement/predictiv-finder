
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { validateHealthPlanInput } from '@/utils/inputValidation';
import { FormFeedback } from '@/components/ui/form-feedback';
import { useToast } from '@/hooks/use-toast';
import { 
  PlanGenerationError, 
  PlanGenerationErrorType 
} from '@/utils/planGenerator/errorHandling/planGenerationError';

/**
 * Demo page to showcase validation features
 */
const ValidationDemoPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateHealthPlanInput> | null>(null);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();
  
  const handleValidate = () => {
    const result = validateHealthPlanInput(input);
    setValidationResult(result);
    
    if (!result.isValid) {
      toast({
        title: "Validation Error",
        description: result.errorMessage,
        variant: "destructive"
      });
    } else if (result.suggestions && result.suggestions.length > 0) {
      toast({
        title: "Input can be improved",
        description: "We have some suggestions to improve your query.",
        variant: "default"
      });
    } else {
      toast({
        title: "Input is valid",
        description: "Your health query is detailed and well-formed.",
        variant: "success"
      });
    }
  };
  
  const triggerValidationError = () => {
    toast({
      title: "Input validation failed",
      description: "Your input is missing important details like timeframe and budget.",
      variant: "destructive"
    });
  };
  
  const triggerNetworkError = () => {
    setShowError(true);
    toast({
      title: "Network Error",
      description: "Failed to connect to our health plan services. Please try again.",
      variant: "destructive"
    });
  };
  
  const triggerInputError = () => {
    // Create an error similar to what would happen in production
    const error = new PlanGenerationError(
      "Invalid input parameters",
      PlanGenerationErrorType.INPUT_VALIDATION,
      { 
        inputLength: input.length,
        missingFields: ["budget", "timeframe"]
      }
    );
    
    toast({
      title: "Input Error",
      description: error.message,
      variant: "destructive"
    });
  };
  
  const handleClearError = () => {
    setShowError(false);
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Validation System Demo</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Input Validation</CardTitle>
          <CardDescription>
            Enter a health query to test our enhanced validation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Textarea 
              placeholder="E.g., I need help with back pain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleValidate}>
              Validate Input
            </Button>
            <Button variant="outline" onClick={triggerValidationError}>
              Trigger Validation Error
            </Button>
          </div>
          
          {validationResult && !validationResult.isValid && (
            <FormFeedback 
              className="mt-4"
              variant="error"
              message={validationResult.errorMessage || "Invalid input"}
            />
          )}
          
          {validationResult && validationResult.isValid && validationResult.suggestions && (
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-medium text-blue-800">Suggestions to improve your query:</h3>
              <ul className="list-disc list-inside mt-2 text-blue-700">
                {validationResult.suggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Demo</CardTitle>
          <CardDescription>
            Test various error handling scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button variant="outline" onClick={triggerNetworkError}>
                Simulate Network Error
              </Button>
              <Button variant="outline" onClick={triggerInputError}>
                Simulate Input Error
              </Button>
            </div>
            
            {showError && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="text-red-800 font-medium">Network Error</h3>
                <p className="text-red-700 mt-1">
                  Unable to connect to health plan services. Please check your connection and try again.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={handleClearError}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationDemoPage;
