import { ServiceCategory } from "./types";
import { ServicePricing } from "./professionalRecommendation/types";

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
  // Default pricing map
  const pricingMap: Record<ServiceCategory, ServicePricing> = {
    'physiotherapist': {
      category: 'physiotherapist',
      basePrice: 150,
      priceRange: { min: 120, max: 180 }
    },
    'biokineticist': {
      category: 'biokineticist',
      basePrice: 180,
      priceRange: { min: 150, max: 200 }
    },
    'dietician': {
      category: 'dietician',
      basePrice: 120,
      priceRange: { min: 100, max: 150 }
    },
    'personal-trainer': {
      category: 'personal-trainer',
      basePrice: 100,
      priceRange: { min: 80, max: 130 }
    },
    'coaching': {
      category: 'coaching',
      basePrice: 140,
      priceRange: { min: 100, max: 180 }
    },
    'psychology': {
      category: 'psychology',
      basePrice: 200,
      priceRange: { min: 150, max: 250 }
    },
    'psychiatry': {
      category: 'psychiatry',
      basePrice: 300,
      priceRange: { min: 250, max: 350 }
    },
    'family-medicine': {
      category: 'family-medicine',
      basePrice: 150,
      priceRange: { min: 120, max: 180 }
    },
    'pain-management': {
      category: 'pain-management',
      basePrice: 200,
      priceRange: { min: 150, max: 250 }
    },
    'podiatrist': {
      category: 'podiatrist',
      basePrice: 180,
      priceRange: { min: 150, max: 210 }
    },
    'general-practitioner': {
      category: 'general-practitioner',
      basePrice: 120,
      priceRange: { min: 100, max: 150 }
    },
    'sport-physician': {
      category: 'sport-physician',
      basePrice: 200,
      priceRange: { min: 180, max: 250 }
    },
    'orthopedic-surgeon': {
      category: 'orthopedic-surgeon',
      basePrice: 400,
      priceRange: { min: 350, max: 500 }
    },
    'gastroenterology': {
      category: 'gastroenterology',
      basePrice: 300,
      priceRange: { min: 250, max: 350 }
    },
    'massage-therapy': {
      category: 'massage-therapy',
      basePrice: 100,
      priceRange: { min: 80, max: 130 }
    },
    'nutrition-coaching': {
      category: 'nutrition-coaching',
      basePrice: 120,
      priceRange: { min: 100, max: 150 }
    },
    'occupational-therapy': {
      category: 'occupational-therapy',
      basePrice: 160,
      priceRange: { min: 130, max: 190 }
    },
    'physical-therapy': {
      category: 'physical-therapy',
      basePrice: 150,
      priceRange: { min: 120, max: 180 }
    },
    'chiropractor': {
      category: 'chiropractor',
      basePrice: 140,
      priceRange: { min: 110, max: 170 }
    },
    'nurse-practitioner': {
      category: 'nurse-practitioner',
      basePrice: 100,
      priceRange: { min: 80, max: 120 }
    },
    'cardiology': {
      category: 'cardiology',
      basePrice: 300,
      priceRange: { min: 250, max: 350 }
    },
    'dermatology': {
      category: 'dermatology',
      basePrice: 250,
      priceRange: { min: 200, max: 300 }
    },
    'neurology': {
      category: 'neurology',
      basePrice: 320,
      priceRange: { min: 280, max: 380 }
    },
    'endocrinology': {
      category: 'endocrinology',
      basePrice: 280,
      priceRange: { min: 240, max: 320 }
    },
    'urology': {
      category: 'urology',
      basePrice: 260,
      priceRange: { min: 220, max: 300 }
    },
    'oncology': {
      category: 'oncology',
      basePrice: 350,
      priceRange: { min: 300, max: 400 }
    },
    'rheumatology': {
      category: 'rheumatology',
      basePrice: 270,
      priceRange: { min: 230, max: 310 }
    },
    'pediatrics': {
      category: 'pediatrics',
      basePrice: 180,
      priceRange: { min: 150, max: 210 }
    },
    'geriatrics': {
      category: 'geriatrics',
      basePrice: 200,
      priceRange: { min: 170, max: 230 }
    },
    'sports-medicine': {
      category: 'sports-medicine',
      basePrice: 220,
      priceRange: { min: 180, max: 260 }
    },
    'internal-medicine': {
      category: 'internal-medicine',
      basePrice: 240,
      priceRange: { min: 200, max: 280 }
    },
    'orthopedics': {
      category: 'orthopedics',
      basePrice: 260,
      priceRange: { min: 220, max: 300 }
    },
    'neurosurgery': {
      category: 'neurosurgery',
      basePrice: 500,
      priceRange: { min: 450, max: 600 }
    },
    'infectious-disease': {
      category: 'infectious-disease',
      basePrice: 280,
      priceRange: { min: 240, max: 320 }
    },
    'plastic-surgery': {
      category: 'plastic-surgery',
      basePrice: 450,
      priceRange: { min: 400, max: 550 }
    },
    'obstetrics-gynecology': {
      category: 'obstetrics-gynecology',
      basePrice: 240,
      priceRange: { min: 200, max: 280 }
    },
    'emergency-medicine': {
      category: 'emergency-medicine',
      basePrice: 300,
      priceRange: { min: 250, max: 350 }
    },
    'anesthesiology': {
      category: 'anesthesiology',
      basePrice: 380,
      priceRange: { min: 330, max: 430 }
    },
    'radiology': {
      category: 'radiology',
      basePrice: 260,
      priceRange: { min: 220, max: 300 }
    },
    'geriatric-medicine': {
      category: 'geriatric-medicine',
      basePrice: 220,
      priceRange: { min: 180, max: 260 }
    },
    'strength-coaching': {
      category: 'strength-coaching',
      basePrice: 110,
      priceRange: { min: 90, max: 140 }
    },
    'run-coaching': {
      category: 'run-coaching',
      basePrice: 110,
      priceRange: { min: 90, max: 140 }
    },
    'all': {
      category: 'all',
      basePrice: 150,
      priceRange: { min: 100, max: 200 }
    }
  };
  
  return pricingMap[service] || {
    category: service,
    basePrice: 150,
    priceRange: { min: 100, max: 200 }
  };
}

// Example of how to use sessionAllocations correctly
export function generateServicePlan(
  services: ServiceCategory[],
  budget: number
): Record<ServiceCategory, SessionAllocation> {
  const plan: Record<ServiceCategory, SessionAllocation> = {} as Record<ServiceCategory, SessionAllocation>;
  
  services.forEach((service, index) => {
    const pricing = getServicePricing(service);
    const sessionsCount = budget > 1000 ? 4 : 2;
    const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
    
    plan[service] = createSessionAllocation(sessionsCount, pricing.basePrice, priority);
  });
  
  return plan;
}
