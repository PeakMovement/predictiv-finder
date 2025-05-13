
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { EnhancedErrorDisplay } from './EnhancedErrorDisplay';
import { validateHealthQueryInput } from '@/utils/inputValidation/enhancedInputValidator';
import { Separator } from '@/components/ui/separator';
import HealthInputWithValidation from '@/components/enhanced-input/HealthInputWithValidation';

/**
 * Demo page to showcase validation and error handling features
 */
const ValidationDemoPage: React.FC = () => {
  const [errorType, setErrorType] = useState<string>('');

  const triggerValidationError = () => {
    setErrorType('validation');
    toast({
      title: "Validation Error",
      description: "Input failed validation checks",
      variant: "destructive"
    });
  };
  
  const triggerSuccessToast = () => {
    toast({
      title: "Success",
      description: "Operation completed successfully",
      variant: "default"
    });
  };
  
  const triggerWarningToast = () => {
    toast({
      title: "Warning",
      description: "Some fields might need attention",
      variant: "default",
      className: "bg-amber-500"
    });
  };
  
  const triggerMissingFieldsError = () => {
    setErrorType('missing-fields');
  };
  
  const clearError = () => {
    setErrorType('');
  };
  
  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Validation & Error Handling Demo</CardTitle>
          <CardDescription>
            Test different validation and error handling functionalities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorType === 'validation' && (
            <EnhancedErrorDisplay
              title="Validation Failed"
              message="The provided input doesn't meet our validation requirements"
              severity="error"
              suggestions={[
                "Check that all required fields are filled",
                "Ensure the input matches the expected format",
                "Try providing more details about your needs"
              ]}
            />
          )}
          
          {errorType === 'missing-fields' && (
            <EnhancedErrorDisplay
              title="Missing Required Information"
              message="Please provide all required fields to continue"
              severity="warning"
              suggestions={[
                "Add your health goals",
                "Specify your timeline",
                "Include your budget information"
              ]}
            />
          )}
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={triggerValidationError}>
              Show Validation Error
            </Button>
            <Button onClick={triggerSuccessToast} variant="default">
              Show Success Toast
            </Button>
            <Button onClick={triggerWarningToast} variant="outline">
              Show Warning Toast
            </Button>
            <Button onClick={triggerMissingFieldsError} variant="secondary">
              Show Missing Fields
            </Button>
            <Button onClick={clearError} variant="ghost">
              Clear Errors
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Health Input Component</CardTitle>
          <CardDescription>
            Try our improved input component with real-time validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HealthInputWithValidation 
            onSubmit={(input) => {
              toast({
                title: "Input Received",
                description: `Received ${input.length} characters of input`,
                variant: "default"
              });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationDemoPage;
