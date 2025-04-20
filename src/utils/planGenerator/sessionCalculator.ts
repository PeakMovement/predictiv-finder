
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
    'personal-trainer': { min: 2, max: 8 },
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
    const BASELINE_COSTS: Partial<Record<ServiceCategory, number>> = {
      'dietician': 600,
      'personal-trainer': 400,
      'physiotherapist': 500,
      'coaching': 450,
      'family-medicine': 800,
      'biokineticist': 550,
      'internal-medicine': 900,
      'pediatrics': 700,
      'cardiology': 1200,
      'dermatology': 900,
      'orthopedics': 1000,
      'neurology': 1100,
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
    return BASELINE_COSTS[type] || 800; // Default to 800 if not specified
  };

  const baseCost = getBaseCost(serviceType);
  const defaultLimits = { min: 1, max: 4 };
  const limits = SESSION_LIMITS[serviceType] || defaultLimits;

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
): Partial<Record<ServiceCategory, SessionAllocation>> => {
  const allocations: Partial<Record<ServiceCategory, SessionAllocation>> = {};
  
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
