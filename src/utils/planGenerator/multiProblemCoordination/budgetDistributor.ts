
import { ServiceCategory, BASELINE_COSTS } from "../types";

/**
 * Options for budget distribution
 */
export interface BudgetDistributionOptions {
  /** Prioritize by condition severity */
  prioritizeBySeverity: boolean;
  
  /** Whether to allow exceeding the budget */
  allowBudgetExceedance: boolean;
  
  /** Maximum percentage the budget can be exceeded */
  maxBudgetExceedancePercentage: number;
  
  /** Minimum sessions per service if included */
  minimumSessionsPerService: number;
  
  /** Minimum budget percentage for each condition */
  minimumBudgetPercentagePerCondition: number;
  
  /** Distribution strategy */
  distributionStrategy: 'even' | 'proportional' | 'severity-weighted';
}

/**
 * Default budget distribution options
 */
const DEFAULT_DISTRIBUTION_OPTIONS: BudgetDistributionOptions = {
  prioritizeBySeverity: true,
  allowBudgetExceedance: false,
  maxBudgetExceedancePercentage: 0.1, // 10%
  minimumSessionsPerService: 1,
  minimumBudgetPercentagePerCondition: 0.15, // 15% minimum per condition
  distributionStrategy: 'severity-weighted'
};

/**
 * Result of budget allocation
 */
export interface BudgetAllocationResult {
  /** Allocations per service */
  serviceAllocations: Record<ServiceCategory, {
    sessions: number;
    costPerSession: number;
    totalCost: number;
    conditions: string[];
  }>;
  
  /** Allocations per condition */
  conditionAllocations: Record<string, {
    budget: number;
    percentage: number;
    services: ServiceCategory[];
  }>;
  
  /** Total allocated budget */
  totalAllocated: number;
  
  /** Remaining budget */
  remainingBudget: number;
  
  /** Whether the budget was exceeded */
  budgetExceeded: boolean;
  
  /** Distribution notes */
  notes: string[];
}

/**
 * Distribute budget across multiple conditions based on severity and priorities
 * 
 * @param totalBudget Total available budget
 * @param conditions List of conditions
 * @param conditionSeverity Severity scores for conditions
 * @param conditionServiceMap Mapping of conditions to services
 * @param options Budget distribution options
 * @returns Budget allocation result
 */
