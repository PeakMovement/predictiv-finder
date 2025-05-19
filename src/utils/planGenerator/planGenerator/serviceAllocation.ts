
import { PlanContext, ServiceAllocation, ServiceCategory, ServiceAllocationItem, BASELINE_COSTS } from "@/utils/planGenerator/types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

// Define an extended version of ServiceAllocation with additional properties
interface EnhancedServiceAllocation extends ServiceAllocation {
  type: ServiceCategory;
  percentage?: number;
  sessions?: number;
  description?: string;
  frequency?: string;
  priority?: number;
}

/**
 * Determine required services based on user context
 */
export const determineRequiredServices = (
  context: PlanContext,
  allocations: ServiceAllocationItem[]
): ServiceCategory[] => {
  // Use allocations if provided, otherwise derive from context
  if (allocations && allocations.length > 0) {
    return allocations.map(item => item.type);
  }
  
  // Basic service detection based on context
  const services: ServiceCategory[] = [];
  
  // Add general practitioner for medical conditions
  if (context.medicalConditions && context.medicalConditions.length > 0) {
    services.push('general-practitioner');
    
    // Check for specific conditions
    const conditionsLower = context.medicalConditions.map(c => c.toLowerCase());
    
    if (conditionsLower.some(c => c.includes('pain') || c.includes('injury'))) {
      services.push('physiotherapist');
    }
    
    if (conditionsLower.some(c => c.includes('diet') || c.includes('nutrition') || c.includes('weight'))) {
      services.push('dietician');
    }
    
    if (conditionsLower.some(c => c.includes('mental') || c.includes('anxiety') || c.includes('depression'))) {
      services.push('psychology');
    }
  }
  
  // Add services based on goal
  if (context.goal) {
    const goalLower = context.goal.toLowerCase();
    
    if (goalLower.includes('fitness') || goalLower.includes('strength')) {
      services.push('personal-trainer');
    }
    
    if (goalLower.includes('running') || goalLower.includes('marathon')) {
      services.push('personal-trainer');
      services.push('biokineticist');
    }
    
    if (goalLower.includes('diet') || goalLower.includes('nutrition')) {
      services.push('dietician');
    }
  }
  
  // Ensure at least one service is included
  if (services.length === 0) {
    services.push('general-practitioner');
  }
  
  // Return unique set of services
  return Array.from(new Set(services));
};

/**
 * Allocate services with proper sessions and costs, respecting budget constraints
 * Enhanced to prioritize more affordable options when budget is limited
 */
export const allocateServices = (
  services: ServiceCategory[],
  context: PlanContext
): EnhancedServiceAllocation[] => {
  const allocatedServices: EnhancedServiceAllocation[] = [];
  
  // Calculate base budget if available, with a reasonable default
  const budget = context.budget || 5000;
  
  // Sort services by cost (cheapest first) to prioritize affordable options
  const sortedServices = [...services].sort((a, b) => {
    const costA = BASELINE_COSTS[a] || 500;
    const costB = BASELINE_COSTS[b] || 500;
    return costA - costB;  // Sort by ascending cost
  });
  
  // Calculate how many sessions we can afford for each service
  let remainingBudget = budget;
  const allocations: Record<ServiceCategory, number> = {} as Record<ServiceCategory, number>;
  
  // First pass: Ensure at least one session for each service if possible
  for (const service of sortedServices) {
    const baseCost = BASELINE_COSTS[service] || 500;
    if (baseCost <= remainingBudget) {
      allocations[service] = 1;
      remainingBudget -= baseCost;
    } else {
      // Can't afford even one session for this service
      allocations[service] = 0;
    }
  }
  
  // Second pass: Distribute remaining budget, favoring more affordable services
  // This helps get more total sessions within budget
  if (remainingBudget > 0) {
    // Continue adding sessions until budget is used up
    let canAllocateMore = true;
    while (canAllocateMore) {
      canAllocateMore = false;
      
      for (const service of sortedServices) {
        if (allocations[service] === undefined) continue;
        
        const baseCost = BASELINE_COSTS[service] || 500;
        if (baseCost <= remainingBudget) {
          allocations[service]++;
          remainingBudget -= baseCost;
          canAllocateMore = remainingBudget > Math.min(...sortedServices.map(s => BASELINE_COSTS[s] || 500));
        }
      }
    }
  }
  
  // Create final service allocations
  for (const service of services) {
    const sessionCount = allocations[service] || 0;
    if (sessionCount > 0) {
      const baseCost = BASELINE_COSTS[service] || 500;
      
      allocatedServices.push({
        type: service,
        sessions: sessionCount,
        description: getServiceDescription(service, sessionCount),
        frequency: getFrequency(service, sessionCount),
        percentage: 100 / services.length, // Simple equal distribution
        priority: services.indexOf(service) + 1,
        // Required fields for ServiceAllocation
        count: sessionCount,
        costPerSession: baseCost,
        totalCost: baseCost * sessionCount,
        priorityLevel: services.indexOf(service) === 0 ? 'high' : 
                     services.indexOf(service) === 1 ? 'medium' : 'low'
      });
    }
  }
  
  // If we couldn't allocate any services due to budget constraints, include the cheapest one
  if (allocatedServices.length === 0 && services.length > 0) {
    const cheapestService = sortedServices[0];
    const baseCost = BASELINE_COSTS[cheapestService] || 500;
    allocatedServices.push({
      type: cheapestService,
      count: 1,
      sessions: 1,
      description: getServiceDescription(cheapestService, 1) + " (limited by budget)",
      frequency: "once",
      percentage: 100,
      priority: 1,
      // Required fields for ServiceAllocation
      costPerSession: baseCost,
      totalCost: baseCost,
      priorityLevel: 'high'
    });
  }
  
  return allocatedServices;
};

