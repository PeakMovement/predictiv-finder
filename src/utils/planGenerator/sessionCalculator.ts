
import { ServiceCategory } from "./types";
import { SERVICE_PRICE_RANGES } from "./serviceMappings";

interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
}

export const calculateSessions = (
  monthlyBudget: number,
  serviceType: ServiceCategory,
  priority: number = 1,
  preferences: Record<string, string> = {},
  severity: Record<string, number> = {},
  preferHighEnd: boolean = false
): SessionAllocation => {
  // Adjust budget based on priority
  const allocatedBudget = monthlyBudget * priority;
  
  // Define minimum and maximum sessions per month for each service type
  const SESSION_LIMITS: Partial<Record<ServiceCategory, { min: number; max: number }>> = {
    'dietician': { min: 1, max: 4 },
    'personal-trainer': { min: 1, max: 8 },
    'physiotherapist': { min: 1, max: 8 },
    'coaching': { min: 1, max: 4 },
    'family-medicine': { min: 1, max: 2 },
    'biokineticist': { min: 1, max: 4 },
    'internal-medicine': { min: 1, max: 2 },
    'pediatrics': { min: 1, max: 2 },
    'cardiology': { min: 1, max: 2 },
    'dermatology': { min: 1, max: 2 },
    'orthopedics': { min: 1, max: 2 },
    'neurology': { min: 1, max: 2 },
    'gastroenterology': { min: 1, max: 2 },
    'obstetrics-gynecology': { min: 1, max: 2 },
    'emergency-medicine': { min: 1, max: 1 },
    'psychiatry': { min: 1, max: 4 },
    'anesthesiology': { min: 1, max: 1 },
    'endocrinology': { min: 1, max: 2 },
    'urology': { min: 1, max: 2 },
    'oncology': { min: 1, max: 4 },
    'neurosurgery': { min: 1, max: 1 },
    'infectious-disease': { min: 1, max: 2 },
    'radiology': { min: 1, max: 1 },
    'geriatric-medicine': { min: 1, max: 2 },
    'plastic-surgery': { min: 1, max: 1 },
    'rheumatology': { min: 1, max: 2 },
    'pain-management': { min: 1, max: 3 },
  };

  // Get price range for the service type
  const priceRange = SERVICE_PRICE_RANGES[serviceType] || { affordable: 500, highEnd: 800 };
  
  // Determine base cost based on preference for high-end services
  let baseCost = preferHighEnd ? priceRange.highEnd : priceRange.affordable;
  
  // Apply discounts for certain user categories
  if (preferences.occupation === 'student') {
    baseCost = Math.floor(baseCost * 0.85); // 15% student discount
  }
  
  // For severe conditions, we might need higher quality services
  const relatedConditions = Object.entries(severity)
    .filter(([_, value]) => value > 0.7) // High severity
    .map(([condition, _]) => condition);
    
  if (relatedConditions.length > 0) {
    // For severe conditions, prefer higher quality services
    baseCost = Math.floor(baseCost * 1.1); // 10% premium for serious conditions
  }
  
  const defaultLimits = { min: 1, max: 4 };
  const limits = SESSION_LIMITS[serviceType] || defaultLimits;

  // Adjust cost if budget is too low but still allow at least 1 session
  let adjustedCost = baseCost;
  if (allocatedBudget < baseCost && allocatedBudget > 0) {
    // Find a reduced cost that fits the budget
    adjustedCost = Math.max(allocatedBudget * 0.9, 300); // Minimum viable cost
  }

  // Calculate maximum possible sessions within budget
  let possibleSessions = Math.floor(allocatedBudget / adjustedCost);
  
  // Constrain to limits
  possibleSessions = Math.max(
    1, // Always allow at least 1 session
    Math.min(possibleSessions, limits.max)
  );
  
  // For busy people, limit sessions further
  if (preferences.schedule === 'busy') {
    possibleSessions = Math.min(possibleSessions, 2); // Limit to 1-2 sessions for busy people
  }

  return {
    sessions: possibleSessions,
    costPerSession: adjustedCost,
    totalCost: possibleSessions * adjustedCost
  };
};

export const distributeSessionsByBudget = (
  monthlyBudget: number,
  services: { type: ServiceCategory; priority: number }[],
  preferences: Record<string, string> = {},
  severity: Record<string, number> = {},
  preferHighEnd: boolean = false
): Partial<Record<ServiceCategory, SessionAllocation>> => {
  const allocations: Partial<Record<ServiceCategory, SessionAllocation>> = {};
  
  // Sort services by priority (lowest number = highest priority)
  const sortedServices = [...services].sort((a, b) => a.priority - b.priority);
  
  let remainingBudget = monthlyBudget;
  
  // First pass - try to allocate at least one session to each service
  sortedServices.forEach(service => {
    // Calculate with minimum possible allocation
    const allocation = calculateSessions(
      remainingBudget,
      service.type,
      service.priority,
      preferences,
      severity,
      preferHighEnd
    );
    
    if (allocation.sessions > 0) {
      allocations[service.type] = allocation;
      remainingBudget -= allocation.totalCost;
    }
  });
  
  // If we still have budget left, allocate more sessions to priority services
  if (remainingBudget > 0 && sortedServices.length > 0) {
    // Start with highest priority service
    const topService = sortedServices[0];
    const currentAllocation = allocations[topService.type];
    
    if (currentAllocation) {
      // Try to add one more session if budget allows
      const additionalCost = currentAllocation.costPerSession;
      
      if (remainingBudget >= additionalCost) {
        allocations[topService.type] = {
          sessions: currentAllocation.sessions + 1,
          costPerSession: currentAllocation.costPerSession,
          totalCost: currentAllocation.totalCost + additionalCost
        };
      }
    }
  }
  
  return allocations;
};
