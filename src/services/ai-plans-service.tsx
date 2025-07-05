
import { useState } from 'react';
import { generateAIHealthPlans } from '@/utils/planGenerator/aiPlanGenerator';
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
      console.log("Processing user query with comprehensive analysis:", userInput);

      // Call the enhanced AI plan generator with comprehensive analysis
      const result = await generateAIHealthPlans(userInput);
      
      // Log the generated plans for debugging
      console.log("Generated comprehensive AI plans:", result);
      
      // Set the generated plans
      setAIPlans(Array.isArray(result) ? result : [result]);
      
      // Show success toast
      toast({
        title: "Intelligent Plans Generated",
        description: `${Array.isArray(result) ? result.length : 1} personalized health plans created using comprehensive analysis of your needs.`,
      });
      
      return result;
    } catch (error: any) {
      // Log the error for debugging
      console.error("Error generating comprehensive AI plans:", error);
      
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
          title: "Failed to generate intelligent plans",
          description: error.userMessage || "An unexpected error occurred. Please try again with more specific details.",
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
          description: error.message || "An unexpected error occurred. Please try again with more details about your health needs.",
        });
        
        // Store a generic error message
        setError('Failed to generate AI health plans using comprehensive analysis. Please try again with more specific information.');
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

// Enhanced plan generation function that uses comprehensive analysis
export async function generatePlan(userInput: string) {
  try {
    // Log the incoming user query for debugging
    console.log("Processing user query with comprehensive analysis:", userInput);

    // Call the enhanced AI plan generator with all existing sophisticated tools
    const result = await generateAIHealthPlans(userInput);

    // Log the generated plans for debugging
    console.log("Generated comprehensive AI plans:", result);

    // Return the first generated plan
    return result[0];
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error generating comprehensive AI plans:", error);

    // Re-throw the error to be handled by the calling function
    throw error;
  }
}
