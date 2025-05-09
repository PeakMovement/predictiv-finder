
import { ServiceCategory, BASELINE_COSTS } from "../types";

/**
 * Represents a budget tier with range and features
 */
export interface EnhancedBudgetTier {
  name: string;
  budget: number;
  maxSessions: Record<ServiceCategory, number>;
  idealSessionCount: number;
  servicePriorities: Record<ServiceCategory, number>;
  description: string;
  isStrictBudget: boolean;
}

/**
 * Creates multiple budget tiers from user constraints
 * 
 * @param specifiedBudget - User specified budget (if any)
 * @param isStrictBudget - Whether budget is a strict constraint
 * @param preferredServices - Services to prioritize in budget allocation
 * @param timeframeWeeks - Desired timeframe in weeks
 * @returns Array of budget tiers
 */
export function generateBudgetTiers(
  specifiedBudget?: number,
  isStrictBudget: boolean = false,
  preferredServices: ServiceCategory[] = [],
  timeframeWeeks: number = 4
): EnhancedBudgetTier[] {
  // Default budget if none specified
  const baseBudget = specifiedBudget || 2000;
  const budgetTiers: EnhancedBudgetTier[] = [];
  
  console.log("Generating budget tiers based on:", { 
    specifiedBudget: baseBudget, 
    isStrictBudget, 
    timeframeWeeks 
  });
  
  // Define a function to create complete service records with default values
  const createFullServiceRecord = <T>(defaultValue: T): Record<ServiceCategory, T> => {
    // Use the keys from BASELINE_COSTS which contains all ServiceCategory values
    return Object.keys(BASELINE_COSTS).reduce((acc, key) => {
      acc[key as ServiceCategory] = defaultValue;
      return acc;
    }, {} as Record<ServiceCategory, T>);
  };
  
  // Common service maximum sessions by tier - define complete records
  const baseMaxSessions: Record<string, Record<ServiceCategory, number>> = {
    economy: createFullServiceRecord(1),
    standard: createFullServiceRecord(2),
    premium: createFullServiceRecord(3),
    intensive: createFullServiceRecord(4)
  };
  
  // Now override with specific values for common service categories
  // Economy tier
  baseMaxSessions.economy['personal-trainer'] = 2;
  baseMaxSessions.economy['dietician'] = 1;
  baseMaxSessions.economy['physiotherapist'] = 2;
  baseMaxSessions.economy['family-medicine'] = 1;
  baseMaxSessions.economy['coaching'] = 1;
  baseMaxSessions.economy['psychiatry'] = 1;
  baseMaxSessions.economy['gastroenterology'] = 1;
  baseMaxSessions.economy['cardiology'] = 1;
  baseMaxSessions.economy['orthopedics'] = 1;
  baseMaxSessions.economy['biokineticist'] = 1;
  baseMaxSessions.economy['pain-management'] = 1;
  baseMaxSessions.economy['endocrinology'] = 1;
  
  // Standard tier
  baseMaxSessions.standard['personal-trainer'] = 4;
  baseMaxSessions.standard['dietician'] = 2;
  baseMaxSessions.standard['physiotherapist'] = 3;
  baseMaxSessions.standard['family-medicine'] = 1;
  baseMaxSessions.standard['coaching'] = 2;
  baseMaxSessions.standard['psychiatry'] = 2;
  baseMaxSessions.standard['gastroenterology'] = 1;
  baseMaxSessions.standard['cardiology'] = 1;
  baseMaxSessions.standard['orthopedics'] = 1;
  baseMaxSessions.standard['biokineticist'] = 2;
  baseMaxSessions.standard['pain-management'] = 2;
  baseMaxSessions.standard['endocrinology'] = 1;
  
  // Premium tier
  baseMaxSessions.premium['personal-trainer'] = 8;
  baseMaxSessions.premium['dietician'] = 4;
  baseMaxSessions.premium['physiotherapist'] = 6;
  baseMaxSessions.premium['family-medicine'] = 2;
  baseMaxSessions.premium['coaching'] = 4;
  baseMaxSessions.premium['psychiatry'] = 4;
  baseMaxSessions.premium['gastroenterology'] = 2;
  baseMaxSessions.premium['cardiology'] = 2;
  baseMaxSessions.premium['orthopedics'] = 2;
  baseMaxSessions.premium['biokineticist'] = 3;
  baseMaxSessions.premium['pain-management'] = 3;
  baseMaxSessions.premium['endocrinology'] = 2;
  
  // Intensive tier
  baseMaxSessions.intensive['personal-trainer'] = 12;
  baseMaxSessions.intensive['dietician'] = 6;
  baseMaxSessions.intensive['physiotherapist'] = 8;
  baseMaxSessions.intensive['family-medicine'] = 3;
  baseMaxSessions.intensive['coaching'] = 8;
  baseMaxSessions.intensive['psychiatry'] = 6;
  baseMaxSessions.intensive['gastroenterology'] = 3;
  baseMaxSessions.intensive['cardiology'] = 3;
  baseMaxSessions.intensive['orthopedics'] = 3;
  baseMaxSessions.intensive['biokineticist'] = 4;
  baseMaxSessions.intensive['pain-management'] = 4;
  baseMaxSessions.intensive['endocrinology'] = 3;
  
  // Session priorities by default, covering all service categories
  const baseServicePriorities = createFullServiceRecord(0.5);
  
  // Override priorities for common categories
  baseServicePriorities['personal-trainer'] = 0.8;
  baseServicePriorities['dietician'] = 0.7;
  baseServicePriorities['physiotherapist'] = 0.8;
  baseServicePriorities['family-medicine'] = 0.6;
  baseServicePriorities['coaching'] = 0.7;
  baseServicePriorities['psychiatry'] = 0.8;
  baseServicePriorities['gastroenterology'] = 0.6;
  baseServicePriorities['cardiology'] = 0.6;
  baseServicePriorities['orthopedics'] = 0.7;
  baseServicePriorities['biokineticist'] = 0.6;
  baseServicePriorities['pain-management'] = 0.7;
  baseServicePriorities['endocrinology'] = 0.6;
  
  // Adjust service priorities based on user preferences
  const servicePriorities = {...baseServicePriorities};
  preferredServices.forEach(service => {
    servicePriorities[service] = Math.min((servicePriorities[service] || 0.5) + 0.2, 1.0);
  });
  
  // Very low budget - Economy only
  if (baseBudget < 1000) {
    // For very tight budgets, offer just the economy tier
    const economyBudget = Math.max(500, baseBudget);
    budgetTiers.push({
      name: "Economy",
      budget: economyBudget,
      maxSessions: baseMaxSessions.economy,
      idealSessionCount: 2,
      servicePriorities,
      description: "A focused plan designed to maximize value on a limited budget.",
      isStrictBudget: true
    });
    
    // If not strict budget, also offer a standard tier
    if (!isStrictBudget) {
      budgetTiers.push({
        name: "Standard",
        budget: Math.min(economyBudget * 1.5, 1500),
        maxSessions: baseMaxSessions.economy,
        idealSessionCount: 3,
        servicePriorities,
        description: "An enhanced plan with additional sessions for better outcomes.",
        isStrictBudget: false
      });
    }
  }
  // Low to moderate budget
  else if (baseBudget < 2000) {
    // Economy tier (lower than specified if not strict)
    if (!isStrictBudget) {
      budgetTiers.push({
        name: "Economy",
        budget: Math.round(baseBudget * 0.7),
        maxSessions: baseMaxSessions.economy,
        idealSessionCount: 3,
        servicePriorities,
        description: "A balanced plan that focuses on essential services.",
        isStrictBudget: false
      });
    }
    
    // Standard tier (at specified budget)
    budgetTiers.push({
      name: "Standard",
      budget: baseBudget,
      maxSessions: baseMaxSessions.standard,
      idealSessionCount: 4,
      servicePriorities,
      description: "A comprehensive plan designed to address your primary needs.",
      isStrictBudget
    });
    
    // Premium tier (if not strict budget)
    if (!isStrictBudget) {
      budgetTiers.push({
        name: "Premium",
        budget: Math.round(baseBudget * 1.4),
        maxSessions: baseMaxSessions.premium,
        idealSessionCount: 6,
        servicePriorities,
        description: "An enhanced plan with additional sessions and service options.",
        isStrictBudget: false
      });
    }
  }
  // Moderate to high budget
  else {
    // Economy tier (if not strict)
    if (!isStrictBudget) {
      budgetTiers.push({
        name: "Economy",
        budget: Math.round(baseBudget * 0.6),
        maxSessions: baseMaxSessions.economy,
        idealSessionCount: 3,
        servicePriorities,
        description: "A focused plan that addresses your core needs efficiently.",
        isStrictBudget: false
      });
    }
    
    // Standard tier
    budgetTiers.push({
      name: "Standard",
      budget: isStrictBudget ? baseBudget : Math.round(baseBudget * 0.85),
      maxSessions: baseMaxSessions.standard,
      idealSessionCount: 5,
      servicePriorities,
      description: "A well-balanced plan with comprehensive service coverage.",
      isStrictBudget
    });
    
    // Premium tier
    budgetTiers.push({
      name: "Premium",
      budget: isStrictBudget ? baseBudget : baseBudget,
      maxSessions: baseMaxSessions.premium,
      idealSessionCount: 7,
      servicePriorities,
      description: "A premium plan with enhanced service frequency and options.",
      isStrictBudget: false
    });
    
    // Intensive tier for high budgets
    if (baseBudget > 3500 && !isStrictBudget) {
      budgetTiers.push({
        name: "Intensive",
        budget: Math.round(baseBudget * 1.3),
        maxSessions: baseMaxSessions.intensive,
        idealSessionCount: 10,
        servicePriorities,
        description: "An intensive program with maximum support and professional guidance.",
        isStrictBudget: false
      });
    }
  }
  
  // Special case: for longer timeframes, adjust session counts
  if (timeframeWeeks > 6) {
    budgetTiers.forEach(tier => {
      const multiplier = Math.min(timeframeWeeks / 4, 2); // Cap at 2x for very long timeframes
      
      // Increase session counts for longer timeframes
      Object.keys(tier.maxSessions).forEach(service => {
        tier.maxSessions[service as ServiceCategory] = Math.round(
          tier.maxSessions[service as ServiceCategory] * multiplier
        );
      });
      
      tier.idealSessionCount = Math.round(tier.idealSessionCount * multiplier);
    });
  }
  
  console.log("Generated budget tiers:", budgetTiers.map(t => t.name));
  return budgetTiers;
}

