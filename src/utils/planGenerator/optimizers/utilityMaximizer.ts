
import { ServiceCategory, BASELINE_COSTS } from "../types";
import { PlanGenerationError, PlanGenerationErrorType } from "../errorHandling/planGenerationError";
import { safePlanOperation } from "../errorHandling/planGenerationError";

/**
 * Treatment option interface for the utility maximizer
 */
export interface TreatmentOption {
  serviceType: ServiceCategory;
  utility: number;        // Expected utility per session
  cost: number;           // Cost per session
  timeRequired: number;   // Time required per session in minutes
  minSessions: number;    // Minimum number of sessions recommended
  maxSessions: number;    // Maximum number of sessions beneficial
  priority: number;       // Priority score (1-10)
  urgency: number;        // Urgency score (1-10)
}

/**
 * Constraint interface for the utility maximizer
 */
export interface OptimizationConstraints {
  budget: number;         // Total available budget
  timeAvailable: number;  // Total available time in minutes
  diversityFactor?: number; // 0-1 factor for service diversity (higher = more diverse)
  urgencyWeight?: number;   // Weight for urgency in utility calculation
}

/**
 * Result interface from the utility maximizer
 */
export interface OptimizedPlan {
  allocations: Array<{
    serviceType: ServiceCategory;
    sessionsPerMonth: number;
    totalUtility: number;
    totalCost: number;
    timeRequired: number;
    percentageBudget: number;
  }>;
  totalCost: number;
  totalUtility: number;
  totalTime: number;
  utilizationRate: {
    budget: number;      // Percentage of budget utilized
    time: number;        // Percentage of time utilized
  };
  notes: string[];
}

/**
 * Utility maximization function that implements the formula:
 * 
 * Maximize: Sum(utility_i * sessions_i) for all treatments i
 * Subject to:
 *   - Sum(cost_i * sessions_i) <= budget
 *   - Sum(time_i * sessions_i) <= available time
 *   - min_sessions_i <= sessions_i <= max_sessions_i
 *   - sessions_i must be non-negative integers
 * 
 * @param options Available treatment options
 * @param constraints Budget and time constraints
 * @returns Optimized treatment plan
 */
