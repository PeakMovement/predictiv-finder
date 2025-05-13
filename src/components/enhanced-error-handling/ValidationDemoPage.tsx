
import React, { useState } from 'react';
import { HealthInputWithValidation } from '@/components/enhanced-input/HealthInputWithValidation';
import { EnhancedErrorDisplay } from '@/components/enhanced-error-handling/EnhancedErrorDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PlanGenerationError, PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';

/**
 * Demonstration component for the enhanced validation
 * and error handling system
 */
const ValidationDemoPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PlanGenerationError | null>(null);
  
  const handleSubmit = (healthQuery: string) => {
    setQuery(healthQuery);
    setIsLoading(true);
    setError(null);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      
      // Randomly show different error examples (for demo purposes)
      const demoAction = Math.floor(Math.random() * 4);
      
      if (demoAction === 0) {
        // Success case
        toast({
          title: "Health Plan Generated",
          description: "Successfully processed your health query.",
          variant: "default",
        });
      } else if (demoAction === 1) {
        // Input validation error
        setError(new PlanGenerationError(
          "Input validation failed",
          PlanGenerationErrorType.INPUT_VALIDATION,
          "We need more specific information about your symptoms.",
          { input: healthQuery },
          [
            "Describe when your symptoms started",
            "Rate the severity of your pain or discomfort",
            "Mention any previous treatments you've tried"
          ]
        ));
      } else if (demoAction === 2) {
        // Service matching error
        setError(new PlanGenerationError(
          "Service matching failed",
          PlanGenerationErrorType.SERVICE_MATCHING,
          "We couldn't match appropriate health services to your needs.",
          { query: healthQuery },
          [
            "Try describing your symptoms more specifically",
            "Mention the body parts affected",
            "Include any diagnosed conditions you have"
          ]
        ));
      } else {
        // External service error
        setError(new PlanGenerationError(
          "External service error",
          PlanGenerationErrorType.EXTERNAL_SERVICE,
          "We're experiencing technical difficulties processing your request.",
          { timestamp: new Date().toISOString() },
          [
            "Please try again in a few minutes",
            "If the problem persists, contact support"
          ]
        ));
      }
    }, 1500);
  };
  
  // Simulate an error boundary error
  const triggerErrorBoundary = () => {
    throw new Error("This is a demonstration of the error boundary");
  };
  
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Enhanced Validation & Error Handling</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          This demonstration showcases improved input validation with real-time feedback
          and enhanced error handling with user-friendly displays.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Health Input with Enhanced Validation</h2>
          <HealthInputWithValidation 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Error Display Examples</h2>
          
          {error && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Current Error</h3>
              <EnhancedErrorDisplay
                title={`Error: ${error.type}`}
                message={error.userMessage}
                severity="error"
                suggestions={error.suggestions}
                details={JSON.stringify(error.context, null, 2)}
                onRetry={() => handleSubmit(query)}
                onDismiss={() => setError(null)}
              />
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Error Display Variations</CardTitle>
              <CardDescription>Different severity levels and presentations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedErrorDisplay
                title="Information Message"
                message="This is a simple information message with helpful context."
                severity="info"
                onDismiss={() => toast({ title: "Dismissed", description: "Info message dismissed" })}
              />
              
              <EnhancedErrorDisplay
                title="Warning Notification"
                message="Some parts of your health plan may not be accurate due to limited information."
                severity="warning"
                suggestions={["Provide more details about your symptoms", "Include your medical history"]}
                onHelp={() => toast({ title: "Help", description: "Help information would appear here" })}
              />
              
              <EnhancedErrorDisplay
                title="Critical System Error"
                message="Unable to generate health plan due to a system issue."
                severity="critical"
                details="Error code: SERVER_TIMEOUT\nTimestamp: 2023-05-15T12:34:56Z"
                onRetry={() => toast({ title: "Retry", description: "Retrying operation" })}
              />
              
              <EnhancedErrorDisplay
                title="Success Message"
                message="Your health plan has been successfully generated and saved."
                severity="success"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Boundary Demo</CardTitle>
              <CardDescription>Test the enhanced error boundary component</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedErrorBoundary>
                <div className="text-center">
                  <p className="mb-4">
                    Click the button below to trigger an error that will be caught by the error boundary.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={triggerErrorBoundary}
                  >
                    Trigger Error
                  </Button>
                </div>
              </EnhancedErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValidationDemoPage;