export function distributeBudgetAcrossConditions(
  totalBudget: number,
  conditions: string[],
  conditionSeverity: Record<string, number>,
  conditionServiceMap: Record<string, ServiceCategory[]>,
  options: Partial<BudgetDistributionOptions> = {}
): BudgetAllocationResult {
  // Merge with default options
  const distributionOptions: BudgetDistributionOptions = {
    ...DEFAULT_DISTRIBUTION_OPTIONS,
    ...options
  };
  
  // Initialize result
  const result: BudgetAllocationResult = {
    serviceAllocations: {},
    conditionAllocations: {},
    totalAllocated: 0,
    remainingBudget: totalBudget,
    budgetExceeded: false,
    notes: []
  };
  
  // Calculate raw weights for each condition
  const conditionWeights: Record<string, number> = {};
  let totalWeight = 0;
  
  conditions.forEach(condition => {
    let weight = 1; // Base weight
    
    if (distributionOptions.prioritizeBySeverity) {
      // Use severity to weight the condition
      const severity = conditionSeverity[condition] || 0.5;
      weight = 1 + (severity * 2); // Scale from 1-3
    }
    
    conditionWeights[condition] = weight;
    totalWeight += weight;
  });
  
  // Calculate percentage allocations
  const rawPercentages: Record<string, number> = {};
  
  Object.entries(conditionWeights).forEach(([condition, weight]) => {
    rawPercentages[condition] = weight / totalWeight;
  });
  
  // Apply minimum percentages and redistribute excess
  const adjustedPercentages = applyMinimumPercentages(
    rawPercentages,
    distributionOptions.minimumBudgetPercentagePerCondition
  );
  
  // Calculate budget per condition
  const conditionBudgets: Record<string, number> = {};
  
  Object.entries(adjustedPercentages).forEach(([condition, percentage]) => {
    conditionBudgets[condition] = Math.floor(totalBudget * percentage);
    
    // Record in result
    result.conditionAllocations[condition] = {
      budget: conditionBudgets[condition],
      percentage: percentage,
      services: conditionServiceMap[condition] || []
    };
  });
  
  // Initialize service allocations
  Object.values(conditionServiceMap).flat().forEach(service => {
    if (!result.serviceAllocations[service]) {
      result.serviceAllocations[service] = {
        sessions: 0,
        costPerSession: BASELINE_COSTS[service] || 500,
        totalCost: 0,
        conditions: []
      };
    }
  });
  
  // Allocate sessions for each condition based on its budget
  conditions.forEach(condition => {
    const conditionBudget = conditionBudgets[condition];
    const services = conditionServiceMap[condition] || [];
    
    if (services.length === 0) {
      result.notes.push(`No specific services identified for condition: ${condition}`);
      return;
    }
    
    // Calculate budget per service for this condition
    const budgetPerService = Math.floor(conditionBudget / services.length);
    
    // Allocate sessions for each service
    services.forEach(service => {
      const costPerSession = BASELINE_COSTS[service] || 500;
      const affordableSessions = Math.max(
        distributionOptions.minimumSessionsPerService,
        Math.floor(budgetPerService / costPerSession)
      );
      
      // Update service allocation
      result.serviceAllocations[service].sessions += affordableSessions;
      result.serviceAllocations[service].totalCost += affordableSessions * costPerSession;
      
      // Record which condition this service is for
      if (!result.serviceAllocations[service].conditions.includes(condition)) {
        result.serviceAllocations[service].conditions.push(condition);
      }
    });
  });
  
  // Calculate total allocated and remaining budget
  result.totalAllocated = Object.values(result.serviceAllocations)
    .reduce((total, allocation) => total + allocation.totalCost, 0);
  
  result.remainingBudget = totalBudget - result.totalAllocated;
  
  // Check if budget was exceeded
  if (result.remainingBudget < 0) {
    result.budgetExceeded = true;
    
    // If budget exceedance is not allowed, adjust sessions
    if (!distributionOptions.allowBudgetExceedance) {
      result.notes.push(`Budget exceeded by ${-result.remainingBudget}. Adjusting sessions to fit budget.`);
      result.serviceAllocations = adjustSessionsToFitBudget(result.serviceAllocations, totalBudget);
      
      // Recalculate totals
      result.totalAllocated = Object.values(result.serviceAllocations)
        .reduce((total, allocation) => total + allocation.totalCost, 0);
      
      result.remainingBudget = totalBudget - result.totalAllocated;
      result.budgetExceeded = false;
    } else {
      // Check if exceedance is within allowed percentage
      const exceedancePercentage = -result.remainingBudget / totalBudget;
      
      if (exceedancePercentage > distributionOptions.maxBudgetExceedancePercentage) {
        result.notes.push(
          `Budget exceeded by ${Math.round(exceedancePercentage * 100)}%, which is beyond the allowed ${
            Math.round(distributionOptions.maxBudgetExceedancePercentage * 100)
          }%. Adjusting sessions to fit within allowed exceedance.`
        );
        
        // Adjust to fit within allowed exceedance
        const adjustedBudget = totalBudget * (1 + distributionOptions.maxBudgetExceedancePercentage);
        result.serviceAllocations = adjustSessionsToFitBudget(result.serviceAllocations, adjustedBudget);
        
        // Recalculate totals
        result.totalAllocated = Object.values(result.serviceAllocations)
          .reduce((total, allocation) => total + allocation.totalCost, 0);
        
        result.remainingBudget = totalBudget - result.totalAllocated;
      } else {
        result.notes.push(
          `Budget exceeded by ${Math.round(exceedancePercentage * 100)}%, which is within the allowed ${
            Math.round(distributionOptions.maxBudgetExceedancePercentage * 100)
          }%.`
        );
      }
    }
  }
  
  // Add distribution strategy note
  result.notes.push(
    `Budget distributed using ${distributionOptions.distributionStrategy} strategy, with ${
      distributionOptions.prioritizeBySeverity ? 'severity-based prioritization' : 'equal prioritization'
    }.`
  );
  
  return result;
}

/**
 * Apply minimum percentages to raw allocations and redistribute excess
 */
