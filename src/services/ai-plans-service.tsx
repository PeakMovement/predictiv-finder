
import { useState, useCallback } from "react";
import { AIHealthPlan } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generateCustomAIPlans } from "@/utils/aiPlanGenerator";
import { generateProfessionalRecommendations } from "@/utils/planGenerator/professionalRecommendation";
import { identifySymptoms } from "@/utils/planGenerator/symptomDetector";
import { detectBudgetConstraints, parseMonthlyBudget } from "@/utils/planGenerator/budgetDetector";
import { detectTimeframes, extractGoalTimeframe } from "@/utils/planGenerator/detectors/timeframeDetector";
import { buildMultidisciplinaryPlan } from "@/utils/planGenerator/multidisciplinaryPlanBuilder";

// Constants for default values and thresholds
const DEFAULT_BUDGET = 2000;
const DEFAULT_TIMEFRAME_WEEKS = 4;
const URGENCY_LEVELS = { urgent: 0.8, nonUrgent: 0.4 };
const MIN_BUDGET = 500;

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
   * Extracts and processes user input to identify key health information
   * 
   * @param query - The user input describing their health needs
   * @returns Structured data extracted from user input
   */
  const extractUserInput = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Step 1: Analyze user input to extract key information
    const { symptoms = [], priorities = {}, contraindications = [] } = identifySymptoms(query) || {};
    if (!symptoms.length) throw new Error("Please include specific symptoms or health concerns in your query.");

    // Step 2: Extract budget constraints
    const { budget: detectedBudget = DEFAULT_BUDGET, isStrict: isStrictBudget = false } = detectBudgetConstraints(lowerQuery, []) || {};
    const { monthlyAmount = 0, timeframe: budgetTimeframe = 0 } = parseMonthlyBudget(lowerQuery) || {};
    const effectiveBudget = Math.max(MIN_BUDGET, monthlyAmount || detectedBudget || DEFAULT_BUDGET);

    // Step 3: Extract timeframe information
    const { weeks: detectedTimeframe = DEFAULT_TIMEFRAME_WEEKS, isUrgent = false } = detectTimeframes(lowerQuery, [], {}) || {};
    const goalTimeframe = extractGoalTimeframe(query) || 0;
    const effectiveTimeframe = goalTimeframe || detectedTimeframe || budgetTimeframe || DEFAULT_TIMEFRAME_WEEKS;

    // Step 4: Extract goals
    const goalKeywords = ["race", "weight loss", "pain free", "mobility", "strength", "fitness"];
    const goals = goalKeywords.filter(goal => lowerQuery.includes(goal));
    if (!goals.length) goals.push("general wellness");

    return { symptoms, priorities, contraindications, effectiveBudget, isStrictBudget, effectiveTimeframe, isUrgent, goals };
  };

  /**
   * Creates a plan with specified budget tier and optional name prefix
   */
  const buildPlanForBudget = (params: {
    query: string, 
    primaryCondition: string, 
    services: string[], 
    budget: number, 
    timeframeWeeks: number, 
    isStrictBudget: boolean, 
    goals: string[], 
    urgencyLevel: number,
    namePrefix?: string
  }) => {
    const plan = buildMultidisciplinaryPlan({
      input: params.query,
      primaryCondition: params.primaryCondition,
      services: params.services,
      budget: params.budget,
      timeframeWeeks: params.timeframeWeeks,
      isStrictBudget: params.isStrictBudget,
      goals: params.goals,
      urgencyLevel: params.urgencyLevel
    });
    
    if (params.namePrefix) {
      plan.name = `${params.namePrefix} ${plan.name}`;
    }
    
    return plan;
  };

  /**
   * Generates multiple health plans at different budget tiers
   */
  const generatePlans = (params: {
    query: string, 
    symptoms: string[], 
    effectiveBudget: number, 
    isStrictBudget: boolean, 
    effectiveTimeframe: number, 
    isUrgent: boolean, 
    goals: string[]
  }) => {
    const { query, symptoms, effectiveBudget, isStrictBudget, effectiveTimeframe, isUrgent, goals } = params;
    
    // Step 5: Generate professional recommendations
    const recommendations = generateProfessionalRecommendations(query);
    if (!recommendations.length) {
      throw new Error("Unable to generate recommendations. Please provide more specific health details (e.g., 'knee pain' or 'weight loss goals').");
    }

    // Step 6: Extract primary condition and services
    const primaryCondition = recommendations[0].primaryCondition || symptoms[0] || "general health";
    const services = recommendations.map(rec => rec.category).slice(0, 3); // Take top 3 recommendations

    // Step 7: Build multidisciplinary plans for different budget tiers
    const plans: AIHealthPlan[] = [];
    const urgencyLevel = isUrgent ? URGENCY_LEVELS.urgent : URGENCY_LEVELS.nonUrgent;

    // Base plan at specified budget
    const exactBudgetPlan = buildPlanForBudget({
      query,
      primaryCondition,
      services,
      budget: effectiveBudget,
      timeframeWeeks: effectiveTimeframe,
      isStrictBudget,
      goals,
      urgencyLevel
    });
    plans.push(exactBudgetPlan);

    // Premium plan (if not strict budget and budget isn't too high)
    if (!isStrictBudget && effectiveBudget < 3000) {
      const premiumBudget = Math.round(effectiveBudget * 1.5);
      const premiumPlan = buildPlanForBudget({
        query,
        primaryCondition,
        services,
        budget: premiumBudget,
        timeframeWeeks: effectiveTimeframe,
        isStrictBudget: false,
        goals,
        urgencyLevel,
        namePrefix: "Premium"
      });
      plans.push(premiumPlan);
    }

    // Economy plan (if budget is above minimum)
    if (effectiveBudget > 1000) {
      const economyBudget = Math.round(effectiveBudget * 0.7);
      const economyPlan = buildPlanForBudget({
        query,
        primaryCondition,
        services,
        budget: economyBudget,
        timeframeWeeks: effectiveTimeframe,
        isStrictBudget: true,
        goals,
        urgencyLevel,
        namePrefix: "Economy"
      });
      plans.push(economyPlan);
    }

    if (!plans.length) {
      throw new Error("Unable to generate health plans. Please describe your health needs in more detail (e.g., 'recover from ankle injury').");
    }

    // Sort plans by cost for consistent display
    return plans.sort((a, b) => a.totalCost - b.totalCost);
  };

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
      
      if (!query || typeof query !== "string" || query.trim() === "") {
        throw new Error("Please provide a valid health query to generate plans.");
      }
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract user input
      const userInput = extractUserInput(query);
      console.log("Extracted user input:", userInput);
      
      // Generate and sort plans
      const sortedPlans = generatePlans({
        query,
        symptoms: userInput.symptoms,
        effectiveBudget: userInput.effectiveBudget,
        isStrictBudget: userInput.isStrictBudget,
        effectiveTimeframe: userInput.effectiveTimeframe,
        isUrgent: userInput.isUrgent,
        goals: userInput.goals
      });
      
      setAiPlans(sortedPlans);
      console.log("Generated plans:", sortedPlans);
    } catch (error) {
      console.error("Error generating AI plans:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate health plans";
      setError(errorMessage);
      
      toast({
        title: "Error generating health plans",
        description: errorMessage + " Please try again with more details, such as your symptoms or goals.",
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
