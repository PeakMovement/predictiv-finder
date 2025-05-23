
import { AIHealthPlan, ServiceCategory } from '@/types';
import { generatePlanName, generatePlanDescription } from './planNaming';
import { determinePlanType } from './planTypeDetection';
import { determineTimeFrame } from './timeFrameDetection';
import { maximizeUtility, generateTreatmentOptions, OptimizedPlan } from '../optimizers/utilityMaximizer';
import { PlanGenerationError, PlanGenerationErrorType } from '../errorHandling/planGenerationError';

/**
 * Generate a plan using utility maximization approach
 * 
 * This implements the formula:
 * 
 * Maximize: Sum(u_i * x_i) for all treatments i
 * Subject to:
 *   - Sum(c_i * x_i) <= User Budget
 *   - Sum(t_i * x_i) <= User Available Time
 *   - Min_i <= x_i <= Max_i for all i
 *   - x_i are non-negative integers
 * 
 * Where:
 *   - x_i = number of sessions of treatment i per month
 *   - u_i = expected utility per session of treatment i
 *   - c_i = cost per session of treatment i
 *   - t_i = time per session of treatment i
 */
export function generateUtilityBasedPlan(
  context: {
    medicalConditions?: string[];
    serviceTypes: ServiceCategory[];
    budget: number;
    timeAvailability: number; // in minutes per month
    goal?: string;
    urgency?: number; // 1-10
    conditionSeverity?: number; // 0-1
    location?: string;
    preferOnline?: boolean;
    diversityFactor?: number; // 0-1
  }
): AIHealthPlan {
  try {
    // Extract context values with defaults
    const {
      medicalConditions = ['general health'],
      serviceTypes,
      budget,
      timeAvailability,
      goal,
      urgency = 5,
      conditionSeverity = 0.5,
      diversityFactor = 0.3
    } = context;
    
    if (!serviceTypes || serviceTypes.length === 0) {
      throw new PlanGenerationError(
        "No service types provided",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please specify which types of healthcare services you're considering."
      );
    }
    
    if (!budget || budget <= 0) {
      throw new PlanGenerationError(
        "Invalid budget",
        PlanGenerationErrorType.BUDGET_CALCULATION,
        "Please provide a valid monthly budget for your health plan."
      );
    }
    
    if (!timeAvailability || timeAvailability <= 0) {
      throw new PlanGenerationError(
        "Invalid time availability",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please specify how much time you have available per month for treatments."
      );
    }
    
    // Use the main condition for utility calculations
    const mainCondition = medicalConditions[0];
    
    // Generate treatment options
    const treatmentOptions = generateTreatmentOptions(
      serviceTypes,
      mainCondition,
      conditionSeverity,
      urgency
    );
    
    // Run utility maximization
    const optimizedPlan = maximizeUtility(
      treatmentOptions,
      {
        budget,
        timeAvailable: timeAvailability,
        diversityFactor,
        urgencyWeight: urgency > 7 ? 2.0 : 1.5
      }
    );
    
    // Convert optimized plan to AIHealthPlan format
    return convertToAIHealthPlan(optimizedPlan, context);
    
  } catch (error) {
    console.error("Error generating utility-based plan:", error);
    
    if (error instanceof PlanGenerationError) {
      throw error;
    }
    
    throw new PlanGenerationError(
      `Error in utility-based plan generation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PlanGenerationErrorType.PLAN_CREATION,
      "We encountered a problem creating your optimized health plan. Please check your inputs and try again.",
      { originalError: error }
    );
  }
}

/**
 * Convert an optimized plan to AIHealthPlan format
 */
function convertToAIHealthPlan(optimizedPlan: OptimizedPlan, context: any): AIHealthPlan {
  const {
    medicalConditions = ['general health'],
    goal = 'improve health',
    location,
    preferOnline
  } = context;
  
  // Create the plan
  const plan: AIHealthPlan = {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: generatePlanName({
      medicalConditions,
      goal
    }),
    description: `Utility-maximized plan for ${medicalConditions.join(', ')}. This plan optimally balances health benefits, cost, and time constraints to maximize overall value.`,
    services: optimizedPlan.allocations.map(allocation => ({
      type: allocation.serviceType,
      price: allocation.totalCost / allocation.sessionsPerMonth,
      sessions: allocation.sessionsPerMonth,
      description: `${allocation.sessionsPerMonth}× ${allocation.serviceType.replace(/-/g, ' ')} sessions (${Math.round(allocation.percentageBudget)}% of budget)`
    })),
    totalCost: optimizedPlan.totalCost,
    planType: 'best-fit',
    timeFrame: determineTimeFrame({
      medicalConditions,
      goal,
      budget: context.budget
    })
  };
  
  // Add plan metrics as custom properties
  (plan as any).matchScore = 0.95; // High confidence in utility-maximized plan
  (plan as any).utilityScore = optimizedPlan.totalUtility;
  (plan as any).timeRequiredMinutes = optimizedPlan.totalTime;
  (plan as any).optimizationNotes = optimizedPlan.notes;
  
  // Add additional context if available
  if (location) {
    (plan as any).location = location;
  }
  
  if (preferOnline !== undefined) {
    (plan as any).isRemote = preferOnline;
  }
  
  return plan;
}

/**
 * Generate multiple utility-optimized plans with different priorities
 */
export function generateUtilityBasedPlans(
  context: {
    medicalConditions?: string[];
    serviceTypes: ServiceCategory[];
    budget: number;
    timeAvailability: number;
    goal?: string;
    urgency?: number;
    conditionSeverity?: number;
    location?: string;
    preferOnline?: boolean;
  }
): AIHealthPlan[] {
  const plans: AIHealthPlan[] = [];
  
  // Standard balanced plan
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.3
  }));
  
  // High diversity plan - spreads resources across more services
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.7,
    budget: context.budget * 0.95 // Slightly reduced budget to account for admin costs
  }));
  
  // Focused plan - concentrates resources on fewer high-impact services
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.1,
    serviceTypes: context.serviceTypes.slice(0, Math.max(3, Math.floor(context.serviceTypes.length / 2)))
  }));
  
  // Set appropriate plan types
  plans[0].planType = 'best-fit';
  plans[1].planType = 'progressive';
  plans[2].planType = 'high-impact';
  
  // Customize descriptions
  plans[1].description = "This progressive plan distributes resources across a diverse range of services for comprehensive care.";
  plans[2].description = "This high-impact plan focuses resources on the most effective treatments for your specific condition.";
  
  return plans;
}
