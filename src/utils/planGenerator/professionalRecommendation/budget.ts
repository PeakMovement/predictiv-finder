
import { ServiceCategory } from "../types";
import { ServicePricing } from "./types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

// Exported function to calculate optimal sessions based on severity
export const calculateOptimalSessions = (
  category: ServiceCategory,
  severity: number = 0.5
): number => {
  // Standard session mappings
  const baseSessionMap: Record<ServiceCategory, number> = createServiceCategoryRecord<number>(2);
  
  // Define common services with specific session counts
  baseSessionMap['physiotherapist'] = 4;
  baseSessionMap['biokineticist'] = 3;
  baseSessionMap['dietician'] = 2;
  baseSessionMap['personal-trainer'] = 6;
  baseSessionMap['psychology'] = 4;
  baseSessionMap['psychiatry'] = 2;
  baseSessionMap['general-practitioner'] = 2;
  
  // Calculate sessions based on severity
  // For high severity, increase sessions by up to 2x
  let calculatedSessions = Math.round(baseSessionMap[category] * (1 + severity));
  
  // Cap sessions for certain services regardless of severity
  if (category === 'psychiatry' && calculatedSessions > 4) {
    calculatedSessions = 4;
  }
  if (category === 'general-practitioner' && calculatedSessions > 3) {
    calculatedSessions = 3;
  }
  
  return calculatedSessions;
};

// Added for compatibility with older code
export const calculateIdealSessions = calculateOptimalSessions;

// Compute service cost for a specific service
export const computeServiceCost = (
  service: ServiceCategory,
  sessions: number = 1
): number => {
  // Base costs map
  const costMap: Record<ServiceCategory, number> = createServiceCategoryRecord<number>(150);
  
  // Define costs for common services
  costMap['physiotherapist'] = 150;
  costMap['biokineticist'] = 170;
  costMap['dietician'] = 120;
  costMap['personal-trainer'] = 100;
  costMap['psychology'] = 200;
  costMap['psychiatry'] = 300;
  costMap['general-practitioner'] = 150;
  costMap['orthopedic-surgeon'] = 400;
  
  return costMap[service] * sessions;
};

// Allocate budget across services
export const allocateBudget = (
  services: ServiceCategory[],
  budget: number
): Record<ServiceCategory, { sessions: number; cost: number; priority: number }> => {
  // Initialize allocation record with empty values
  const allocation = createServiceCategoryRecord<{ sessions: number; cost: number; priority: number }>({
    sessions: 0,
    cost: 0,
    priority: 0
  });
  
  // Sort services by importance/priority
  const prioritizedServices = [...services].sort((a, b) => {
    const priorityMap: Record<ServiceCategory, number> = createServiceCategoryRecord<number>(5);
    priorityMap['general-practitioner'] = 1;
    priorityMap['psychiatry'] = 2;
    priorityMap['psychology'] = 3;
    
    return priorityMap[a] - priorityMap[b];
  });
  
  // Allocate budget
  let remainingBudget = budget;
  prioritizedServices.forEach((service, index) => {
    const costPerSession = computeServiceCost(service, 1);
    const maxSessions = Math.floor(remainingBudget / costPerSession);
    const recommendedSessions = calculateOptimalSessions(service);
    
    const allocatedSessions = Math.min(maxSessions, recommendedSessions);
    const totalCost = allocatedSessions * costPerSession;
    
    allocation[service] = {
      sessions: allocatedSessions,
      cost: totalCost,
      priority: index + 1
    };
    
    remainingBudget -= totalCost;
  });
  
  return allocation;
};

// Optimize plan for a specific budget
export const optimizePlanForBudget = (
  services: ServiceCategory[],
  budget: number
) => {
  return allocateBudget(services, budget);
};

// Add missing exports for any functions referenced elsewhere
export const calculateBudget = (services: ServiceCategory[], sessionCounts: number[]) => {
  let total = 0;
  services.forEach((service, index) => {
    const sessions = sessionCounts[index] || 1;
    total += computeServiceCost(service, sessions);
  });
  return total;
};
