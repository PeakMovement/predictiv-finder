
import { useState } from 'react';
import { generateCustomAIPlans } from '@/utils/aiPlanGenerator';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { isPlanGenerationError } from '@/utils/planGenerator/errorHandling';
import { toast } from '@/hooks/use-toast';

// AI Plans Service hook for managing plan generation state
export function useAIPlansService() {
  const [aiPlans, setAIPlans] = useState<AIHealthPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIPlans = async (userInput: string) => {
    try {
      // Reset states
      setIsGenerating(true);
      setError(null);
      
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
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Failed to generate plans",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
      
      // Store the error message
      setError(isPlanGenerationError(error) 
        ? error.userMessage 
        : 'Failed to generate AI health plans. Please try again.');
        
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    aiPlans,
    isGenerating,
    error,
    generateAIPlans
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

    // Construct an error message based on the error type
    let errorMessage = 'Failed to generate AI health plans. Please try again.';

    // Return an error
    throw new Error(errorMessage);
  }
}