function applyMinimumPercentages(
  rawPercentages: Record<string, number>,
  minimumPercentage: number
): Record<string, number> {
  const conditions = Object.keys(rawPercentages);
  const adjustedPercentages = { ...rawPercentages };
  
  // Apply minimum percentages where needed
  let totalAdjustment = 0;
  
  conditions.forEach(condition => {
    if (adjustedPercentages[condition] < minimumPercentage) {
      totalAdjustment += minimumPercentage - adjustedPercentages[condition];
      adjustedPercentages[condition] = minimumPercentage;
    }
  });
  
  // If adjustments were made, redistribute the excess
  if (totalAdjustment > 0) {
    const conditionsToReduce = conditions.filter(
      condition => adjustedPercentages[condition] > minimumPercentage
    );
    
    if (conditionsToReduce.length > 0) {
      // Calculate total excess percentage
      const totalExcess = conditionsToReduce.reduce(
        (sum, condition) => sum + (adjustedPercentages[condition] - minimumPercentage),
        0
      );
      
      // Proportionally reduce each condition above minimum
      conditionsToReduce.forEach(condition => {
        const excess = adjustedPercentages[condition] - minimumPercentage;
        const reductionFactor = excess / totalExcess;
        adjustedPercentages[condition] -= totalAdjustment * reductionFactor;
      });
    }
  }
  
  // Normalize to ensure sum is 1
  const totalPercentage = Object.values(adjustedPercentages).reduce(
    (sum, percentage) => sum + percentage,
    0
  );
  
  if (Math.abs(totalPercentage - 1) > 0.01) {
    const normalizationFactor = 1 / totalPercentage;
    
    conditions.forEach(condition => {
      adjustedPercentages[condition] *= normalizationFactor;
    });
  }
  
  return adjustedPercentages;
}

/**
 * Adjust service sessions to fit within budget
 */
function adjustSessionsToFitBudget(
  serviceAllocations: Record<ServiceCategory, {
    sessions: number;
    costPerSession: number;
    totalCost: number;
    conditions: string[];
  }>,
  budget: number
): Record<ServiceCategory, {
  sessions: number;
  costPerSession: number;
  totalCost: number;
  conditions: string[];
}> {
  const adjustedAllocations = { ...serviceAllocations };
  
  // Calculate total cost
  let totalCost = Object.values(adjustedAllocations).reduce(
    (sum, allocation) => sum + allocation.totalCost,
    0
  );
  
  // Continue reducing sessions until we're within budget
  while (totalCost > budget) {
    // Find the service with the most sessions
    let maxSessionsService: ServiceCategory | null = null;
    let maxSessions = 0;
    
    Object.entries(adjustedAllocations).forEach(([service, allocation]) => {
      if (allocation.sessions > maxSessions) {
        maxSessions = allocation.sessions;
        maxSessionsService = service as ServiceCategory;
      }
    });
    
    if (!maxSessionsService || maxSessions <= 1) {
      // Can't reduce any further, try reducing cost instead
      let mostExpensiveService: ServiceCategory | null = null;
      let highestCost = 0;
      
      Object.entries(adjustedAllocations).forEach(([service, allocation]) => {
        if (allocation.costPerSession * allocation.sessions > highestCost) {
          highestCost = allocation.costPerSession * allocation.sessions;
          mostExpensiveService = service as ServiceCategory;
        }
      });
      
      if (mostExpensiveService) {
        // Reduce sessions of most expensive service
        if (adjustedAllocations[mostExpensiveService].sessions > 1) {
          adjustedAllocations[mostExpensiveService].sessions--;
          adjustedAllocations[mostExpensiveService].totalCost = 
            adjustedAllocations[mostExpensiveService].sessions * 
            adjustedAllocations[mostExpensiveService].costPerSession;
        } else {
          // Can't reduce sessions, so remove service entirely
          delete adjustedAllocations[mostExpensiveService];
        }
      } else {
        // Can't adjust any further
        break;
      }
    } else {
      // Reduce sessions for the service with the most sessions
      adjustedAllocations[maxSessionsService].sessions--;
      adjustedAllocations[maxSessionsService].totalCost = 
        adjustedAllocations[maxSessionsService].sessions * 
        adjustedAllocations[maxSessionsService].costPerSession;
    }
    
    // Recalculate total cost
    totalCost = Object.values(adjustedAllocations).reduce(
      (sum, allocation) => sum + allocation.totalCost,
      0
    );
  }
  
  return adjustedAllocations;
}

/**
 * Create a phased budget allocation plan if budget constraints prevent addressing all issues at once
 * 
 * @param totalBudget Total available budget
 * @param conditions List of conditions in priority order
 * @param conditionSeverity Severity scores for conditions
 * @param conditionServiceMap Mapping of conditions to services
 * @returns Phased budget allocation plan
 */
