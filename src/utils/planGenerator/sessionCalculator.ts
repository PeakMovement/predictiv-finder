// Update the SessionAllocation objects to include count and priorityLevel
import { ServiceCategory, ServiceAllocation, BASELINE_COSTS } from './types';

export function calculateDefaultSessionAllocations(): Record<ServiceCategory, ServiceAllocation> {
  return {
    'physiotherapist': { 
      sessions: 4, 
      costPerSession: 600, 
      totalCost: 2400,
      count: 4,
      priorityLevel: 'high'
    },
    'biokineticist': { 
      sessions: 4, 
      costPerSession: 550, 
      totalCost: 2200,
      count: 4,
      priorityLevel: 'high'
    },
    'dietician': { 
      sessions: 3, 
      costPerSession: 500, 
      totalCost: 1500,
      count: 3,
      priorityLevel: 'medium'
    },
    'personal-trainer': { 
      sessions: 3, 
      costPerSession: 450, 
      totalCost: 1350,
      count: 3,
      priorityLevel: 'medium'
    },
    'coaching': { 
      sessions: 2, 
      costPerSession: 400, 
      totalCost: 800,
      count: 2,
      priorityLevel: 'low'
    },
    'psychology': { 
      sessions: 2, 
      costPerSession: 800, 
      totalCost: 1600,
      count: 2,
      priorityLevel: 'low'
    },
    'psychiatry': { 
      sessions: 1, 
      costPerSession: 1000, 
      totalCost: 1000,
      count: 1,
      priorityLevel: 'low'
    },
    'family-medicine': { 
      sessions: 1, 
      costPerSession: 550, 
      totalCost: 550,
      count: 1,
      priorityLevel: 'low'
    },
    'pain-management': { 
      sessions: 2, 
      costPerSession: 700, 
      totalCost: 1400,
      count: 2,
      priorityLevel: 'low'
    },
    'podiatrist': { 
      sessions: 1, 
      costPerSession: 550, 
      totalCost: 550,
      count: 1,
      priorityLevel: 'low'
    },
    'general-practitioner': { 
      sessions: 1, 
      costPerSession: 600, 
      totalCost: 600,
      count: 1,
      priorityLevel: 'low'
    },
    'sport-physician': { 
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'orthopedic-surgeon': { 
      sessions: 1, 
      costPerSession: 1200, 
      totalCost: 1200,
      count: 1,
      priorityLevel: 'low'
    },
    'gastroenterology': { 
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'massage-therapy': { 
      sessions: 2, 
      costPerSession: 350, 
      totalCost: 700,
      count: 2,
      priorityLevel: 'low'
    },
    'nutrition-coaching': { 
      sessions: 2, 
      costPerSession: 400, 
      totalCost: 800,
      count: 2,
      priorityLevel: 'low'
    },
    'occupational-therapy': { 
      sessions: 2, 
      costPerSession: 500, 
      totalCost: 1000,
      count: 2,
      priorityLevel: 'low'
    },
    'physical-therapy': { 
      sessions: 3, 
      costPerSession: 550, 
      totalCost: 1650,
      count: 3,
      priorityLevel: 'medium'
    },
    'chiropractor': { 
      sessions: 3, 
      costPerSession: 450, 
      totalCost: 1350,
      count: 3,
      priorityLevel: 'medium'
    },
    'nurse-practitioner': { 
      sessions: 1, 
      costPerSession: 400, 
      totalCost: 400,
      count: 1,
      priorityLevel: 'low'
    },
    'cardiology': { 
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'dermatology': { 
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'neurology': { 
      sessions: 1, 
      costPerSession: 850, 
      totalCost: 850,
      count: 1,
      priorityLevel: 'low'
    },
    'endocrinology': { 
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'urology': { 
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'oncology': { 
      sessions: 1, 
      costPerSession: 1100, 
      totalCost: 1100,
      count: 1,
      priorityLevel: 'low'
    },
    'rheumatology': { 
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'pediatrics': { 
      sessions: 1, 
      costPerSession: 600, 
      totalCost: 600,
      count: 1,
      priorityLevel: 'low'
    },
    'geriatrics': { 
      sessions: 1, 
      costPerSession: 650, 
      totalCost: 650,
      count: 1,
      priorityLevel: 'low'
    },
    'sports-medicine': { 
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'internal-medicine': { 
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'orthopedics': { 
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'neurosurgery': { 
      sessions: 1, 
      costPerSession: 1500, 
      totalCost: 1500,
      count: 1,
      priorityLevel: 'low'
    },
    'infectious-disease': { 
      sessions: 1, 
      costPerSession: 850, 
      totalCost: 850,
      count: 1,
      priorityLevel: 'low'
    },
    'plastic-surgery': { 
      sessions: 1, 
      costPerSession: 1400, 
      totalCost: 1400,
      count: 1,
      priorityLevel: 'low'
    },
    'obstetrics-gynecology': { 
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'emergency-medicine': { 
      sessions: 1, 
      costPerSession: 1000, 
      totalCost: 1000,
      count: 1,
      priorityLevel: 'low'
    },
    'anesthesiology': { 
      sessions: 1, 
      costPerSession: 1100, 
      totalCost: 1100,
      count: 1,
      priorityLevel: 'low'
    },
    'radiology': { 
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'geriatric-medicine': { 
      sessions: 1, 
      costPerSession: 650, 
      totalCost: 650,
      count: 1,
      priorityLevel: 'low'
    },
    'strength-coaching': { 
      sessions: 3, 
      costPerSession: 550, 
      totalCost: 1650,
      count: 3,
      priorityLevel: 'medium'
    },
    'run-coaching': { 
      sessions: 3, 
      costPerSession: 600, 
      totalCost: 1800,
      count: 3,
      priorityLevel: 'medium'
    },
    'all': { 
      sessions: 1, 
      costPerSession: 500, 
      totalCost: 500,
      count: 1,
      priorityLevel: 'low'
    }
  };
}

/**
 * Distributes sessions based on budget and service priorities
 */
export function distributeSessionsByBudget(
  budget: number,
  servicePriorities: { type: ServiceCategory; priority: number }[]
): Record<ServiceCategory, ServiceAllocation> {
  const defaultAllocations = calculateDefaultSessionAllocations();
  const availableServices = servicePriorities.map(sp => sp.type);
  
  let remainingBudget = budget;
  const distributedSessions: Record<ServiceCategory, ServiceAllocation> = {};
  
  // Initialize with zero sessions
  availableServices.forEach(service => {
    distributedSessions[service] = {
      sessions: 0,
      costPerSession: defaultAllocations[service].costPerSession,
      totalCost: 0,
      count: 0,
      priorityLevel: 'low'
    };
  });
  
  // Sort services by priority (highest first)
  const sortedServices = [...servicePriorities].sort((a, b) => b.priority - a.priority);
  
  // Allocate sessions based on priority
  for (const servicePriority of sortedServices) {
    const service = servicePriority.type;
    const defaultAllocation = defaultAllocations[service];
    
    if (!defaultAllocation) {
      console.warn(`No default allocation found for service: ${service}`);
      continue;
    }
    
    const { costPerSession } = defaultAllocation;
    
    // Allocate as many sessions as possible without exceeding the budget
    let affordableSessions = Math.floor(remainingBudget / costPerSession);
    affordableSessions = Math.min(affordableSessions, 5); // Cap at 5 sessions
    
    if (affordableSessions > 0) {
      distributedSessions[service] = {
        sessions: affordableSessions,
        costPerSession: costPerSession,
        totalCost: costPerSession * affordableSessions,
        count: affordableSessions,
        priorityLevel: servicePriority.priority > 0.7 ? 'high' : 
                       servicePriority.priority > 0.4 ? 'medium' : 'low'
      };
      
      remainingBudget -= costPerSession * affordableSessions;
    }
  }
  
  return distributedSessions;
}