/**
 * Calculates optimal service allocation within a budget
 * 
 * @param budget - Available budget
 * @param services - Services to allocate budget to
 * @param priorities - Service priorities (0-1)
 * @param isStrictBudget - Whether budget is a strict constraint
 * @returns Optimized service allocations with sessions and costs
 */
export function optimizeServiceAllocation(
  budget: number,
  services: ServiceCategory[],
  priorities: Record<ServiceCategory, number>,
  maxSessions: Record<ServiceCategory, number>,
  isStrictBudget: boolean = false
): Array<{
  type: ServiceCategory;
  sessions: number;
  costPerSession: number;
  totalCost: number;
  allocation: number;
}> {
  console.log("Optimizing service allocation for budget:", budget);
  
  // Base costs per session for each service type - using BASELINE_COSTS for complete typing
  const baseCosts = {...BASELINE_COSTS};
  
  // Calculate total priority score for normalization
  const filteredServices = services.filter(s => priorities[s] > 0);
  const totalPriority = filteredServices.reduce(
    (sum, service) => sum + (priorities[service] || 0.5),
    0
  );
  
  if (totalPriority === 0 || filteredServices.length === 0) {
    console.log("No valid services to allocate budget to");
    return [];
  }
  
  // Initial allocation based on normalized priorities
  let allocations = filteredServices.map(service => {
    const normalizedPriority = (priorities[service] || 0.5) / totalPriority;
    const rawAllocation = normalizedPriority * budget;
    const costPerSession = baseCosts[service] || 500;
    let sessions = Math.floor(rawAllocation / costPerSession);
    
    // Ensure we don't exceed max sessions
    sessions = Math.min(sessions, maxSessions[service] || 4);
    
    // Ensure at least one session if possible
    sessions = Math.max(sessions, 1);
    
    // Calculate actual cost
    const totalCost = sessions * costPerSession;
    
    return {
      type: service,
      sessions,
      costPerSession,
      totalCost,
      allocation: normalizedPriority
    };
  });
  
  // Calculate total allocated budget
  let totalAllocated = allocations.reduce((sum, a) => sum + a.totalCost, 0);
  
  // If we're over budget, reduce sessions from lowest priority services
  if (isStrictBudget && totalAllocated > budget) {
    // Sort by priority (ascending, so lowest priority first)
    allocations.sort((a, b) => a.allocation - b.allocation);
    
    // Reduce sessions until we're under budget
    for (let i = 0; i < allocations.length && totalAllocated > budget; i++) {
      while (allocations[i].sessions > 1 && totalAllocated > budget) {
        allocations[i].sessions--;
        totalAllocated -= allocations[i].costPerSession;
      }
    }
    
    // If we're still over budget, start removing lowest priority services entirely
    if (totalAllocated > budget) {
      let i = 0;
      while (i < allocations.length && totalAllocated > budget) {
        if (allocations[i].sessions === 1) {
          totalAllocated -= allocations[i].totalCost;
          allocations[i].sessions = 0;
        }
        i++;
      }
    }
    
    // Remove any services with 0 sessions
    allocations = allocations.filter(a => a.sessions > 0);
    
    // Recalculate total costs
    allocations.forEach(a => {
      a.totalCost = a.sessions * a.costPerSession;
    });
  }
  
  // If we have budget left over, add sessions to highest priority services
  else if (totalAllocated < budget * 0.9) {
    // Sort by priority (descending)
    allocations.sort((a, b) => b.allocation - a.allocation);
    
    // Add sessions until we use at least 90% of budget
    for (let i = 0; i < allocations.length && totalAllocated < budget * 0.9; i++) {
      while (allocations[i].sessions < maxSessions[allocations[i].type] && 
             totalAllocated + allocations[i].costPerSession <= budget) {
        allocations[i].sessions++;
        totalAllocated += allocations[i].costPerSession;
      }
    }
    
    // Update total costs
    allocations.forEach(a => {
      a.totalCost = a.sessions * a.costPerSession;
    });
  }
  
  // Sort by priority for consistent display order
  return allocations.sort((a, b) => b.allocation - a.allocation);
}
