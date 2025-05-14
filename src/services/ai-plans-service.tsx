
import { useState } from 'react';
import { generateCustomAIPlans } from '@/utils/aiPlanGenerator';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { toast } from '@/hooks/use-toast';
import { PlanGenerationError, PlanGenerationErrorType } from '@/utils/planGenerator/errorHandling';

// Helper function to check if an error is PlanGenerationError
function isPlanGenerationError(error: any): boolean {
  return error && error.name === 'PlanGenerationError';
}

// AI Plans Service hook for managing plan generation state
export function useAIPlansService() {
  const [aiPlans, setAIPlans] = useState<AIHealthPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);

  const generateAIPlans = async (userInput: string) => {
    try {
      // Reset states
      setIsGenerating(true);
      setError(null);
      setErrorDetails(null);
      
      // Log the incoming user query for debugging
      console.log("Processing user query:", userInput);

      // Call the AI plan generator with the user input
      const result = await generatePlan(userInput);
      
      // Log the generated plans for debugging
      console.log("Generated AI plans:", result);
      
      // Set the generated plans
      setAIPlans(Array.isArray(result) ? result : [result]);
      
      // Show success toast
      toast({
        title: "Plans Generated",
        description: `${Array.isArray(result) ? result.length : 1} custom health plans created for your needs.`,
      });
      
      return result;
    } catch (error: any) {
      // Log the error for debugging
      console.error("Error generating AI plans:", error);
      
      // Store detailed error information for debugging
      setErrorDetails({
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: isPlanGenerationError(error) ? error.type : 'unknown'
      });
      
      // Handle PlanGenerationError type specifically
      if (isPlanGenerationError(error)) {
        // Show specific error toast
        toast({
          variant: "destructive",
          title: "Failed to generate plans",
          description: error.userMessage || "An unexpected error occurred. Please try again.",
        });
        
        // Store the user-friendly error message
        setError(error.userMessage);
        
        if (error.suggestions && error.suggestions.length > 0) {
          // Show a follow-up toast with suggestions
          setTimeout(() => {
            toast({
              title: "Try this instead",
              description: error.suggestions[0],
              variant: "default",
            });
          }, 1000);
        }
      } else {
        // Show generic error toast
        toast({
          variant: "destructive",
          title: "Failed to generate plans",
          description: error.message || "An unexpected error occurred. Please try again.",
        });
        
        // Store a generic error message
        setError('Failed to generate AI health plans. Please try again.');
      }
        
      return [];
    } finally {
      setIsGenerating(false);
    }
  };
  
  const clearPlans = () => {
    setAIPlans([]);
    setError(null);
    setErrorDetails(null);
  };

  return {
    aiPlans,
    isGenerating,
    error,
    errorDetails,
    generateAIPlans,
    clearPlans
  };
}

// Replace Next.js specific code with browser-compatible equivalents
export async function generatePlan(userInput: string) {
  try {
    // Log the incoming user query for debugging
    console.log("Processing user query:", userInput);

    // Call the AI plan generator with the user input
    const result = await generateCustomAIPlans(userInput);

    // Log the generated plans for debugging
    console.log("Generated AI plans:", result);

    // Return the generated plan
    return result;
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error generating AI plans:", error);

    // Re-throw the error to be handled by the calling function
    throw error;
  }
}
