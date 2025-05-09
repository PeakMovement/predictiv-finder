
import { 
  ServiceCategory, 
  SpecialGroupDiscount, 
  UserPreference, 
  BudgetAllocationStrategy,
  BASELINE_COSTS
} from "../types";

/**
 * Interface for optimized service configuration
 */
export interface OptimizedServiceAllocation {
  type: ServiceCategory;
  sessions: number;
  costPerSession: number;
  totalCost: number;
  originalCost: number;
  discount?: number;
  discountReason?: string;
  frequency?: string;
  urgencyMultiplier?: number;
}

/**
 * Interface for budget optimization result
 */
export interface BudgetOptimizationResult {
  services: OptimizedServiceAllocation[];
  totalCost: number;
  originalTotalCost: number;
  totalDiscount: number;
  isWithinBudget: boolean;
  overspendAmount: number;
  overspendPercentage: number;
  planQuality: number; // 0-1 score
  recommendedBudgetIncrease?: number;
}

/**
 * Available special group discounts
 */
export const SPECIAL_GROUP_DISCOUNTS: SpecialGroupDiscount[] = [
  {
    group: 'student',
    discountPercentage: 20,
    applicableServices: ['dietician', 'personal-trainer', 'coaching', 'psychology'],
    minimumSessions: 4
  },
  {
    group: 'senior',
    discountPercentage: 15,
    applicableServices: ['physiotherapist', 'family-medicine', 'geriatrics']
  },
  {
    group: 'child',
    discountPercentage: 25,
    applicableServices: ['pediatrics', 'family-medicine', 'dietician']
  },
  {
    group: 'athlete',
    discountPercentage: 10,
    applicableServices: ['sports-medicine', 'physiotherapist', 'personal-trainer', 'biokineticist'],
    minimumSessions: 5
  },
  {
    group: 'military',
    discountPercentage: 15,
    applicableServices: ['physiotherapist', 'psychology', 'personal-trainer']
  },
  {
    group: 'loyalty',
    discountPercentage: 12,
    applicableServices: ['all']
  }
];

/**
 * Defines budget allocation strategies for different scenarios
 */
export const BUDGET_STRATEGIES: Record<string, BudgetAllocationStrategy> = {
  'balanced': {
    name: 'Balanced Care',
    description: 'Even distribution of sessions across services',
    priorityServices: [],
    minimumSessionsPerService: {} as Record<ServiceCategory, number>,
    balancingFactor: 0.8,
    overspendAllowed: false
  },
  'prioritized': {
    name: 'Prioritized Care',
    description: 'Focus on most important services',
    priorityServices: [],
    minimumSessionsPerService: {} as Record<ServiceCategory, number>,
    balancingFactor: 0.3,
    overspendAllowed: true,
    maxOverspendPercentage: 15
  },
  'limited': {
    name: 'Essential Care',
    description: 'Focus on essential services only',
    priorityServices: [],
    minimumSessionsPerService: {} as Record<ServiceCategory, number>,
    balancingFactor: 0.1,
    overspendAllowed: false
  },
  'comprehensive': {
    name: 'Comprehensive Care',
    description: 'Maximum coverage across all services',
    priorityServices: [],
    minimumSessionsPerService: {} as Record<ServiceCategory, number>,
    balancingFactor: 1.0,
    overspendAllowed: true,
    maxOverspendPercentage: 30
  },
  'urgent': {
    name: 'Urgent Care',
    description: 'Focus on immediate needs',
    priorityServices: [],
    minimumSessionsPerService: {} as Record<ServiceCategory, number>,
    balancingFactor: 0.2,
    overspendAllowed: true,
    maxOverspendPercentage: 25
  }
};

/**
 * Dynamic session rates for different service categories
 * based on frequency and duration
 */
export const DYNAMIC_PRICING_RULES = {
  frequencyDiscounts: {
    weekly: 0.0, // No discount for weekly sessions (base price)
    biweekly: 0.05, // 5% discount for bi-weekly sessions
    monthly: 0.08, // 8% discount for monthly sessions
    package: {
      5: 0.1, // 10% discount for 5+ sessions
      10: 0.15, // 15% discount for 10+ sessions
      20: 0.2 // 20% discount for 20+ sessions
    }
  },
  urgencyMultipliers: {
    standard: 1.0, // Standard pricing
    urgent: 1.2, // 20% premium for urgent care
    emergency: 1.5 // 50% premium for emergency care
  },
  specializedProviderMultiplier: 1.2 // 20% premium for specialized providers
};

/**
 * Detects if the user belongs to a special group based on input
 */
