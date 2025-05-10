
import { ServiceCategory, BudgetTier } from '../types';

export interface OptimizedBudgetAllocation {
  services: Record<ServiceCategory, {
    sessions: number;
    costPerSession: number;
    totalCost: number;
  }>;
  totalCost: number;
  remainingBudget: number;
  optimizationStrategy: string;
}

export interface BudgetConstraints {
  maxOverage: number; // Maximum amount over budget allowed (0 for strict budget)
  minSessionsPerService: number; // Minimum sessions per service if included
  preferredDistribution: 'balanced' | 'priority-focused' | 'cost-optimized';
}

/**
 * Optimizes budget allocation across services based on priorities and constraints
 */
export function optimizeBudgetAllocation(
  budget: number,
  servicePriorities: Record<ServiceCategory, number>,
  constraints: BudgetConstraints = {
    maxOverage: 0,
    minSessionsPerService: 1,
    preferredDistribution: 'balanced'
  }
): OptimizedBudgetAllocation {
  // Default empty allocation
  const defaultAllocation: OptimizedBudgetAllocation = {
    services: {} as Record<ServiceCategory, { sessions: number; costPerSession: number; totalCost: number }>,
    totalCost: 0,
    remainingBudget: budget,
    optimizationStrategy: 'default'
  };

  // If no budget or no services, return empty allocation
  if (!budget || budget <= 0 || Object.keys(servicePriorities).length === 0) {
    return defaultAllocation;
  }

  // Get services sorted by priority
  const servicesArray = Object.entries(servicePriorities)
    .map(([category, priority]) => ({
      category: category as ServiceCategory,
      priority: priority || 0
    }))
    .sort((a, b) => b.priority - a.priority);

  // Initialize base costs for services
  const baseCosts = getServiceBaseCosts();
  
  // Initialize allocation
  const allocation: Record<ServiceCategory, {
    sessions: number;
    costPerSession: number;
    totalCost: number;
  }> = {};

  // Initialize all services to zero sessions
  servicesArray.forEach(service => {
    allocation[service.category] = {
      sessions: 0,
      costPerSession: baseCosts[service.category] || 500,
      totalCost: 0
    };
  });

  // Calculate total priority points
  const totalPriority = servicesArray.reduce((sum, service) => sum + service.priority, 0);

  // Working budget considering potential overage
  const workingBudget = budget + constraints.maxOverage;
  
  let remainingBudget = workingBudget;
  let strategy = '';

  // Apply different allocation strategies based on constraints
  switch (constraints.preferredDistribution) {
    case 'priority-focused':
      // Allocate to highest priority services first
      strategy = 'priority-focused';
      
      for (const service of servicesArray) {
        if (service.priority <= 0) continue;
        
        const baseCost = baseCosts[service.category] || 500;
        
        // How many sessions can we afford for this high priority service?
        const affordableSessions = Math.floor(remainingBudget / baseCost);
        
        if (affordableSessions >= constraints.minSessionsPerService) {
          // Allocate the minimum sessions first
          const sessions = Math.max(constraints.minSessionsPerService, 
            Math.floor((service.priority / totalPriority) * workingBudget / baseCost));
          
          allocation[service.category] = {
            sessions,
            costPerSession: baseCost,
            totalCost: sessions * baseCost
          };
          
          remainingBudget -= sessions * baseCost;
        }
      }
      break;
      
    case 'cost-optimized':
      // Try to get the most sessions by preferring lower cost services
      strategy = 'cost-optimized';
      
      // Sort by cost (cheapest first), but still considering priority
      const costEffectiveServices = [...servicesArray]
        .sort((a, b) => {
          const costA = baseCosts[a.category] || 500;
          const costB = baseCosts[b.category] || 500;
          const valueRatioA = a.priority / costA;
          const valueRatioB = b.priority / costB;
          return valueRatioB - valueRatioA;
        });
      
      for (const service of costEffectiveServices) {
        if (service.priority <= 0) continue;
        
        const baseCost = baseCosts[service.category] || 500;
        
        // Calculate value-weighted sessions
        const sessionWeight = (service.priority / totalPriority) * 
                             (1 + (500 - baseCost) / 500); // Bonus for cheaper services
        
        const desiredSessions = Math.max(
          constraints.minSessionsPerService,
          Math.floor(sessionWeight * workingBudget / baseCost / 2) // Divide by 2 to be conservative
        );
        
        if (baseCost * desiredSessions <= remainingBudget) {
          allocation[service.category] = {
            sessions: desiredSessions,
            costPerSession: baseCost,
            totalCost: desiredSessions * baseCost
          };
          
          remainingBudget -= desiredSessions * baseCost;
        }
      }
      break;
      
    case 'balanced':
    default:
      // Balance services based on priority but ensure all get some sessions
      strategy = 'balanced';
      
      // First pass: ensure each service gets minimum sessions if possible
      for (const service of servicesArray) {
        if (service.priority <= 0) continue;
        
        const baseCost = baseCosts[service.category] || 500;
        const minCost = constraints.minSessionsPerService * baseCost;
        
        if (minCost <= remainingBudget) {
          allocation[service.category] = {
            sessions: constraints.minSessionsPerService,
            costPerSession: baseCost,
            totalCost: minCost
          };
          
          remainingBudget -= minCost;
        }
      }
      
      // Second pass: distribute remaining budget proportionally
      if (remainingBudget > 0) {
        // Calculate priority sum of services that got minimum sessions
        const activeServices = servicesArray.filter(
          s => allocation[s.category].sessions >= constraints.minSessionsPerService
        );
        
        const activePrioritySum = activeServices.reduce(
          (sum, s) => sum + s.priority, 0
        );
        
        // Distribute remaining budget
        for (const service of activeServices) {
          const baseCost = baseCosts[service.category] || 500;
          const priorityShare = service.priority / activePrioritySum;
          const additionalBudget = Math.floor(remainingBudget * priorityShare);
          
          if (additionalBudget >= baseCost) {
            const additionalSessions = Math.floor(additionalBudget / baseCost);
            
            allocation[service.category].sessions += additionalSessions;
            allocation[service.category].totalCost += additionalSessions * baseCost;
            
            remainingBudget -= additionalSessions * baseCost;
          }
        }
      }
      break;
  }

  // Calculate total allocated cost
  const totalAllocatedCost = Object.values(allocation)
    .reduce((sum, alloc) => sum + alloc.totalCost, 0);

  // Return complete allocation
  return {
    services: allocation,
    totalCost: totalAllocatedCost,
    remainingBudget: budget - totalAllocatedCost,
    optimizationStrategy: strategy
  };
}