export function createPhasedBudgetPlan(
  totalBudget: number,
  conditions: string[],
  conditionSeverity: Record<string, number>,
  conditionServiceMap: Record<string, ServiceCategory[]>
): {
  phases: Array<{
    name: string;
    budget: number;
    conditions: string[];
    serviceAllocations: Record<ServiceCategory, {
      sessions: number;
      costPerSession: number;
      totalCost: number;
    }>;
  }>;
  totalCost: number;
  minRequiredBudget: number;
  budgetDeficit: number;
} {
  // Calculate minimum required budget for all conditions
  let minRequiredBudget = 0;
  
  conditions.forEach(condition => {
    const services = conditionServiceMap[condition] || [];
    services.forEach(service => {
      minRequiredBudget += BASELINE_COSTS[service] || 500; // Minimum one session per service
    });
  });
  
  // If budget is sufficient, no need for phasing
  if (totalBudget >= minRequiredBudget) {
    const allocation = distributeBudgetAcrossConditions(
      totalBudget,
      conditions,
      conditionSeverity,
      conditionServiceMap
    );
    
    return {
      phases: [{
        name: "Comprehensive Treatment Phase",
        budget: totalBudget,
        conditions: [...conditions],
        serviceAllocations: Object.entries(allocation.serviceAllocations).reduce(
          (acc, [service, details]) => {
            acc[service as ServiceCategory] = {
              sessions: details.sessions,
              costPerSession: details.costPerSession,
              totalCost: details.totalCost
            };
            return acc;
          },
          {} as Record<ServiceCategory, {
            sessions: number;
            costPerSession: number;
            totalCost: number;
          }>
        )
      }],
      totalCost: allocation.totalAllocated,
      minRequiredBudget,
      budgetDeficit: 0
    };
  }
  
  // Budget is not sufficient, create phased approach
  const phases: Array<{
    name: string;
    budget: number;
    conditions: string[];
    serviceAllocations: Record<ServiceCategory, {
      sessions: number;
      costPerSession: number;
      totalCost: number;
    }>;
  }> = [];
  
  // Calculate how many phases we need
  const phasesNeeded = Math.ceil(minRequiredBudget / totalBudget);
  const budgetDeficit = minRequiredBudget - totalBudget;
  
  // Sort conditions by severity
  const sortedConditions = [...conditions].sort((a, b) => {
    const severityA = conditionSeverity[a] || 0.5;
    const severityB = conditionSeverity[b] || 0.5;
    return severityB - severityA;
  });
  
  // Phase 1: Highest priority conditions
  const phase1ConditionCount = Math.max(1, Math.ceil(sortedConditions.length / phasesNeeded));
  const phase1Conditions = sortedConditions.slice(0, phase1ConditionCount);
  
  const phase1ConditionMap = phase1Conditions.reduce(
    (map, condition) => {
      map[condition] = conditionServiceMap[condition] || [];
      return map;
    },
    {} as Record<string, ServiceCategory[]>
  );
  
  const phase1Allocation = distributeBudgetAcrossConditions(
    totalBudget,
    phase1Conditions,
    conditionSeverity,
    phase1ConditionMap
  );
  
  phases.push({
    name: "Priority Treatment Phase",
    budget: totalBudget,
    conditions: phase1Conditions,
    serviceAllocations: Object.entries(phase1Allocation.serviceAllocations).reduce(
      (acc, [service, details]) => {
        acc[service as ServiceCategory] = {
          sessions: details.sessions,
          costPerSession: details.costPerSession,
          totalCost: details.totalCost
        };
        return acc;
      },
      {} as Record<ServiceCategory, {
        sessions: number;
        costPerSession: number;
        totalCost: number;
      }>
    )
  });
  
  // If there are remaining conditions, add a secondary phase recommendation
  if (sortedConditions.length > phase1ConditionCount) {
    const phase2Conditions = sortedConditions.slice(phase1ConditionCount);
    
    const phase2ConditionMap = phase2Conditions.reduce(
      (map, condition) => {
        map[condition] = conditionServiceMap[condition] || [];
        return map;
      },
      {} as Record<string, ServiceCategory[]>
    );
    
    // Create notional allocation for phase 2 (to be implemented later when budget is available)
    const phase2Allocation = distributeBudgetAcrossConditions(
      totalBudget,
      phase2Conditions,
      conditionSeverity,
      phase2ConditionMap
    );
    
    phases.push({
      name: "Follow-up Treatment Phase",
      budget: totalBudget,
      conditions: phase2Conditions,
      serviceAllocations: Object.entries(phase2Allocation.serviceAllocations).reduce(
        (acc, [service, details]) => {
          acc[service as ServiceCategory] = {
            sessions: details.sessions,
            costPerSession: details.costPerSession,
            totalCost: details.totalCost
          };
          return acc;
        },
        {} as Record<ServiceCategory, {
          sessions: number;
          costPerSession: number;
          totalCost: number;
        }>
      )
    });
  }
  
  return {
    phases,
    totalCost: phases.reduce((sum, phase) => 
      sum + Object.values(phase.serviceAllocations).reduce(
        (phaseSum, allocation) => phaseSum + allocation.totalCost, 
        0
      ), 
      0
    ),
    minRequiredBudget,
    budgetDeficit
  };
}