export function detectSpecialGroup(userInput: string): string[] {
  const inputLower = userInput.toLowerCase();
  const specialGroups: string[] = [];
  
  // Check for student status
  if (inputLower.includes('student') || 
      inputLower.includes('university') || 
      inputLower.includes('college') || 
      inputLower.includes('studying')) {
    specialGroups.push('student');
  }
  
  // Check for senior status
  if (inputLower.includes('retired') || 
      inputLower.includes('senior citizen') || 
      inputLower.includes('elderly') || 
      inputLower.includes('pension')) {
    specialGroups.push('senior');
  }
  
  // Check for child status
  if (inputLower.includes('child') || 
      inputLower.includes('my kid') || 
      inputLower.includes('my son') || 
      inputLower.includes('my daughter')) {
    specialGroups.push('child');
  }
  
  // Check for athlete status
  if (inputLower.includes('athlete') || 
      inputLower.includes('competitive') || 
      inputLower.includes('marathon') || 
      inputLower.includes('triathlon') || 
      inputLower.includes('professional sport')) {
    specialGroups.push('athlete');
  }
  
  // Check for military status
  if (inputLower.includes('military') || 
      inputLower.includes('veteran') || 
      inputLower.includes('service member') || 
      inputLower.includes('armed forces')) {
    specialGroups.push('military');
  }
  
  // Check for loyalty status - typically would check against user profile
  if (inputLower.includes('member') || 
      inputLower.includes('regular client') || 
      inputLower.includes('returning')) {
    specialGroups.push('loyalty');
  }
  
  return specialGroups;
}

/**
 * Determines the most appropriate allocation strategy based on user input and budget
 */
export function determineAllocationStrategy(
  userInput: string, 
  budget: number,
  priorityServices: ServiceCategory[],
  isUrgent: boolean
): BudgetAllocationStrategy {
  // Start with a copy of the balanced strategy
  const strategy = { ...BUDGET_STRATEGIES['balanced'] };
  
  // Set priority services
  strategy.priorityServices = [...priorityServices];
  
  // Set minimum sessions - default 1 for all priority services
  const minimumSessions: Record<ServiceCategory, number> = {};
  priorityServices.forEach(service => {
    minimumSessions[service] = 1;
  });
  
  // Analyze input text for strategy clues
  const inputLower = userInput.toLowerCase();
  
  // Check for urgency indicators
  if (isUrgent || 
      inputLower.includes('urgent') || 
      inputLower.includes('emergency') || 
      inputLower.includes('as soon as possible') || 
      inputLower.includes('right away')) {
    // Use urgent strategy
    return {
      ...BUDGET_STRATEGIES['urgent'],
      priorityServices,
      minimumSessionsPerService: minimumSessions
    };
  }
  
  // Check for limited budget indicators
  if (inputLower.includes('tight budget') || 
      inputLower.includes('limited budget') || 
      inputLower.includes('can\'t afford much') || 
      inputLower.includes('cheap') || 
      budget < 1000) {
    // Use limited strategy
    return {
      ...BUDGET_STRATEGIES['limited'],
      priorityServices,
      minimumSessionsPerService: minimumSessions
    };
  }
  
  // Check for comprehensive care indicators
  if (inputLower.includes('best care') || 
      inputLower.includes('top quality') || 
      inputLower.includes('premium') || 
      inputLower.includes('comprehensive') || 
      budget > 4000) {
    // Use comprehensive strategy
    return {
      ...BUDGET_STRATEGIES['comprehensive'],
      priorityServices,
      minimumSessionsPerService: minimumSessions
    };
  }
  
  // Check for priority focus indicators
  if (inputLower.includes('focus on') || 
      inputLower.includes('prioritize') || 
      inputLower.includes('most important') || 
      inputLower.includes('specific issue')) {
    // Use prioritized strategy
    return {
      ...BUDGET_STRATEGIES['prioritized'],
      priorityServices,
      minimumSessionsPerService: minimumSessions
    };
  }
  
  // Default to balanced strategy with configured priorities
  return {
    ...strategy,
    minimumSessionsPerService: minimumSessions
  };
}

/**
 * Apply special group discounts to service costs
 */
