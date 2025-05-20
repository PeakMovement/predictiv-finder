
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
  
  // Initialize allocation
  const allocation: Record<ServiceCategory, {
    sessions: number;
    cost: number;
    priority: number;
  }> = {};
  
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