export function maximizeUtility(
  options: TreatmentOption[],
  constraints: OptimizationConstraints
): OptimizedPlan {
  return safePlanOperation(() => {
    const { budget, timeAvailable, diversityFactor = 0.3, urgencyWeight = 1.5 } = constraints;
    
    // Validate inputs
    if (budget <= 0) {
      throw new PlanGenerationError(
        "Budget must be positive",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please provide a valid budget amount."
      );
    }
    
    if (timeAvailable <= 0) {
      throw new PlanGenerationError(
        "Available time must be positive",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please provide valid time availability."
      );
    }
    
    if (options.length === 0) {
      throw new PlanGenerationError(
        "No treatment options provided",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "No treatment options are available for optimization."
      );
    }
    
    // Apply urgency weights to utility scores
    const weightedOptions = options.map(option => ({
      ...option,
      weightedUtility: option.utility * (1 + (option.urgency / 10) * urgencyWeight)
    }));
    
    // Calculate utility to cost ratio for each option
    const rankedOptions = weightedOptions.map(option => ({
      ...option,
      utilityToCostRatio: option.weightedUtility / option.cost,
      utilityToTimeRatio: option.weightedUtility / option.timeRequired
    })).sort((a, b) => b.utilityToCostRatio - a.utilityToCostRatio);
    
    // Initialize allocation array
    const allocations = rankedOptions.map(option => ({
      serviceType: option.serviceType,
      sessionsPerMonth: 0,
      totalUtility: 0,
      totalCost: 0,
      timeRequired: 0,
      percentageBudget: 0
    }));
    
    let remainingBudget = budget;
    let remainingTime = timeAvailable;
    const notes: string[] = [];
    
    // First pass: Ensure minimum sessions for each treatment
    for (let i = 0; i < rankedOptions.length; i++) {
      const option = rankedOptions[i];
      const minSessions = option.minSessions;
      
      // Check if we can afford minimum sessions
      const costForMin = option.cost * minSessions;
      const timeForMin = option.timeRequired * minSessions;
      
      if (costForMin <= remainingBudget && timeForMin <= remainingTime) {
        // Allocate minimum sessions
        allocations[i].sessionsPerMonth = minSessions;
        allocations[i].totalCost = costForMin;
        allocations[i].totalUtility = option.weightedUtility * minSessions;
        allocations[i].timeRequired = timeForMin;
        
        remainingBudget -= costForMin;
        remainingTime -= timeForMin;
      } else {
        // Can't afford minimum sessions for this option
        notes.push(`Insufficient resources for minimum sessions of ${option.serviceType}`);
      }
    }
    
    // Second pass: Distribute remaining resources based on utility-to-cost ratio
    // with diversity factor consideration
    let serviceTypeCounts: Record<string, number> = {};
    let canAllocateMore = true;
    
    while (canAllocateMore) {
      canAllocateMore = false;
      
      // Try to allocate one more session to the best option that fits
      for (let i = 0; i < rankedOptions.length; i++) {
        const option = rankedOptions[i];
        
        // Skip if we've reached maximum sessions
        if (allocations[i].sessionsPerMonth >= option.maxSessions) {
          continue;
        }
        
        // Apply diversity factor - reduce utility-to-cost ratio as we add more sessions
        const currentSessions = allocations[i].sessionsPerMonth;
        const categoryCount = serviceTypeCounts[option.serviceType] || 0;
        const diversityPenalty = Math.pow(diversityFactor, categoryCount);
        
        // Calculate adjusted ratio considering diversity
        const adjustedRatio = option.utilityToCostRatio * diversityPenalty;
        
        // Check if we can afford one more session
        if (option.cost <= remainingBudget && option.timeRequired <= remainingTime) {
          // Add one more session
          allocations[i].sessionsPerMonth++;
          allocations[i].totalCost += option.cost;
          allocations[i].totalUtility += option.weightedUtility;
          allocations[i].timeRequired += option.timeRequired;
          
          remainingBudget -= option.cost;
          remainingTime -= option.timeRequired;
          
          // Update service type counts for diversity calculation
          serviceTypeCounts[option.serviceType] = (serviceTypeCounts[option.serviceType] || 0) + 1;
          
          canAllocateMore = true;
          break; // Break and restart to re-evaluate all options with updated constraints
        }
      }
    }
    
    // Calculate totals and percentages
    let totalCost = 0;
    let totalUtility = 0;
    let totalTime = 0;
    
    for (const allocation of allocations) {
      totalCost += allocation.totalCost;
      totalUtility += allocation.totalUtility;
      totalTime += allocation.timeRequired;
      
      // Calculate percentage of budget
      allocation.percentageBudget = (allocation.totalCost / budget) * 100;
    }
    
    // Filter out services with zero sessions
    const filteredAllocations = allocations.filter(a => a.sessionsPerMonth > 0);
    
    // Add notes on resource utilization
    const budgetUtilization = (totalCost / budget) * 100;
    const timeUtilization = (totalTime / timeAvailable) * 100;
    
    if (budgetUtilization > 90) {
      notes.push("Budget is fully utilized in this plan.");
    } else if (budgetUtilization < 70) {
      notes.push("This plan uses only part of your budget, leaving room for additional treatments if desired.");
    }
    
    if (timeUtilization > 90) {
      notes.push("Your available time is fully utilized in this plan.");
    } else if (timeUtilization < 70) {
      notes.push("This plan leaves you with free time for other activities.");
    }
    
    // Return the optimized plan
    return {
      allocations: filteredAllocations,
      totalCost,
      totalUtility,
      totalTime,
      utilizationRate: {
        budget: budgetUtilization,
        time: timeUtilization
      },
      notes
    };
  }, PlanGenerationErrorType.PLAN_CREATION, "utility maximization");
}

/**
 * Estimate treatment utility based on evidence and efficacy for a condition
 */
export function estimateTreatmentUtility(
  serviceType: ServiceCategory,
  condition: string,
  severity: number = 0.5
): number {
  // This would ideally be based on medical evidence and research
  // For now, using a simplified model
  const baseUtility = 5; // Scale of 1-10
  
  // Example evidence-based adjustments
  const utilityModifiers: Partial<Record<ServiceCategory, number>> = {
    'physiotherapist': 8,
    'psychology': 7,
    'general-practitioner': 6,
    'dietician': 6,
    'personal-trainer': 5.5,
    'coaching': 4,
    'psychiatry': 7.5,
    'orthopedic-surgeon': 8
  };
  
  // Condition-specific efficacy (would be expanded with real data)
  const conditionLower = condition.toLowerCase();
  let conditionModifier = 1.0;
  
  if (conditionLower.includes('pain') && serviceType === 'physiotherapist') {
    conditionModifier = 1.4;
  } else if (conditionLower.includes('anxiety') && serviceType === 'psychology') {
    conditionModifier = 1.5;
  } else if (conditionLower.includes('diet') && serviceType === 'dietician') {
    conditionModifier = 1.6;
  }
  
  // Severity adjustment - more severe conditions benefit more from treatment
  const severityModifier = 0.5 + severity;
  
  // Calculate final utility
  const serviceUtility = utilityModifiers[serviceType] || baseUtility;
  return serviceUtility * conditionModifier * severityModifier;
}

