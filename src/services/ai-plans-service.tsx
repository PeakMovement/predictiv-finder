
import { useState, useCallback } from "react";
import { AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generateCustomAIPlans } from "@/utils/aiPlanGenerator";
import { generateProfessionalRecommendations } from "@/utils/planGenerator/professionalRecommendation";
import { analyzeUserInput } from "@/utils/planGenerator/inputAnalyzer";
import { detectBudgetConstraints, parseMonthlyBudget } from "@/utils/planGenerator/budgetDetector";
import { detectTimeframes, extractGoalTimeframe } from "@/utils/planGenerator/detectors/timeframeDetector";
import { buildMultidisciplinaryPlan } from "@/utils/planGenerator/multidisciplinaryPlanBuilder";
import { identifySymptoms } from "@/utils/planGenerator/symptomDetector";

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
   * Generates AI health plans based on user query with improved budget handling
   * and multidisciplinary approach
   * 
   * @param query - The user input describing their health needs
   */
  const generateAIPlans = useCallback(async (query: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log("Generating AI plans with query:", query);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 1: Analyze user input to extract key information
      const { symptoms, priorities, contraindications } = identifySymptoms(query);
      console.log("Identified symptoms:", symptoms);
      console.log("Symptom priorities:", priorities);
      
      // Step 2: Extract budget constraints
      const { budget: detectedBudget, isStrict: isStrictBudget } = detectBudgetConstraints(query.toLowerCase(), []);
      const { monthlyAmount, timeframe } = parseMonthlyBudget(query.toLowerCase());
      
      const effectiveBudget = monthlyAmount || detectedBudget || 2000; // Default budget if none specified
      console.log("Effective budget:", effectiveBudget, "isStrict:", isStrictBudget);
      
      // Step 3: Extract timeframe information
      const { weeks: detectedTimeframe, isUrgent } = detectTimeframes(query.toLowerCase(), [], {});
      const goalTimeframe = extractGoalTimeframe(query);
      
      const effectiveTimeframe = goalTimeframe || detectedTimeframe || timeframe || 4; // Default 4 weeks if none specified
      console.log("Effective timeframe:", effectiveTimeframe, "weeks, isUrgent:", isUrgent);
      
      // Step 4: Generate professional recommendations
      const recommendations = generateProfessionalRecommendations(query);
      console.log("Professional recommendations:", recommendations);
      
      if (recommendations.length === 0) {
        throw new Error("Unable to generate professional recommendations based on your input. Please provide more specific health details.");
      }
      
      // Step 5: Extract primary condition and goals
      const primaryCondition = recommendations[0].primaryCondition || symptoms[0] || "general health";
      
      // Extract goals - simple approach for now
      const goalKeywords = ["race", "weight loss", "pain free", "mobility", "strength", "fitness"];
      const goals = goalKeywords.filter(goal => query.toLowerCase().includes(goal));
      
      // Step 6: Extract service types from recommendations
      const services = recommendations.map(rec => rec.category).slice(0, 3); // Take top 3 recommendations
      
      // Step 7: Build multidisciplinary plans for different budget tiers
      const plans: AIHealthPlan[] = [];
      
      // Base plan at exactly specified budget
      const exactBudgetPlan = buildMultidisciplinaryPlan({
        input: query,
        primaryCondition,
        services,
        budget: effectiveBudget,
        timeframeWeeks: effectiveTimeframe,
        isStrictBudget,
        goals,
        urgencyLevel: isUrgent ? 0.8 : 0.4
      });
      plans.push(exactBudgetPlan);
      
      // If not a strict budget, also offer a premium option (unless budget is already high)
      if (!isStrictBudget && effectiveBudget < 3000) {
        const premiumBudget = Math.round(effectiveBudget * 1.5);
        const premiumPlan = buildMultidisciplinaryPlan({
          input: query,
          primaryCondition,
          services,
          budget: premiumBudget,
          timeframeWeeks: effectiveTimeframe,
          isStrictBudget: false,
          goals,
          urgencyLevel: isUrgent ? 0.8 : 0.4
        });
        premiumPlan.name = `Premium ${premiumPlan.name}`;
        plans.push(premiumPlan);
      }
      
      // If budget is higher than minimum, also offer economy option
      if (effectiveBudget > 1000) {
        const economyBudget = Math.round(effectiveBudget * 0.7);
        const economyPlan = buildMultidisciplinaryPlan({
          input: query,
          primaryCondition,
          services,
          budget: economyBudget,
          timeframeWeeks: effectiveTimeframe,
          isStrictBudget: true,
          goals,
          urgencyLevel: isUrgent ? 0.8 : 0.4
        });
        economyPlan.name = `Economy ${economyPlan.name}`;
        plans.push(economyPlan);
      }
      
      if (plans.length === 0) {
        throw new Error("Unable to generate health plans based on your input. Try describing your health needs in different words.");
      }
      
      // Sort plans by cost for consistent display
      const sortedPlans = plans.sort((a, b) => a.totalCost - b.totalCost);
      setAiPlans(sortedPlans);
      
      console.log("Generated plans:", sortedPlans);
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
