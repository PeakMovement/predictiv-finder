import { useState, useCallback } from "react";
import { AIHealthPlan, ServiceCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { detectComprehensiveSymptoms } from "@/utils/planGenerator/detectors/comprehensiveSymptomDetector";
import { matchServicesToSymptoms } from "@/utils/planGenerator/serviceMatching/enhancedServiceMatcher";
import { generateBudgetTiers, optimizeServiceAllocation } from "@/utils/planGenerator/budgetHandling/enhancedBudgetHandler";
import { detectTimeframes, extractGoalTimeframe } from "@/utils/planGenerator/detectors/timeframeDetector";
import { buildMultidisciplinaryPlan as importedBuildMultidisciplinaryPlan } from "@/utils/planGenerator/multidisciplinaryPlanBuilder";
import { safePlanOperation, validateHealthPlanInput, PlanGenerationError, PlanGenerationErrorType } from "@/utils/planGenerator/errorHandling";
import { BASELINE_COSTS } from "@/utils/planGenerator/types";

// Constants for default values
const DEFAULT_BUDGET = 2000;
const DEFAULT_TIMEFRAME_WEEKS = 4;
const MIN_BUDGET = 500;

/**
 * Custom hook for AI plan generation service
 * Enhanced with improved symptom detection, service matching, and budget handling
 */
export function useAIPlansService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlans, setAiPlans] = useState<AIHealthPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Analyzes user input to extract comprehensive health information
   */
  const analyzeUserInput = async (query: string) => {
    try {
      // Validate input first
      validateHealthPlanInput(query);
      
      const lowerQuery = query.toLowerCase();
      
      // Step 1: Enhanced symptom detection with confidence scores and primary symptom identification
      const symptomAnalysis = await safePlanOperation(
        () => detectComprehensiveSymptoms(query),
        PlanGenerationErrorType.SYMPTOM_DETECTION,
        "Symptom Detection"
      );
      
      if (!symptomAnalysis.symptoms.length) {
        throw new PlanGenerationError(
          "No symptoms detected in user input",
          PlanGenerationErrorType.SYMPTOM_DETECTION,
          "Please include specific symptoms or health concerns in your query.",
          { query },
          ["Mention any pain or discomfort you're experiencing", "Describe your health goals"]
        );
      }
      
      // Step 2: Extract timeframe information
      const { weeks: detectedTimeframe = DEFAULT_TIMEFRAME_WEEKS, isUrgent = false } = 
        detectTimeframes(lowerQuery, [], {}) || {};
      const goalTimeframe = extractGoalTimeframe(query) || 0;
      const effectiveTimeframe = goalTimeframe || detectedTimeframe || DEFAULT_TIMEFRAME_WEEKS;
      
      // Step 3: Extract goals from input
      const goalKeywords = ["race", "weight loss", "pain free", "mobility", "strength", "fitness", "wellness"];
      const goals = goalKeywords.filter(goal => lowerQuery.includes(goal));
      if (!goals.length) goals.push("general wellness");
      
      // Step 4: Enhanced service matching based on symptoms and goals
      const serviceMatches = await safePlanOperation(
        () => matchServicesToSymptoms(
          symptomAnalysis.symptoms,
          symptomAnalysis.priorities,
          goals,
          undefined,
          isUrgent
        ),
        PlanGenerationErrorType.SERVICE_MATCHING,
        "Service Matching"
      );
      
      if (!serviceMatches.length) {
        throw new PlanGenerationError(
          "Failed to match services to user needs",
          PlanGenerationErrorType.SERVICE_MATCHING,
          "We couldn't determine which health services match your needs. Please be more specific."
        );
      }
      
      // Extract top services and their primary conditions
      const topServices = serviceMatches.slice(0, 3).map(match => match.category);
      const primaryCondition = serviceMatches[0].primaryCondition || 
                              symptomAnalysis.primarySymptoms[0] ||
                              symptomAnalysis.symptoms[0] || 
                              "general health";
      
      // Build service priorities mapping
      // Create with all service categories to satisfy TypeScript
      const servicePriorities = Object.keys(BASELINE_COSTS).reduce((acc, key) => {
        acc[key as ServiceCategory] = 0;
        return acc;
      }, {} as Record<ServiceCategory, number>);
      
      // Update with actual service matches
      serviceMatches.forEach(match => {
        servicePriorities[match.category] = match.score;
      });
      
      // Step 5: Extract budget information
      // Keep the existing budget detection for compatibility
      const budgetConstraint = detectBudgetConstraint(lowerQuery);
      
      return { 
        symptoms: symptomAnalysis.symptoms, 
        primarySymptoms: symptomAnalysis.primarySymptoms,
        priorities: symptomAnalysis.priorities, 
        contraindications: symptomAnalysis.contraindications,
        effectiveTimeframe,
        isUrgent, 
        goals, 
        serviceMatches,
        topServices,
        primaryCondition,
        servicePriorities,
        budgetConstraint
      };
    } catch (error) {
      if (error instanceof PlanGenerationError) {
        throw error;
      } else {
        const message = error instanceof Error ? error.message : String(error);
        throw new PlanGenerationError(
          `Error analyzing user input: ${message}`,
          PlanGenerationErrorType.UNEXPECTED,
          "An unexpected error occurred while analyzing your input."
        );
      }
    }
  };

  /**
   * Helper function to detect budget constraints from input
   */
  const detectBudgetConstraint = (inputLower: string): {
    budget: number;
    isStrictBudget: boolean;
  } => {
    // Enhanced budget detection with better regex patterns
    const budgetMatch = inputLower.match(/r\s*(\d{1,6})/i) || 
                      inputLower.match(/budget[^0-9]*(\d{1,6})/i) ||
                      inputLower.match(/afford[^0-9]*(\d{1,6})/i) ||
                      inputLower.match(/spend[^0-9]*(\d{1,6})/i);
    
    // Determine if the budget constraint is strict
    const strictBudgetPhrases = [
      "can't spend more", "cannot spend more", "maximum", "max", 
      "tight budget", "strict budget", "only", "just", "limited to"
    ];
    
    const isStrictBudget = strictBudgetPhrases.some(phrase => inputLower.includes(phrase));
    
    // Extract budget amount
    let budget = DEFAULT_BUDGET;
    if (budgetMatch && budgetMatch[1]) {
      budget = Math.max(MIN_BUDGET, parseInt(budgetMatch[1], 10));
    }
    
    return { budget, isStrictBudget };
  };

  /**
   * Creates a plan with specified budget tier and optional name prefix
   */
  const buildPlanForBudget = (params: {
    query: string, 
    primaryCondition: string, 
    services: ServiceCategory[], 
    servicePriorities: Record<ServiceCategory, number>,
    budget: number, 
    timeframeWeeks: number, 
    isStrictBudget: boolean, 
    goals: string[], 
    urgencyLevel: number,
    tierName: string
  }) => {
    const plan = createHealthPlan({
      input: params.query,
      primaryCondition: params.primaryCondition,
      services: params.services,
      servicePriorities: params.servicePriorities,
      budget: params.budget,
      timeframeWeeks: params.timeframeWeeks,
      isStrictBudget: params.isStrictBudget,
      goals: params.goals,
      urgencyLevel: params.urgencyLevel
    });
    
    if (params.tierName) {
      plan.name = `${params.tierName}: ${plan.name}`;
    }
    
    return plan;
  };

  /**
   * Generates AI health plans based on user query with improved detection,
   * matching, and budget handling
   */
  const generateAIPlans = useCallback(async (query: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log("Generating AI plans with query:", query);
      
      // Step 1: Analyze user input
      const analysis = await analyzeUserInput(query);
      console.log("User input analysis complete:", analysis);
      
      // Step 2: Generate budget tiers
      const budgetTiers = generateBudgetTiers(
        analysis.budgetConstraint.budget,
        analysis.budgetConstraint.isStrictBudget,
        analysis.topServices,
        analysis.effectiveTimeframe
      );
      
      // Step 3: Build diverse plans based on budget tiers
      const urgencyLevel = analysis.isUrgent ? 0.8 : 0.4;
      const plans: AIHealthPlan[] = [];
      
      // Generate a plan for each budget tier
      for (const tier of budgetTiers) {
        try {
          console.log(`Generating ${tier.name} tier plan with budget ${tier.budget}`);
          
          // Optimize service allocation within this budget tier
          const serviceAllocations = optimizeServiceAllocation(
            tier.budget,
            analysis.topServices,
            tier.servicePriorities,
            tier.maxSessions,
            tier.isStrictBudget
          );
          
          // Only include services that received at least 1 session
          const includedServices = serviceAllocations
            .filter(allocation => allocation.sessions > 0)
            .map(allocation => allocation.type);
          
          // Build the plan
          const plan = buildPlanForBudget({
            query,
            primaryCondition: analysis.primaryCondition,
            services: includedServices,
            servicePriorities: analysis.servicePriorities,
            budget: tier.budget,
            timeframeWeeks: analysis.effectiveTimeframe,
            isStrictBudget: tier.isStrictBudget,
            goals: analysis.goals,
            urgencyLevel,
            tierName: tier.name
          });
          
          plans.push(plan);
          console.log(`Generated ${tier.name} plan:`, plan.name);
        } catch (error) {
          console.error(`Error generating ${tier.name} plan:`, error);
          // Continue generating other plans even if one fails
        }
      }
      
      if (plans.length === 0) {
        throw new PlanGenerationError(
          "Failed to generate any valid plans",
          PlanGenerationErrorType.PLAN_CREATION,
          "We couldn't create health plans based on your input. Please try providing different details."
        );
      }
      
      // Sort plans by cost for consistent display
      const sortedPlans = plans.sort((a, b) => a.totalCost - b.totalCost);
      setAiPlans(sortedPlans);
      
      console.log("Successfully generated plans:", sortedPlans.length);
    } catch (error) {
      console.error("Error generating AI plans:", error);
      
      if (error instanceof PlanGenerationError) {
        setError(error.userMessage);
        
        toast({
          title: "Error generating health plans",
          description: error.userMessage,
          variant: "destructive",
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to generate health plans";
        setError(errorMessage);
        
        toast({
          title: "Error generating health plans",
          description: errorMessage + " Please try again with more details.",
          variant: "destructive",
        });
      }
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

/**
 * Helper function for multidisciplinaryPlanBuilder compatibility
 * Will be refactored in a future update
 */
function createHealthPlan(params: {
  input: string;
  primaryCondition: string;
  services: ServiceCategory[];
  servicePriorities: Record<ServiceCategory, number>;
  budget: number;
  timeframeWeeks: number;
  isStrictBudget: boolean;
  goals: string[];
  urgencyLevel: number;
}): AIHealthPlan {
  // Try to use the imported function first
  try {
    return importedBuildMultidisciplinaryPlan(params);
  } catch (error) {
    console.error("Error using imported builder:", error);
    // Fall back to local implementation
  }

  // This is a temporary compatibility function that will be replaced with the enhanced plan builder
  const planName = generatePlanName(params.primaryCondition, params.services, params.budget);
  
  // Define max sessions mapping for all service categories
  const maxSessions: Record<ServiceCategory, number> = Object.keys(BASELINE_COSTS).reduce((acc, key) => {
    const serviceCategory = key as ServiceCategory;
    const isHighBudget = params.budget > 2000;
    
    // Set default values for all categories
    acc[serviceCategory] = isHighBudget ? 2 : 1;
    
    // Override values for specific categories
    if (serviceCategory === 'personal-trainer') acc[serviceCategory] = isHighBudget ? 8 : 4;
    if (serviceCategory === 'dietician') acc[serviceCategory] = isHighBudget ? 4 : 2;
    if (serviceCategory === 'physiotherapist') acc[serviceCategory] = isHighBudget ? 6 : 3;
    if (serviceCategory === 'family-medicine') acc[serviceCategory] = isHighBudget ? 2 : 1;
    if (serviceCategory === 'coaching') acc[serviceCategory] = isHighBudget ? 4 : 2; 
    if (serviceCategory === 'psychiatry') acc[serviceCategory] = isHighBudget ? 3 : 2;
    if (serviceCategory === 'biokineticist') acc[serviceCategory] = isHighBudget ? 3 : 2;
    if (serviceCategory === 'pain-management') acc[serviceCategory] = isHighBudget ? 3 : 2;
    
    return acc;
  }, {} as Record<ServiceCategory, number>);
  
  // Generate services based on optimized allocation
  const allocations = optimizeServiceAllocation(
    params.budget, 
    params.services,
    params.servicePriorities,
    maxSessions,
    params.isStrictBudget
  );
  
  // Create services for the plan
  const planServices = allocations.map(allocation => {
    return {
      type: allocation.type,
      sessions: allocation.sessions,
      price: allocation.costPerSession,
      description: generateServiceDescription(allocation.type, params.primaryCondition, params.budget > 2000)
    };
  });
  
  // Calculate total cost
  const totalCost = allocations.reduce((sum, allocation) => sum + allocation.totalCost, 0);
  
  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: planName,
    description: generatePlanDescription(params.primaryCondition, params.goals, params.budget),
    services: planServices,
    totalCost,
    planType: 'best-fit',
    timeFrame: `${params.timeframeWeeks} weeks`
  };
}

/**
 * Generates a plan name based on primary condition and services
 */
function generatePlanName(primaryCondition: string, services: ServiceCategory[], budget: number): string {
  // Create a descriptive plan name
  let baseName = "Wellness Plan";
  
  if (primaryCondition.includes("pain")) {
    baseName = "Pain Management Plan";
  } else if (primaryCondition.includes("weight")) {
    baseName = "Weight Management Plan";
  } else if (primaryCondition.includes("fitness") || primaryCondition.includes("strength")) {
    baseName = "Fitness Enhancement Plan";
  } else if (primaryCondition.includes("anxiety") || primaryCondition.includes("stress")) {
    baseName = "Stress Management Plan";
  } else if (primaryCondition.includes("race") || primaryCondition.includes("marathon")) {
    baseName = "Race Preparation Plan";
  }
  
  // Add specialization based on services
  if (services.includes('physiotherapist') && services.includes('personal-trainer')) {
    baseName += " with Rehabilitation Focus";
  } else if (services.includes('dietician') && services.includes('personal-trainer')) {
    baseName += " with Nutrition & Fitness";
  } else if (services.includes('coaching') && services.includes('psychiatry')) {
    baseName += " with Mental Wellness";
  }
  
  return baseName;
}

/**
 * Generates a service description based on service type and context
 */
function generateServiceDescription(type: ServiceCategory, condition: string, isPremium: boolean): string {
  // Create a complete mapping for all service categories
  const allCategories = Object.keys(BASELINE_COSTS) as ServiceCategory[];
  
  // Create base descriptions with default values for all categories
  const baseDescriptions = allCategories.reduce((acc, category) => {
    acc[category] = {
      standard: "Professional healthcare service",
      premium: "Premium professional healthcare service"
    };
    return acc;
  }, {} as Record<ServiceCategory, { standard: string, premium: string }>);
  
  // Override with specific descriptions for common categories
  Object.assign(baseDescriptions, {
    'personal-trainer': {
      standard: "Guided exercise sessions tailored to your fitness level",
      premium: "Personalized training program with advanced exercise techniques"
    },
    'dietician': {
      standard: "Nutritional guidance with meal planning support",
      premium: "Comprehensive nutritional assessment with customized meal plans"
    },
    'physiotherapist': {
      standard: "Focused treatment to improve movement and function",
      premium: "Advanced rehabilitation with specialized manual techniques"
    },
    'coaching': {
      standard: "Supportive guidance for achieving your health goals",
      premium: "Strategic coaching with performance optimization techniques"
    },
    'psychiatry': {
      standard: "Professional mental health support and treatment",
      premium: "Comprehensive mental wellness program with personalized strategies"
    },
    'family-medicine': {
      standard: "General healthcare consultation and basic assessment",
      premium: "Thorough medical evaluation with ongoing monitoring"
    },
    'gastroenterology': {
      standard: "Digestive health assessment and treatment recommendations",
      premium: "Specialized gastrointestinal evaluation and management plan"
    },
    'biokineticist': {
      standard: "Movement assessment and personalized exercise plan",
      premium: "Advanced biomechanical analysis with personalized corrective program"
    },
    'pain-management': {
      standard: "Pain assessment and relief strategies",
      premium: "Comprehensive pain management program with integrated techniques"
    }
  });
  
  // Get base description based on service type and premium level
  const baseDescription = baseDescriptions[type][isPremium ? 'premium' : 'standard'];
  
  // Customize further based on condition
  if (condition.includes("knee") && type === 'physiotherapist') {
    return isPremium ? 
      "Specialized knee rehabilitation with advanced techniques and progressive exercises" :
      "Targeted knee therapy to improve movement and reduce pain";
  } else if (condition.includes("back") && type === 'physiotherapist') {
    return isPremium ?
      "Comprehensive back assessment with specialized manual therapy and corrective exercises" :
      "Back pain treatment with personalized exercises and techniques";
  } else if (condition.includes("weight") && type === 'dietician') {
    return isPremium ?
      "Personalized weight management nutrition plan with detailed meal strategies" :
      "Nutritional guidance focused on sustainable weight management";
  } else if (condition.includes("race") && type === 'personal-trainer') {
    return isPremium ?
      "Specialized race preparation program with periodized training and performance analysis" :
      "Structured training plans to prepare you for your upcoming race";
  }
  
  return baseDescription;
}

/**
 * Generates a plan description based on condition and goals
 */
function generatePlanDescription(condition: string, goals: string[], budget: number): string {
  let description = "A personalized health plan designed to address your specific needs";
  
  // Enhance description based on primary condition
  if (condition.includes("knee")) {
    description = "A specialized plan focused on knee rehabilitation and improved mobility";
  } else if (condition.includes("back")) {
    description = "A comprehensive plan to address back pain and improve spinal health";
  } else if (condition.includes("weight")) {
    description = "A balanced approach to weight management combining nutrition and activity";
  } else if (condition.includes("anxiety") || condition.includes("stress")) {
    description = "A supportive plan designed to reduce stress and improve mental wellbeing";
  } else if (condition.includes("race") || condition.includes("marathon")) {
    description = "A structured program to prepare you for your race with optimal performance";
  }
  
  // Add goal-specific details
  if (goals.includes("weight loss")) {
    description += " with emphasis on sustainable weight management";
  } else if (goals.includes("strength")) {
    description += " focused on building functional strength and stability";
  } else if (goals.includes("mobility")) {
    description += " designed to enhance range of motion and movement quality";
  } else if (goals.includes("race")) {
    description += " tailored to optimize your race preparation";
  }
  
  // Add budget context
  if (budget < 1000) {
    description += ". This plan efficiently uses your budget for maximum impact.";
  } else if (budget > 3000) {
    description += ". This comprehensive plan provides extensive professional support.";
  } else {
    description += ". This balanced plan offers well-rounded professional guidance.";
  }
  
  return description;
}
