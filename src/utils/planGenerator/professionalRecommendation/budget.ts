import { ServiceCategory } from "../types";
import { ServicePricing } from "./types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

// Create a proper service pricing map using createServiceCategoryRecord
const servicePricingMap: Record<ServiceCategory, ServicePricing> = createServiceCategoryRecord({
  category: 'general-practitioner' as ServiceCategory,
  basePrice: 500,
  priceRange: { min: 400, max: 600 }
});

// Set specific values for common services
servicePricingMap['physiotherapist'] = {
  category: 'physiotherapist',
  basePrice: 150,
  priceRange: { min: 120, max: 180 }
};

servicePricingMap['biokineticist'] = {
  category: 'biokineticist',
  basePrice: 180,
  priceRange: { min: 150, max: 200 }
};

servicePricingMap['dietician'] = {
  category: 'dietician',
  basePrice: 120,
  priceRange: { min: 100, max: 150 }
};

servicePricingMap['personal-trainer'] = {
  category: 'personal-trainer',
  basePrice: 100,
  priceRange: { min: 80, max: 130 }
};

servicePricingMap['coaching'] = {
  category: 'coaching',
  basePrice: 140,
  priceRange: { min: 100, max: 180 }
};

servicePricingMap['psychology'] = {
  category: 'psychology',
  basePrice: 200,
  priceRange: { min: 150, max: 250 }
};

servicePricingMap['psychiatry'] = {
  category: 'psychiatry',
  basePrice: 300,
  priceRange: { min: 250, max: 350 }
};

/**
 * Calculate the optimal number of sessions for a service within a budget
 * 
 * @param service Service category
 * @param budget Available budget
 * @param minSessions Minimum number of sessions required
 * @returns Number of sessions that can be afforded
 */
export function calculateOptimalSessions(
  service: ServiceCategory, 
  budget: number,
  minSessions: number = 1
): number {
  const pricing = servicePricingMap[service];
  const costPerSession = pricing ? pricing.basePrice : 150;
  
  const maxAffordableSessions = Math.floor(budget / costPerSession);
  return Math.max(minSessions, maxAffordableSessions);
}

/**
 * Compute the total cost for a service with a specific number of sessions
 * 
 * @param service Service category
 * @param sessions Number of sessions
 * @returns Total cost for the service
 */
export function computeServiceCost(
  service: ServiceCategory, 
  sessions: number
): number {
  const pricing = servicePricingMap[service];
  const costPerSession = pricing ? pricing.basePrice : 150;
  
  return sessions * costPerSession;
}

/**
 * Calculate ideal session count based on service type and condition severity
 * 
 * @param service Service category
 * @param severity Condition severity (0-1)
 * @returns Recommended number of sessions
 */
export function calculateIdealSessions(
  service: ServiceCategory,
  severity: number = 0.5
): number {
  // Base sessions by service type
  const baseMap: Record<string, number> = {
    'physiotherapist': 6,
    'psychology': 8,
    'dietician': 4,
    'personal-trainer': 8,
    'general-practitioner': 2
  };
  
  // Get base sessions or default to 4
  const baseSessions = baseMap[service] || 4;
  
  // Adjust by severity (higher severity means more sessions)
  return Math.max(1, Math.round(baseSessions * (0.5 + severity/2)));
}

/**
 * Allocate budget across multiple services
 */
export function allocateBudget(
  services: ServiceCategory[],
  budget: number
): Record<ServiceCategory, number> {
  const allocation = createServiceCategoryRecord(0);
  
  if (services.length === 0) return allocation;
  
  const perService = Math.floor(budget / services.length);
  services.forEach(service => {
    allocation[service] = perService;
  });
  
  return allocation;
}

/**
 * Optimize a plan to fit within budget constraints
 */
export function optimizePlanForBudget(
  recommendations: Array<{
    category: ServiceCategory,
    sessions: number,
    priority: 'high' | 'medium' | 'low',
    reasoning: string
  }>,
  budget: number
) {
  // Initialize result
  const result = {
    optimizedRecommendations: [...recommendations],
    totalCost: 0,
    budgetAllocation: createServiceCategoryRecord(0),
    notes: ['Budget optimization applied'] as string[]
  };
  
  // Calculate initial total cost
  let totalCost = 0;
  recommendations.forEach(rec => {
    const costPerSession = servicePricingMap[rec.category]?.basePrice || 150;
    totalCost += costPerSession * rec.sessions;
    result.budgetAllocation[rec.category] = costPerSession * rec.sessions;
  });
  
  result.totalCost = totalCost;
  
  // If within budget, return as is
  if (totalCost <= budget) {
    return result;
  }
  
  // Need to optimize - reduce sessions proportionally
  const reduction = budget / totalCost;
  result.notes.push(`Budget constraint requires reducing services to ${Math.round(reduction * 100)}% of ideal`);
  
  // Apply reduction prioritizing higher priority services
  result.optimizedRecommendations = recommendations.map(rec => {
    const priority = rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 0.8 : 0.6;
    const adjusted = Math.max(1, Math.floor(rec.sessions * reduction * priority));
    
    const costPerSession = servicePricingMap[rec.category]?.basePrice || 150;
    result.budgetAllocation[rec.category] = costPerSession * adjusted;
    
    return {
      ...rec,
      sessions: adjusted
    };
  });
  
  return result;
}

/**
 * Optimize the allocation of budget across multiple services
 * 
 * @param services Array of service categories
 * @param budget Total available budget
 * @param priorities Optional priority weights for each service (0-1)
 * @returns Optimized allocation of sessions and budget
 */
export function optimizeBudgetAllocation(
  services: ServiceCategory[],
  budget: number,
  priorities?: Record<ServiceCategory, number>
): Record<ServiceCategory, {
  sessions: number;
  cost: number;
  priority: number;
}> {
  // Default priority for all services
  const defaultPriority = 0.5;
  
  // Initialize allocation with all service categories
  const allocation = createServiceCategoryRecord({
    sessions: 0,
    cost: 0,
    priority: defaultPriority
  });
  
  // First pass: ensure minimum sessions for each service
  let remainingBudget = budget;
  services.forEach(service => {
    const priority = priorities?.[service] || defaultPriority;
    const minSessions = 1; // At least one session for each service
    const pricing = servicePricingMap[service];
    const costPerSession = pricing ? pricing.basePrice : 150;
    
    // Allocate minimum sessions
    allocation[service] = {
      sessions: minSessions,
      cost: minSessions * costPerSession,
      priority
    };
    
    remainingBudget -= minSessions * costPerSession;
  });
  
  // Second pass: distribute remaining budget according to priorities
  if (remainingBudget > 0) {
    // Sort services by priority (highest first)
    const sortedServices = [...services].sort((a, b) => {
      const priorityA = priorities?.[a] || defaultPriority;
      const priorityB = priorities?.[b] || defaultPriority;
      return priorityB - priorityA;
    });
    
    // Distribute remaining budget
    let index = 0;
    while (remainingBudget > 0 && index < sortedServices.length) {
      const service = sortedServices[index];
      const pricing = servicePricingMap[service];
      const costPerSession = pricing ? pricing.basePrice : 150;
      
      // If we can afford another session
      if (remainingBudget >= costPerSession) {
        allocation[service].sessions += 1;
        allocation[service].cost += costPerSession;
        remainingBudget -= costPerSession;
      } else {
        // Move to next service
        index += 1;
      }
    }
  }
  
  return allocation;
}
