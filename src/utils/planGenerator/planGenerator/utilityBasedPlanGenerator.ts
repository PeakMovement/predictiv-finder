
import { AIHealthPlan, ServiceCategory } from '@/types';
import { generatePlanName, generatePlanDescription } from './planNaming';
import { determinePlanType } from './planTypeDetection';
import { determineTimeFrame } from './timeFrameDetection';
import { maximizeUtility, generateTreatmentOptions } from '../optimizers/utilityMaximizer';
import { PlanGenerationError, PlanGenerationErrorType } from '../errorHandling/planGenerationError';
import { EnhancedTreatmentOption, getTreatmentsByGoal, getTreatmentsByLocation } from '../data/treatmentOptions';
import { maximizeUtilityEnhanced } from '../optimizers/enhancedUtilityMaximizer';

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
    availableDays?: string[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    useRealTreatmentData?: boolean;
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
      diversityFactor = 0.3,
      location,
      preferOnline,
      availableDays,
      timeOfDay,
      useRealTreatmentData = false
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
    
    let optimizedPlan;
    
    if (useRealTreatmentData) {
      // Use the real treatment data from our dataset
      let availableTreatments: EnhancedTreatmentOption[] = [];
      
      // Convert goal to keywords for filtering
      const goalKeywords = goal ? goal.toLowerCase().split(/\s+/) : [];
      
      // If we have specific goals, filter treatments by goals
      if (goalKeywords.length > 0) {
        availableTreatments = getTreatmentsByGoal(goalKeywords);
      }
      
      // If no treatments match goals or no goals specified, filter by medical conditions
      if (availableTreatments.length === 0) {
        availableTreatments = getTreatmentsByGoal(medicalConditions);
      }
      
      // If location is specified, filter by location
      if (location && availableTreatments.length > 0) {
        const locationTreatments = getTreatmentsByLocation(location);
        // Intersection of goal and location treatments
        availableTreatments = availableTreatments.filter(t => 
          locationTreatments.some(lt => lt.id === t.id)
        );
      }
      
      // If still no treatments, use all treatments
      if (availableTreatments.length === 0) {
        console.log("No specific treatments matched criteria, using all available treatments");
        
        // Import all treatments
        const { treatmentOptions } = require('../data/treatmentOptions');
        availableTreatments = treatmentOptions;
      }
      
      // Use enhanced utility maximizer
      optimizedPlan = maximizeUtilityEnhanced(
        availableTreatments,
        {
          budget,
          timeAvailable: timeAvailability,
          diversityFactor,
          urgencyWeight: urgency > 7 ? 2.0 : 1.5,
          location,
          preferOnline,
          availableDays,
          timeOfDay,
          goalKeywords: [...medicalConditions, ...(goal ? goal.toLowerCase().split(/\s+/) : [])]
        }
      );
    } else {
      // Use the standard approach with generated treatment options
      const treatmentOptions = generateTreatmentOptions(
        serviceTypes,
        mainCondition,
        conditionSeverity,
        urgency
      );
      
      // Run utility maximization
      optimizedPlan = maximizeUtility(
        treatmentOptions,
        {
          budget,
          timeAvailable: timeAvailability,
          diversityFactor,
          urgencyWeight: urgency > 7 ? 2.0 : 1.5
        }
      );
    }
    
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
function convertToAIHealthPlan(optimizedPlan: any, context: any): AIHealthPlan {
  const {
    medicalConditions = ['general health'],
    goal = 'improve health',
    location,
    preferOnline,
    useRealTreatmentData
  } = context;
  
  // Create the plan
  const plan: AIHealthPlan = {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: generatePlanName({
      medicalConditions,
      goal
    }),
    description: `Utility-maximized plan for ${medicalConditions.join(', ')}. This plan optimally balances health benefits, cost, and time constraints to maximize overall value.`,
    services: optimizedPlan.allocations.map((allocation: any) => {
      // Different structure between standard and enhanced optimizers
      if (useRealTreatmentData) {
        return {
          type: allocation.serviceType,
          price: allocation.totalCost / allocation.sessionsPerMonth,
          sessions: allocation.sessionsPerMonth,
          description: `${allocation.sessionsPerMonth}× ${allocation.name} with ${allocation.practitioner} (${Math.round(allocation.percentageBudget)}% of budget)`,
          frequency: `${allocation.availability || 'Flexible'}`
        };
      } else {
        return {
          type: allocation.serviceType,
          price: allocation.totalCost / allocation.sessionsPerMonth,
          sessions: allocation.sessionsPerMonth,
          description: `${allocation.sessionsPerMonth}× ${allocation.serviceType.replace(/-/g, ' ')} sessions (${Math.round(allocation.percentageBudget)}% of budget)`
        };
      }
    }),
    totalCost: optimizedPlan.totalCost,
    planType: 'best-fit',
    timeFrame: determineTimeFrame({
      medicalConditions,
      goal,
      budget: context.budget
    })
  };
  
  // Add enhanced plan properties if available
  if (useRealTreatmentData && optimizedPlan.timelineEstimate) {
    (plan as any).expectedTimeToResults = `${optimizedPlan.timelineEstimate} weeks`;
  }
  
  // Add plan metrics as custom properties
  (plan as any).matchScore = 0.95; // High confidence in utility-maximized plan
  (plan as any).utilityScore = optimizedPlan.totalUtility;
  (plan as any).timeRequiredMinutes = optimizedPlan.totalTime;
  (plan as any).optimizationNotes = optimizedPlan.notes;
  
  // Add location breakdown if available
  if (useRealTreatmentData && optimizedPlan.locationBreakdown) {
    (plan as any).sessionBreakdown = {
      inPerson: optimizedPlan.locationBreakdown.inPerson,
      remote: optimizedPlan.locationBreakdown.remote
    };
  }
  
  // Add additional context if available
  if (location) {
    (plan as any).location = location;
  }
  
  if (preferOnline !== undefined) {
    (plan as any).isRemote = preferOnline;
  }
  
  // Add availability notes if present
  if (optimizedPlan.availabilityNotes && optimizedPlan.availabilityNotes.length > 0) {
    (plan as any).availabilityNotes = optimizedPlan.availabilityNotes;
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
    availableDays?: string[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    useRealTreatmentData?: boolean;
  }
): AIHealthPlan[] {
  const plans: AIHealthPlan[] = [];
  
  // Standard balanced plan
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.3,
    useRealTreatmentData: context.useRealTreatmentData || false
  }));
  
  // High diversity plan - spreads resources across more services
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.7,
    budget: context.budget * 0.95, // Slightly reduced budget to account for admin costs
    useRealTreatmentData: context.useRealTreatmentData || false
  }));
  
  // Focused plan - concentrates resources on fewer high-impact services
  plans.push(generateUtilityBasedPlan({
    ...context,
    diversityFactor: 0.1,
    serviceTypes: context.serviceTypes.slice(0, Math.max(3, Math.floor(context.serviceTypes.length / 2))),
    useRealTreatmentData: context.useRealTreatmentData || false
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