/**
 * Get base costs for different service types
 */
function getServiceBaseCosts(): Record<ServiceCategory, number> {
  // Initialize with empty object that we'll populate
  const baseCosts: Record<ServiceCategory, number> = {} as Record<ServiceCategory, number>;
  
  // Define base costs for each service type
  baseCosts['physiotherapist'] = 600;
  baseCosts['biokineticist'] = 550;
  baseCosts['dietician'] = 500;
  baseCosts['personal-trainer'] = 450;
  baseCosts['pain-management'] = 700;
  baseCosts['coaching'] = 400;
  baseCosts['psychology'] = 800;
  baseCosts['psychiatry'] = 1000;
  baseCosts['podiatrist'] = 550;
  baseCosts['general-practitioner'] = 600;
  baseCosts['sport-physician'] = 800;
  baseCosts['orthopedic-surgeon'] = 1200;
  baseCosts['family-medicine'] = 550;
  baseCosts['gastroenterology'] = 900;
  baseCosts['massage-therapy'] = 350;
  baseCosts['nutrition-coach'] = 400;
  baseCosts['occupational-therapy'] = 500;
  baseCosts['physical-therapy'] = 550;
  baseCosts['chiropractor'] = 450;
  baseCosts['nurse-practitioner'] = 400;
  baseCosts['cardiology'] = 900;
  baseCosts['dermatology'] = 700;
  baseCosts['neurology'] = 850;
  baseCosts['endocrinology'] = 800;
  baseCosts['urology'] = 750;
  baseCosts['oncology'] = 1100;
  baseCosts['rheumatology'] = 750;
  baseCosts['pediatrics'] = 600;
  baseCosts['geriatrics'] = 650;
  baseCosts['sports-medicine'] = 700;
  baseCosts['internal-medicine'] = 700;
  baseCosts['orthopedics'] = 900;
  baseCosts['neurosurgery'] = 1500;
  baseCosts['infectious-disease'] = 850;
  baseCosts['plastic-surgery'] = 1400;
  baseCosts['obstetrics-gynecology'] = 750;
  baseCosts['emergency-medicine'] = 1000;
  baseCosts['anesthesiology'] = 1100;
  baseCosts['radiology'] = 800;
  baseCosts['geriatric-medicine'] = 650;
  baseCosts['all'] = 500; // Default value
  
  return baseCosts;
}

/**
 * Determine the appropriate budget tier based on amount
 */
export function determineBudgetTier(budget: number): BudgetTier {
  if (budget <= 0) {
    return {
      name: 'low',
      range: { min: 0, max: 1000 },
      maxSessions: 1,
      budget: 500
    };
  } else if (budget <= 1000) {
    return {
      name: 'low',
      range: { min: 0, max: 1000 },
      maxSessions: 2,
      budget: budget
    };
  } else if (budget <= 2500) {
    return {
      name: 'medium',
      range: { min: 1001, max: 2500 },
      maxSessions: 3,
      budget: budget
    };
  } else {
    return {
      name: 'high',
      range: { min: 2501, max: 10000 },
      maxSessions: 4,
      budget: budget
    };
  }
}
