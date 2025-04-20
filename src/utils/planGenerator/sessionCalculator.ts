
import { ServiceCategory } from "./types";

interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
}

export const calculateSessions = (
  monthlyBudget: number,
  serviceType: ServiceCategory,
  priority: number = 1
): SessionAllocation => {
  // Adjust budget based on priority (e.g., primary vs secondary service)
  const allocatedBudget = monthlyBudget * priority;
  
  // Define minimum and maximum sessions per month for each service type
  const SESSION_LIMITS: Record<ServiceCategory, { min: number; max: number }> = {
    'dietician': { min: 1, max: 4 },
    'personal-trainer': { min: 2, max: 8 },
    'physiotherapist': { min: 1, max: 8 },
    'coaching': { min: 1, max: 4 },
    'family-medicine': { min: 1, max: 2 },
    // ... add limits for other service categories
  };

  // Get base cost per session for the service type
  const getBaseCost = (type: ServiceCategory): number => {
    const BASELINE_COSTS: Record<ServiceCategory, number> = {
      'dietician': 600,
      'personal-trainer': 400,
      'physiotherapist': 500,
      'coaching': 450,
      'family-medicine': 800,
      // ... add costs for other service categories
    };
    return BASELINE_COSTS[type] || 500;
  };

  const baseCost = getBaseCost(serviceType);
  const limits = SESSION_LIMITS[serviceType] || { min: 1, max: 4 };

  // Calculate maximum possible sessions within budget
  let possibleSessions = Math.floor(allocatedBudget / baseCost);
  
  // Constrain to limits
  possibleSessions = Math.max(
    limits.min,
    Math.min(possibleSessions, limits.max)
  );

  return {
    sessions: possibleSessions,
    costPerSession: baseCost,
    totalCost: possibleSessions * baseCost
  };
};

export const distributeSessionsByBudget = (
  monthlyBudget: number,
  services: { type: ServiceCategory; priority: number }[]
): Record<ServiceCategory, SessionAllocation> => {
  const allocations: Record<ServiceCategory, SessionAllocation> = {};
  
  // Sort services by priority (highest first)
  const sortedServices = [...services].sort((a, b) => b.priority - a.priority);
  
  let remainingBudget = monthlyBudget;
  
  sortedServices.forEach(service => {
    const allocation = calculateSessions(
      remainingBudget,
      service.type,
      service.priority
    );
    
    allocations[service.type] = allocation;
    remainingBudget -= allocation.totalCost;
  });
  
  return allocations;
};