/**
 * Generate treatment options based on user context
 */
export function generateTreatmentOptions(
  serviceTypes: ServiceCategory[], 
  mainCondition: string,
  conditionSeverity: number = 0.5,
  urgencyLevel: number = 5
): TreatmentOption[] {
  return serviceTypes.map(serviceType => {
    const baseCost = BASELINE_COSTS[serviceType] || 500;
    const baseTimeRequired = estimateSessionDuration(serviceType);
    const utility = estimateTreatmentUtility(serviceType, mainCondition, conditionSeverity);
    
    return {
      serviceType,
      utility,
      cost: baseCost,
      timeRequired: baseTimeRequired,
      minSessions: estimateMinSessions(serviceType, conditionSeverity),
      maxSessions: estimateMaxSessions(serviceType, conditionSeverity),
      priority: estimateServicePriority(serviceType, mainCondition),
      urgency: urgencyLevel
    };
  });
}

/**
 * Estimate optimal service session duration
 */
function estimateSessionDuration(serviceType: ServiceCategory): number {
  // Duration in minutes
  const durationMap: Partial<Record<ServiceCategory, number>> = {
    'physiotherapist': 60,
    'biokineticist': 60,
    'dietician': 45,
    'personal-trainer': 60,
    'psychology': 50,
    'coaching': 45,
    'psychiatry': 30,
    'general-practitioner': 15,
    'orthopedic-surgeon': 30,
    'massage-therapy': 60,
    'yoga-instructor': 60,
    'pilates-instructor': 45
  };
  
  return durationMap[serviceType] || 30; // Default to 30 minutes
}

/**
 * Estimate minimum sessions needed for a service
 */
function estimateMinSessions(serviceType: ServiceCategory, severity: number): number {
  // Minimum sessions per month
  const minSessionsMap: Partial<Record<ServiceCategory, number>> = {
    'physiotherapist': 2,
    'biokineticist': 1,
    'dietician': 1,
    'personal-trainer': 2,
    'psychology': 2,
    'coaching': 1,
    'psychiatry': 1,
    'general-practitioner': 1
  };
  
  // Adjust by severity
  let baseSessions = minSessionsMap[serviceType] || 1;
  if (severity > 0.7) {
    baseSessions = Math.ceil(baseSessions * 1.5);
  }
  
  return baseSessions;
}

/**
 * Estimate maximum beneficial sessions
 */
function estimateMaxSessions(serviceType: ServiceCategory, severity: number): number {
  // Maximum beneficial sessions per month
  const maxSessionsMap: Partial<Record<ServiceCategory, number>> = {
    'physiotherapist': 8,
    'biokineticist': 8,
    'dietician': 4,
    'personal-trainer': 12,
    'psychology': 4,
    'coaching': 4,
    'psychiatry': 2,
    'general-practitioner': 2,
    'massage-therapy': 4,
    'yoga-instructor': 12,
    'pilates-instructor': 8
  };
  
  // Adjust by severity
  let maxSessions = maxSessionsMap[serviceType] || 4;
  if (severity > 0.7) {
    maxSessions = Math.ceil(maxSessions * 1.2);
  }
  
  return maxSessions;
}

/**
 * Estimate service priority for a condition
 */
function estimateServicePriority(serviceType: ServiceCategory, condition: string): number {
  // Base priority (1-10)
  const basePriorityMap: Partial<Record<ServiceCategory, number>> = {
    'general-practitioner': 9,
    'psychiatry': 8,
    'psychology': 7,
    'physiotherapist': 6,
    'dietician': 5,
    'personal-trainer': 4,
    'coaching': 3
  };
  
  // Condition-specific priority adjustments
  const conditionLower = condition.toLowerCase();
  let priorityAdjustment = 0;
  
  if (conditionLower.includes('pain') && serviceType === 'physiotherapist') {
    priorityAdjustment = 3;
  } else if (conditionLower.includes('anxiety') && serviceType === 'psychology') {
    priorityAdjustment = 3;
  } else if (conditionLower.includes('diet') && serviceType === 'dietician') {
    priorityAdjustment = 4;
  }
  
  return Math.min(10, (basePriorityMap[serviceType] || 5) + priorityAdjustment);
}