function applySpecialGroupDiscounts(
  services: OptimizedServiceAllocation[],
  specialGroups: string[]
): OptimizedServiceAllocation[] {
  if (!specialGroups.length) return services;
  
  return services.map(service => {
    // Find applicable discounts for this service
    const applicableDiscounts = SPECIAL_GROUP_DISCOUNTS.filter(discount => 
      specialGroups.includes(discount.group) && 
      (discount.applicableServices.includes('all') || 
       discount.applicableServices.includes(service.type)) &&
      (!discount.minimumSessions || service.sessions >= discount.minimumSessions)
    );
    
    // Apply the highest discount if any
    if (applicableDiscounts.length > 0) {
      // Sort by discount percentage descending
      applicableDiscounts.sort((a, b) => b.discountPercentage - a.discountPercentage);
      const bestDiscount = applicableDiscounts[0];
      
      // Calculate discounted cost
      const originalCost = service.costPerSession * service.sessions;
      const discountMultiplier = 1 - (bestDiscount.discountPercentage / 100);
      const discountedCostPerSession = service.costPerSession * discountMultiplier;
      
      return {
        ...service,
        costPerSession: discountedCostPerSession,
        totalCost: discountedCostPerSession * service.sessions,
        discount: bestDiscount.discountPercentage,
        discountReason: `${bestDiscount.group} discount`
      };
    }
    
    return service;
  });
}

/**
 * Apply dynamic pricing rules based on session frequency and urgency
 */
function applyDynamicPricing(
  services: OptimizedServiceAllocation[],
  urgencyLevel: number = 0
): OptimizedServiceAllocation[] {
  return services.map(service => {
    // Start with the original cost
    let adjustedCostPerSession = service.costPerSession;
    let adjustmentReasons: string[] = [];
    
    // Apply frequency-based discount
    if (service.sessions >= 20) {
      const discountRate = DYNAMIC_PRICING_RULES.frequencyDiscounts.package[20];
      adjustedCostPerSession = adjustedCostPerSession * (1 - discountRate);
      adjustmentReasons.push(`${Math.round(discountRate * 100)}% bulk discount (20+ sessions)`);
    } else if (service.sessions >= 10) {
      const discountRate = DYNAMIC_PRICING_RULES.frequencyDiscounts.package[10];
      adjustedCostPerSession = adjustedCostPerSession * (1 - discountRate);
      adjustmentReasons.push(`${Math.round(discountRate * 100)}% bulk discount (10+ sessions)`);
    } else if (service.sessions >= 5) {
      const discountRate = DYNAMIC_PRICING_RULES.frequencyDiscounts.package[5];
      adjustedCostPerSession = adjustedCostPerSession * (1 - discountRate);
      adjustmentReasons.push(`${Math.round(discountRate * 100)}% bulk discount (5+ sessions)`);
    }
    
    // Apply urgency multiplier if needed
    let urgencyMultiplier = 1.0;
    if (urgencyLevel > 0.8) {
      urgencyMultiplier = DYNAMIC_PRICING_RULES.urgencyMultipliers.emergency;
      adjustedCostPerSession = adjustedCostPerSession * urgencyMultiplier;
      adjustmentReasons.push(`${Math.round((urgencyMultiplier - 1) * 100)}% emergency premium`);
    } else if (urgencyLevel > 0.5) {
      urgencyMultiplier = DYNAMIC_PRICING_RULES.urgencyMultipliers.urgent;
      adjustedCostPerSession = adjustedCostPerSession * urgencyMultiplier;
      adjustmentReasons.push(`${Math.round((urgencyMultiplier - 1) * 100)}% urgency premium`);
    }
    
    // Update the service with adjusted pricing
    return {
      ...service,
      costPerSession: adjustedCostPerSession,
      totalCost: adjustedCostPerSession * service.sessions,
      discountReason: service.discountReason 
        ? `${service.discountReason}, ${adjustmentReasons.join(', ')}` 
        : adjustmentReasons.join(', '),
      urgencyMultiplier
    };
  });
}

/**
 * Calculate session frequencies based on number of sessions and timeframe
 */
function calculateSessionFrequencies(
  services: OptimizedServiceAllocation[],
  timeframeWeeks: number
): OptimizedServiceAllocation[] {
  return services.map(service => {
    let frequency = 'as needed';
    const sessionsPerWeek = service.sessions / timeframeWeeks;
    
    if (sessionsPerWeek >= 1) {
      frequency = sessionsPerWeek === 1 
        ? 'Weekly' 
        : `${sessionsPerWeek}x per week`;
    } else if (sessionsPerWeek >= 0.5) {
      frequency = 'Bi-weekly';
    } else if (sessionsPerWeek >= 0.25) {
      frequency = 'Monthly';
    } else {
      frequency = `${service.sessions}x over ${timeframeWeeks} weeks`;
    }
    
    return {
      ...service,
      frequency
    };
  });
}

/**
 * Creates an initial allocation of services based on priority scores and budget
 */