/**
 * Get appropriate frequency description based on service type and session count
 */
const getFrequency = (type: ServiceCategory, sessions: number): string => {
  if (sessions === 1) return "once";
  if (sessions === 2) return "twice";
  
  switch(type) {
    case 'physiotherapist':
    case 'personal-trainer':
      return sessions <= 4 ? "weekly" : "twice weekly";
    case 'psychology':
    case 'psychiatry':
      return "bi-weekly";
    case 'dietician':
    case 'nutrition-coaching':
      return sessions <= 3 ? "monthly" : "bi-weekly";
    default:
      return sessions <= 4 ? "as needed" : "regularly";
  }
};

/**
 * Get appropriate description for a service
 */
const getServiceDescription = (type: ServiceCategory, sessions: number): string => {
  const plural = sessions > 1 ? 's' : '';
  
  switch (type) {
    case 'physiotherapist':
      return `${sessions} physiotherapy session${plural} for assessment and treatment`;
    case 'biokineticist':
      return `${sessions} biokinetic session${plural} for movement assessment and rehabilitation`;
    case 'dietician':
      return `${sessions} dietician consultation${plural} for nutrition planning`;
    case 'personal-trainer':
      return `${sessions} personal training session${plural} for fitness coaching`;
    case 'pain-management':
      return `${sessions} pain management session${plural} for chronic pain relief`;
    case 'coaching':
      return `${sessions} coaching session${plural} for guidance and motivation`;
    case 'psychology':
      return `${sessions} psychology session${plural} for mental health support`;
    case 'psychiatry':
      return `${sessions} psychiatric consultation${plural} for mental health treatment`;
    case 'podiatrist':
      return `${sessions} podiatry session${plural} for foot and lower limb care`;
    case 'general-practitioner':
      return `${sessions} GP consultation${plural} for general health assessment`;
    case 'sport-physician':
      return `${sessions} sports medicine consultation${plural} for athletic health`;
    case 'orthopedic-surgeon':
      return `${sessions} orthopedic consultation${plural} for musculoskeletal assessment`;
    case 'family-medicine':
      return `${sessions} family medicine consultation${plural}`;
    case 'gastroenterology':
      return `${sessions} gastroenterology consultation${plural}`;
    case 'massage-therapy':
      return `${sessions} massage therapy session${plural}`;
    case 'nutrition-coaching':
      return `${sessions} nutrition coaching session${plural}`;
    default:
      return `${sessions} consultation${plural} with ${type.replace(/-/g, ' ')}`;
  }
};
