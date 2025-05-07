
import { useState, useCallback } from "react";
import { AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generateCustomAIPlans } from "@/utils/aiPlanGenerator";
import { generateProfessionalRecommendations } from "@/utils/planGenerator/professionalRecommendation";

/**
 * Custom hook for AI plan generation service
 * Manages the state and logic for generating AI health plans
 * 
 * @returns An object containing state and functions for AI plan generation
 */
export function useAIPlansService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlans, setAiPlans] = useState<AIHealthPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Generates AI health plans based on user query
   * Handles error states and loading indicators
   * 
   * @param query - The user input describing their health needs
   */
  const generateAIPlans = useCallback(async (query: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate professional recommendations using the new system
      const recommendations = generateProfessionalRecommendations(query);
      console.log("Professional recommendations:", recommendations);
      
      if (recommendations.length === 0) {
        throw new Error("Unable to generate professional recommendations based on your input. Please provide more specific health details.");
      }
      
      // Generate the customized plans
      const customPlans = generateCustomAIPlans(query);
      
      if (customPlans.length === 0) {
        throw new Error("Unable to generate health plans based on your input. Try describing your health needs in different words.");
      }
      
      setAiPlans(customPlans);
    } catch (error) {
      console.error("Error generating AI plans:", error);
      setError(error instanceof Error ? error.message : "Failed to generate health plans");
      
      toast({
        title: "Error generating health plans",
        description: error instanceof Error 
          ? error.message 
          : "Failed to generate health plans. Please try again with different wording.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    isGenerating,
    aiPlans,
    error,
    setError,
    generateAIPlans
  };
}