function createInitialAllocation(
  services: ServiceCategory[],
  servicePriorities: Record<ServiceCategory, number>,
  budget: number,
  strategy: BudgetAllocationStrategy
): OptimizedServiceAllocation[] {
  // Initialize with 0 sessions for all services
  let allocations = services.map(type => ({
    type,
    sessions: 0,
    costPerSession: BASELINE_COSTS[type] || 500,
    totalCost: 0,
    originalCost: BASELINE_COSTS[type] || 500
  }));
  
  // Calculate priority score total for distribution
  const totalPriorityScore = services.reduce(
    (sum, service) => sum + (servicePriorities[service] || 0.5),
    0
  );
  
  // First pass: Allocate minimum sessions to priority services
  allocations = allocations.map(allocation => {
    const minimumSessions = strategy.minimumSessionsPerService[allocation.type] || 0;
    return {
      ...allocation,
      sessions: minimumSessions,
      totalCost: minimumSessions * allocation.costPerSession
    };
  });
  
  // Calculate remaining budget after minimum allocations
  const allocatedBudget = allocations.reduce(
    (sum, allocation) => sum + allocation.totalCost,
    0
  );
  let remainingBudget = budget - allocatedBudget;
  
  // Second pass: Distribute remaining budget according to priorities
  if (remainingBudget > 0) {
    // Calculate ideal distribution based on priorities and balancing factor
    const idealAllocations = services.map(service => {
      const priority = servicePriorities[service] || 0.5;
      const balancedPriority = 
        (priority * (1 - strategy.balancingFactor)) + 
        (1 / services.length * strategy.balancingFactor);
      
      const idealBudgetShare = (balancedPriority / totalPriorityScore) * budget;
      const costPerSession = BASELINE_COSTS[service] || 500;
      const idealSessions = Math.floor(idealBudgetShare / costPerSession);
      
      return {
        type: service,
        idealSessions,
        priority: balancedPriority,
        costPerSession
      };
    });
    
    // Distribute remaining sessions based on priority order
    while (remainingBudget > 0) {
      // Sort by priority * (ideal sessions - actual sessions) to prioritize underallocated services
      idealAllocations.sort((a, b) => {
        const aAllocation = allocations.find(alloc => alloc.type === a.type);
        const bAllocation = allocations.find(alloc => alloc.type === b.type);
        
        if (!aAllocation || !bAllocation) return 0;
        
        const aGap = (a.idealSessions - aAllocation.sessions) * a.priority;
        const bGap = (b.idealSessions - bAllocation.sessions) * b.priority;
        
        return bGap - aGap;
      });
      
      // Try to allocate one more session to the top service
      const topService = idealAllocations[0];
      const allocation = allocations.find(alloc => alloc.type === topService.type);
      
      if (allocation && remainingBudget >= allocation.costPerSession) {
        allocation.sessions += 1;
        allocation.totalCost = allocation.sessions * allocation.costPerSession;
        remainingBudget -= allocation.costPerSession;
      } else {
        // If we can't allocate more to the top service, we're done
        break;
      }
    }
  }
  
  return allocations.filter(allocation => allocation.sessions > 0);
}

/**
 * Optimizes the service allocation to fit within budget constraints
 */
function optimizeAllocation(
  initialAllocation: OptimizedServiceAllocation[],
  budget: number,
  servicePriorities: Record<ServiceCategory, number>,
  strategy: BudgetAllocationStrategy
): OptimizedServiceAllocation[] {
  // Calculate total cost
  const totalCost = initialAllocation.reduce(
    (sum, allocation) => sum + allocation.totalCost,
    0
  );
  
  // If we're within budget, or overspend is allowed within limits, return as is
  if (totalCost <= budget || 
      (strategy.overspendAllowed && 
       ((totalCost - budget) / budget) * 100 <= (strategy.maxOverspendPercentage || 0))) {
    return initialAllocation;
  }
  
  // Need to reduce sessions to fit within budget
  let currentAllocations = [...initialAllocation];
  let currentCost = totalCost;
  
  // Continue removing sessions until we're within budget
  while (currentCost > budget) {
    // Sort services by priority (ascending) to remove from lowest priority first
    currentAllocations.sort((a, b) => 
      (servicePriorities[a.type] || 0.5) - (servicePriorities[b.type] || 0.5)
    );
    
    // Get the lowest priority service that has more than minimum sessions
    const serviceToReduce = currentAllocations.find(alloc => {
      const minSessions = strategy.minimumSessionsPerService[alloc.type] || 0;
      return alloc.sessions > minSessions;
    });
    
    if (!serviceToReduce) {
      // Can't reduce any further without going below minimum sessions
      break;
    }
    
    // Reduce by one session
    serviceToReduce.sessions -= 1;
    serviceToReduce.totalCost = serviceToReduce.sessions * serviceToReduce.costPerSession;
    
    // Recalculate total cost
    currentCost = currentAllocations.reduce(
      (sum, allocation) => sum + allocation.totalCost,
      0
    );
    
    // Remove any services that now have 0 sessions
    currentAllocations = currentAllocations.filter(alloc => alloc.sessions > 0);
  }
  
  return currentAllocations;
}

