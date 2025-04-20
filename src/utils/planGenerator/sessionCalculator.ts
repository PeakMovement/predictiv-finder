
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

  // Get base cost per session for the service type
  const getBaseCost = (type: ServiceCategory): number => {
    // Base costs adjusted to provide more affordable options for common services
    const BASELINE_COSTS: Partial<Record<ServiceCategory, number>> = {
      'dietician': 400,
      'personal-trainer': 350,
      'physiotherapist': 450,
      'coaching': 400,
      'family-medicine': 400, // Reduced from 800 to match typical GP visit cost
      'biokineticist': 450,
      'internal-medicine': 650,
      'pediatrics': 500,
      'cardiology': 800,
      'dermatology': 600,
      'orthopedics': 700,
      'neurology': 800,
      'gastroenterology': 600, // Reduced for stomach issues
      'obstetrics-gynecology': 700,
      'emergency-medicine': 1200,
      'psychiatry': 800,
      'anesthesiology': 1000,
      'endocrinology': 700,
      'urology': 700,
      'oncology': 900,
      'neurosurgery': 1500,
      'infectious-disease': 700,
      'radiology': 600,
      'geriatric-medicine': 600,
      'plastic-surgery': 1200,
      'rheumatology': 700,
      'pain-management': 600,
    };

    // Define high-end costs for premium services
    const PREMIUM_COSTS: Partial<Record<ServiceCategory, number>> = {
      'dietician': 600,
      'personal-trainer': 500,
      'physiotherapist': 700,
      'coaching': 550,
      'family-medicine': 800,
      'gastroenterology': 1000,
      'obstetrics-gynecology': 900,
      'emergency-medicine': 1500,
      'psychiatry': 1000,
      'anesthesiology': 1300,
      'endocrinology': 950,
      'urology': 950,
      'oncology': 1200,
      'neurosurgery': 2000,
      'infectious-disease': 950,
      'radiology': 800,
      'geriatric-medicine': 850,
      'plastic-surgery': 1500,
      'rheumatology': 900,
      'pain-management': 800,
    };
    
    // For now, use baseline costs. If premium is needed, we can expose that option
    return BASELINE_COSTS[type] || 500; // Default to 500 if not specified
  };

  const baseCost = getBaseCost(serviceType);
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

  return {
    sessions: possibleSessions,
    costPerSession: adjustedCost,
    totalCost: possibleSessions * adjustedCost
  };
};

export const distributeSessionsByBudget = (
  monthlyBudget: number,
  services: { type: ServiceCategory; priority: number }[]
): Partial<Record<ServiceCategory, SessionAllocation>> => {
  const allocations: Partial<Record<ServiceCategory, SessionAllocation>> = {};
  
  // Sort services by priority (highest first)
  const sortedServices = [...services].sort((a, b) => b.priority - a.priority);
  
  let remainingBudget = monthlyBudget;
  
  // First pass - try to allocate at least one session to each service
  sortedServices.forEach(service => {
    // Calculate with minimum possible allocation
    const allocation = calculateSessions(
      remainingBudget,
      service.type,
      service.priority
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
