
import { ServiceCategory } from "../types";

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
  
  // Common service maximum sessions by tier
  const baseMaxSessions: Record<string, Record<ServiceCategory, number>> = {
    economy: {
      'personal-trainer': 2,
      'dietician': 1,
      'physiotherapist': 2,
      'family-medicine': 1,
      'coaching': 1,
      'psychiatry': 1,
      'gastroenterology': 1,
      'cardiology': 1,
      'orthopedics': 1,
      'biokineticist': 1,
      'pain-management': 1,
      'endocrinology': 1
    },
    standard: {
      'personal-trainer': 4,
      'dietician': 2,
      'physiotherapist': 3,
      'family-medicine': 1,
      'coaching': 2,
      'psychiatry': 2,
      'gastroenterology': 1,
      'cardiology': 1,
      'orthopedics': 1,
      'biokineticist': 2,
      'pain-management': 2,
      'endocrinology': 1
    },
    premium: {
      'personal-trainer': 8,
      'dietician': 4,
      'physiotherapist': 6,
      'family-medicine': 2,
      'coaching': 4,
      'psychiatry': 4,
      'gastroenterology': 2,
      'cardiology': 2,
      'orthopedics': 2,
      'biokineticist': 3,
      'pain-management': 3,
      'endocrinology': 2
    },
    intensive: {
      'personal-trainer': 12,
      'dietician': 6,
      'physiotherapist': 8,
      'family-medicine': 3,
      'coaching': 8,
      'psychiatry': 6,
      'gastroenterology': 3,
      'cardiology': 3,
      'orthopedics': 3,
      'biokineticist': 4,
      'pain-management': 4,
      'endocrinology': 3
    }
  };
  
  // Session priorities by default
  const baseServicePriorities: Record<ServiceCategory, number> = {
    'personal-trainer': 0.8,
    'dietician': 0.7,
    'physiotherapist': 0.8,
    'family-medicine': 0.6,
    'coaching': 0.7,
    'psychiatry': 0.8,
    'gastroenterology': 0.6,
    'cardiology': 0.6,
    'orthopedics': 0.7,
    'biokineticist': 0.6,
    'pain-management': 0.7,
    'endocrinology': 0.6
  };
  
  // Adjust service priorities based on user preferences
  const servicePriorities = { ...baseServicePriorities };
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
  
  // Base costs per session for each service type
  const baseCosts: Record<ServiceCategory, number> = {
    'dietician': 500,
    'personal-trainer': 400,
    'physiotherapist': 600,
    'coaching': 400,
    'family-medicine': 500,
    'biokineticist': 600,
    'internal-medicine': 800,
    'cardiology': 900,
    'dermatology': 700,
    'orthopedics': 800,
    'neurology': 900,
    'gastroenterology': 700,
    'psychiatry': 900,
    'endocrinology': 800,
    'pain-management': 700,
    'pediatrics': 600,
    'obstetrics-gynecology': 800,
    'emergency-medicine': 1500,
    'anesthesiology': 1200,
    'urology': 800,
    'oncology': 1000,
    'neurosurgery': 1800,
    'infectious-disease': 800,
    'radiology': 700,
    'geriatric-medicine': 700,
    'plastic-surgery': 1500,
    'rheumatology': 800,
  };
  
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