/**
 * Main function: Generate optimized service allocation based on budget and priorities
 */
export function generateOptimizedServiceAllocation(
  services: ServiceCategory[],
  servicePriorities: Record<ServiceCategory, number>,
  budget: number,
  userInput: string,
  timeframeWeeks: number = 8,
  urgencyLevel: number = 0,
  userPreferences?: UserPreference
): BudgetOptimizationResult {
  console.log("Optimizing service allocation for budget:", budget);
  console.log("Services to allocate:", services);
  
  // Step 1: Detect special groups for discounts
  const specialGroups = detectSpecialGroup(userInput);
  console.log("Detected special groups:", specialGroups);
  
  // Step 2: Determine the best allocation strategy
  const strategy = determineAllocationStrategy(
    userInput, 
    budget, 
    // Sort services by priority and take top 2
    [...services].sort((a, b) => (servicePriorities[b] || 0) - (servicePriorities[a] || 0)).slice(0, 2),
    urgencyLevel > 0.5
  );
  console.log("Selected allocation strategy:", strategy.name);
  
  // Step 3: Create initial allocation
  let allocation = createInitialAllocation(services, servicePriorities, budget, strategy);
  console.log("Initial allocation created with", allocation.length, "services");
  
  // Step 4: Optimize allocation to fit budget constraints
  allocation = optimizeAllocation(allocation, budget, servicePriorities, strategy);
  console.log("Optimized allocation to fit budget constraints");
  
  // Step 5: Apply special group discounts
  const discountedAllocation = applySpecialGroupDiscounts(allocation, specialGroups);
  console.log("Applied special group discounts");
  
  // Step 6: Apply dynamic pricing rules
  const pricedAllocation = applyDynamicPricing(discountedAllocation, urgencyLevel);
  console.log("Applied dynamic pricing rules");
  
  // Step 7: Calculate session frequencies
  const finalAllocation = calculateSessionFrequencies(pricedAllocation, timeframeWeeks);
  console.log("Calculated session frequencies");
  
  // Calculate result metrics
  const totalCost = finalAllocation.reduce((sum, service) => sum + service.totalCost, 0);
  const originalTotalCost = finalAllocation.reduce(
    (sum, service) => sum + (service.originalCost * service.sessions), 
    0
  );
  const totalDiscount = originalTotalCost - totalCost;
  const isWithinBudget = totalCost <= budget;
  const overspendAmount = Math.max(0, totalCost - budget);
  const overspendPercentage = budget > 0 ? (overspendAmount / budget) * 100 : 0;
  
  // Calculate plan quality score (0-1)
  // Based on: coverage of high-priority services, session counts, and budget utilization
  const idealSessionsPerService = 4; // Benchmark
  const prioritySessionCoverage = finalAllocation.reduce((sum, service) => {
    const priority = servicePriorities[service.type] || 0.5;
    const sessionCoverageScore = Math.min(service.sessions / idealSessionsPerService, 1);
    return sum + (priority * sessionCoverageScore);
  }, 0);
  
  const totalPriorityScore = Object.values(servicePriorities).reduce(
    (sum, priority) => sum + (priority || 0.5), 
    0
  );
  
  const priorityCoverage = totalPriorityScore > 0 
    ? prioritySessionCoverage / totalPriorityScore 
    : 0.5;
  
  // Budget utilization score - ideally close to 100% but not over
  const budgetUtilizationScore = isWithinBudget 
    ? totalCost / budget 
    : Math.max(0, 1 - (overspendPercentage / 100));
  
  // Combine scores
  const planQuality = (priorityCoverage * 0.7) + (budgetUtilizationScore * 0.3);
  
  // Recommend budget increase if quality is low and we're at budget limit
  let recommendedBudgetIncrease: number | undefined;
  if (planQuality < 0.6 && overspendAmount === 0 && totalCost >= budget * 0.95) {
    // Recommend 20% increase for low quality plans hitting budget limit
    recommendedBudgetIncrease = Math.round(budget * 0.2);
  }
  
  return {
    services: finalAllocation,
    totalCost,
    originalTotalCost,
    totalDiscount,
    isWithinBudget,
    overspendAmount,
    overspendPercentage,
    planQuality,
    recommendedBudgetIncrease
  };
}
