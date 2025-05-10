
import { PriceRange, ServiceCategory } from './types';

interface ServiceAllocation {
  type: ServiceCategory;
  priority: number;
  minSessions?: number;
}

interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
}

export const distributeSessionsByBudget = (
  budget: number,
  services: ServiceAllocation[]
): Record<ServiceCategory, SessionAllocation> => {
  if (!budget || budget <= 0 || !Array.isArray(services) || services.length === 0) {
    return {};
  }
  
  // Sort services by priority (highest to lowest)
  const sortedServices = [...services].sort((a, b) => b.priority - a.priority);
  
  // Calculate total priority points to get relative weights
  const totalPriorityPoints = sortedServices.reduce((sum, service) => sum + service.priority, 0);
  
  // Initialize allocations
  const allocations: Record<ServiceCategory, SessionAllocation> = {};
  
  // First pass: allocate budget proportionally based on priority
  let remainingBudget = budget;
  sortedServices.forEach(service => {
    const relativePriority = service.priority / totalPriorityPoints;
    const serviceBudget = Math.floor(budget * relativePriority);
    
    // Start with a reasonable cost per session based on service type
    const baseCost = getBaseServiceCost(service.type);
    
    // Calculate how many sessions we can afford
    let sessions = Math.max(1, Math.floor(serviceBudget / baseCost));
    
    // Enforce minimum sessions if specified
    if (service.minSessions !== undefined) {
      sessions = Math.max(sessions, service.minSessions);
    }
    
    // Calculate actual cost per session, adjusting for budget
    const costPerSession = sessions > 0 ? Math.min(baseCost, serviceBudget / sessions) : baseCost;
    const totalServiceCost = sessions * costPerSession;
    
    allocations[service.type] = {
      sessions,
      costPerSession,
      totalCost: totalServiceCost
    };
    
    remainingBudget -= totalServiceCost;
  });
  
  // Use any remaining budget to add sessions to high priority services
  if (remainingBudget > 0 && sortedServices.length > 0) {
    for (const service of sortedServices) {
      const currentAllocation = allocations[service.type];
      const priceForOneSession = currentAllocation.costPerSession;
      
      if (remainingBudget >= priceForOneSession) {
        currentAllocation.sessions += 1;
        currentAllocation.totalCost += priceForOneSession;
        remainingBudget -= priceForOneSession;
      }
      
      if (remainingBudget < 100) {
        break;
      }
    }
  }
  
  return allocations;
};

function getBaseServiceCost(serviceType: ServiceCategory): number {
  // These should be custom calculated based on market data and quality tier
  const costMap: Record<ServiceCategory, number> = {
    'physiotherapist': 600,
    'biokineticist': 550,
    'dietician': 500,
    'personal-trainer': 450,
    'pain-management': 700,
    'coaching': 400,
    'psychology': 800,
    'psychiatry': 1000,
    'podiatrist': 550,
    'general-practitioner': 600,
    'sport-physician': 800,
    'orthopedic-surgeon': 1200,
    'family-medicine': 550,
    'gastroenterology': 900,
    'massage-therapy': 350,
    'nutrition-coach': 400,
    'occupational-therapy': 500,
    'physical-therapy': 550,
    'chiropractor': 450,
    'nurse-practitioner': 400,
    'cardiology': 900,
    'dermatology': 700,
    'neurology': 850,
    'endocrinology': 800,
    'urology': 750,
    'oncology': 1100,
    'rheumatology': 750,
    'pediatrics': 600,
    'geriatrics': 650,
    'sports-medicine': 700,
    'internal-medicine': 700,
    'orthopedics': 900,
    'neurosurgery': 1500,
    'infectious-disease': 850,
    'plastic-surgery': 1400,
    'obstetrics-gynecology': 750,
    'emergency-medicine': 1000,
    'anesthesiology': 1100,
    'radiology': 800,
    'geriatric-medicine': 650,
    'all': 500 // Default value
  };
  
  return costMap[serviceType] || 500; // Default to 500 if not found
}

export const getPriceRangeForService = (
  serviceType: ServiceCategory,
  tierName: string
): PriceRange => {
  // This is a simplified version - in production, this would come from a data source
  const defaultRange: PriceRange = { min: 400, max: 800 };
  
  // Example ranges by service and tier
  const ranges: Record<ServiceCategory, Record<string, PriceRange>> = {
    'physiotherapist': {
      'low': { min: 400, max: 600 },
      'medium': { min: 500, max: 800 },
      'high': { min: 700, max: 1200 }
    },
    'personal-trainer': {
      'low': { min: 300, max: 500 },
      'medium': { min: 450, max: 700 },
      'high': { min: 600, max: 1000 }
    },
    // Add more as needed
  };
  
  const serviceRanges = ranges[serviceType];
  if (serviceRanges && serviceRanges[tierName]) {
    return serviceRanges[tierName];
  }
  
  // Fall back to default if not specified
  return defaultRange;
};
