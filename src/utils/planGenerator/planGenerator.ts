
import { ServiceCategory } from "./types";
import { ServicePricing } from "./professionalRecommendation/types";
import { createServiceCategoryRecord } from "./helpers/serviceRecordInitializer";

// Update the SessionAllocation interface
export interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
  count: number; // Required for compatibility
  priorityLevel: 'high' | 'medium' | 'low'; // Required for compatibility
}

// Generate a health plan name
export function generatePlanName(primaryCondition: string, primaryServiceType: ServiceCategory | string): string {
  // Handle different input types safely
  const serviceTypeName = typeof primaryServiceType === 'string' ? 
    primaryServiceType.replace(/-/g, ' ') : 'Therapy';
  
  return `${primaryCondition} Recovery with ${serviceTypeName}`;
}

// Main plan generation function with remaining code
export function generateHealthPlan(
  primaryCondition: string,
  serviceTypes: ServiceCategory[],
  budget: number,
  timeframe: string = '3 months'
) {
  // Validate inputs
  if (!primaryCondition || !serviceTypes || serviceTypes.length === 0) {
    throw new Error('Missing required parameters for plan generation');
  }

  // Generate plan name
  const planName = generatePlanName(primaryCondition, serviceTypes[0]);

  // Create service plan with allocations
  const servicePlan = generateServicePlan(serviceTypes, budget);

  // Calculate total sessions and cost
  let totalSessions = 0;
  let totalCost = 0;
  Object.values(servicePlan).forEach(allocation => {
    totalSessions += allocation.sessions;
    totalCost += allocation.totalCost;
  });

  // Generate plan description
  const description = `This ${timeframe} plan focuses on treating ${primaryCondition} through a combination of ${serviceTypes.slice(0, 3).join(', ')} sessions. The plan includes ${totalSessions} total sessions with an estimated cost of $${totalCost}.`;

  // Return the complete plan
  return {
    name: planName,
    description,
    primaryCondition,
    timeframe,
    servicePlan,
    totalSessions,
    totalCost,
    budget
  };
}

// Example of a function that returns SessionAllocation
export function createSessionAllocation(
  sessions: number,
  costPerSession: number,
  priority: 'high' | 'medium' | 'low' = 'medium'
): SessionAllocation {
  return {
    sessions,
    costPerSession,
    totalCost: sessions * costPerSession,
    count: sessions, // Set count to match sessions for compatibility
    priorityLevel: priority
  };
}

// Example pricing function
export function getServicePricing(service: ServiceCategory): ServicePricing {
  // Create default pricing map using createServiceCategoryRecord
  const pricingMap = createServiceCategoryRecord<ServicePricing>({
    category: 'general-practitioner' as ServiceCategory,
    basePrice: 150,
    priceRange: { min: 100, max: 200 }
  });

  // Update specific prices for common services
  pricingMap['physiotherapist'] = {
    category: 'physiotherapist',
    basePrice: 150,
    priceRange: { min: 120, max: 180 }
  };
  
  pricingMap['biokineticist'] = {
    category: 'biokineticist',
    basePrice: 180,
    priceRange: { min: 150, max: 200 }
  };
  
  pricingMap['dietician'] = {
    category: 'dietician',
    basePrice: 120,
    priceRange: { min: 100, max: 150 }
  };
  
  pricingMap['personal-trainer'] = {
    category: 'personal-trainer',
    basePrice: 100,
    priceRange: { min: 80, max: 130 }
  };
  
  pricingMap['coaching'] = {
    category: 'coaching',
    basePrice: 140,
    priceRange: { min: 100, max: 180 }
  };
  
  pricingMap['psychology'] = {
    category: 'psychology',
    basePrice: 200,
    priceRange: { min: 150, max: 250 }
  };
  
  pricingMap['psychiatry'] = {
    category: 'psychiatry',
    basePrice: 300,
    priceRange: { min: 250, max: 350 }
  };
  
  pricingMap['family-medicine'] = {
    category: 'family-medicine',
    basePrice: 150,
    priceRange: { min: 120, max: 180 }
  };
  
  // Return the pricing for the requested service
  return pricingMap[service];
}

// Example of how to use sessionAllocations correctly - Fixed the type issue here
export function generateServicePlan(
  services: ServiceCategory[],
  budget: number
): Record<ServiceCategory, SessionAllocation> {
  // Initialize plan with createServiceCategoryRecord
  const plan = createServiceCategoryRecord<SessionAllocation>({
    sessions: 0,
    costPerSession: 0,
    totalCost: 0,
    count: 0,
    priorityLevel: 'low'
  });
  
  services.forEach((service, index) => {
    const pricing = getServicePricing(service);
    const sessionsCount = budget > 1000 ? 4 : 2;
    // Correctly handle priority level based on index
    const priority: 'high' | 'medium' | 'low' = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
    
    plan[service] = {
      sessions: sessionsCount,
      costPerSession: pricing.basePrice,
      totalCost: sessionsCount * pricing.basePrice,
      count: sessionsCount,
      priorityLevel: priority // This now accepts high, medium, or low
    };
  });
  
  return plan;
}
