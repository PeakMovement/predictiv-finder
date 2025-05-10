
import { PlanContext, ServiceAllocation, ServiceCategory, ServiceAllocationItem, SessionAllocation } from "@/utils/planGenerator/types";
import { BASELINE_COSTS } from "@/utils/planGenerator/types";

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
 * Allocate services with proper sessions and costs
 */
export const allocateServices = (
  services: ServiceCategory[],
  context: PlanContext
): ServiceAllocation[] => {
  const allocatedServices: ServiceAllocation[] = [];
  
  // Calculate base budget if available
  const budget = context.budget || 5000;
  const serviceCount = services.length;
  const budgetPerService = budget / serviceCount;
  
  // Create a service allocation record for each service
  services.forEach(serviceType => {
    const baseCost = BASELINE_COSTS[serviceType];
    const affordableSessions = Math.max(1, Math.floor(budgetPerService / baseCost));
    
    allocatedServices.push({
      type: serviceType,
      price: baseCost,
      sessions: affordableSessions,
      description: getServiceDescription(serviceType, affordableSessions)
    });
  });
  
  return allocatedServices;
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
    case 'nutrition-coach':
      return `${sessions} nutrition coaching session${plural}`;
    case 'occupational-therapy':
      return `${sessions} occupational therapy session${plural}`;
    case 'physical-therapy':
      return `${sessions} physical therapy session${plural}`;
    case 'chiropractor':
      return `${sessions} chiropractic adjustment${plural}`;
    case 'nurse-practitioner':
      return `${sessions} nurse practitioner consultation${plural}`;
    default:
      return `${sessions} ${type.replace('-', ' ')} session${plural}`;
  }
};

/**
 * Calculate session allocations based on budget and services
 */
export const calculateServiceAllocations = (
  budget: number,
  services: ServiceCategory[]
): Record<ServiceCategory, SessionAllocation> => {
  const result: Partial<Record<ServiceCategory, SessionAllocation>> = {};
  
  // Simple allocation: divide budget equally
  const serviceCount = services.length;
  const budgetPerService = budget / serviceCount;
  
  services.forEach(service => {
    const baseCost = BASELINE_COSTS[service];
    const affordableSessions = Math.max(1, Math.floor(budgetPerService / baseCost));
    
    result[service] = {
      sessions: affordableSessions,
      costPerSession: baseCost,
      totalCost: baseCost * affordableSessions
    };
  });
  
  // Initialize all remaining services with 0 sessions
  // This is needed to satisfy TypeScript's Record type requirement
  const allServices = Object.keys(BASELINE_COSTS) as ServiceCategory[];
  allServices.forEach(service => {
    if (!result[service]) {
      result[service] = {
        sessions: 0,
        costPerSession: BASELINE_COSTS[service],
        totalCost: 0
      };
    }
  });
  
  return result as Record<ServiceCategory, SessionAllocation>;
};
