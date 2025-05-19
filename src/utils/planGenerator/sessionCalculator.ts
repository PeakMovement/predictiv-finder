
// Update the SessionAllocation objects to include count and priorityLevel
import { ServiceCategory, ServiceAllocation, BASELINE_COSTS } from './types';

export function calculateDefaultSessionAllocations(): Record<ServiceCategory, ServiceAllocation> {
  return {
    'physiotherapist': { 
      type: 'physiotherapist',
      sessions: 4, 
      costPerSession: 600, 
      totalCost: 2400,
      count: 4,
      priorityLevel: 'high'
    },
    'biokineticist': { 
      type: 'biokineticist',
      sessions: 4, 
      costPerSession: 550, 
      totalCost: 2200,
      count: 4,
      priorityLevel: 'high'
    },
    'dietician': { 
      type: 'dietician',
      sessions: 3, 
      costPerSession: 500, 
      totalCost: 1500,
      count: 3,
      priorityLevel: 'medium'
    },
    'personal-trainer': { 
      type: 'personal-trainer',
      sessions: 3, 
      costPerSession: 450, 
      totalCost: 1350,
      count: 3,
      priorityLevel: 'medium'
    },
    'coaching': { 
      type: 'coaching',
      sessions: 2, 
      costPerSession: 400, 
      totalCost: 800,
      count: 2,
      priorityLevel: 'low'
    },
    'psychology': { 
      type: 'psychology',
      sessions: 2, 
      costPerSession: 800, 
      totalCost: 1600,
      count: 2,
      priorityLevel: 'low'
    },
    'psychiatry': { 
      type: 'psychiatry',
      sessions: 1, 
      costPerSession: 1000, 
      totalCost: 1000,
      count: 1,
      priorityLevel: 'low'
    },
    'family-medicine': { 
      type: 'family-medicine',
      sessions: 1, 
      costPerSession: 550, 
      totalCost: 550,
      count: 1,
      priorityLevel: 'low'
    },
    'pain-management': { 
      type: 'pain-management',
      sessions: 2, 
      costPerSession: 700, 
      totalCost: 1400,
      count: 2,
      priorityLevel: 'low'
    },
    'podiatrist': { 
      type: 'podiatrist',
      sessions: 1, 
      costPerSession: 550, 
      totalCost: 550,
      count: 1,
      priorityLevel: 'low'
    },
    'general-practitioner': { 
      type: 'general-practitioner',
      sessions: 1, 
      costPerSession: 600, 
      totalCost: 600,
      count: 1,
      priorityLevel: 'low'
    },
    'sport-physician': { 
      type: 'sport-physician',
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'orthopedic-surgeon': { 
      type: 'orthopedic-surgeon',
      sessions: 1, 
      costPerSession: 1200, 
      totalCost: 1200,
      count: 1,
      priorityLevel: 'low'
    },
    'gastroenterology': { 
      type: 'gastroenterology',
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'massage-therapy': { 
      type: 'massage-therapy',
      sessions: 2, 
      costPerSession: 350, 
      totalCost: 700,
      count: 2,
      priorityLevel: 'low'
    },
    'nutrition-coaching': { 
      type: 'nutrition-coaching',
      sessions: 2, 
      costPerSession: 400, 
      totalCost: 800,
      count: 2,
      priorityLevel: 'low'
    },
    'occupational-therapy': { 
      type: 'occupational-therapy',
      sessions: 2, 
      costPerSession: 500, 
      totalCost: 1000,
      count: 2,
      priorityLevel: 'low'
    },
    'physical-therapy': { 
      type: 'physical-therapy',
      sessions: 3, 
      costPerSession: 550, 
      totalCost: 1650,
      count: 3,
      priorityLevel: 'medium'
    },
    'chiropractor': { 
      type: 'chiropractor',
      sessions: 3, 
      costPerSession: 450, 
      totalCost: 1350,
      count: 3,
      priorityLevel: 'medium'
    },
    'nurse-practitioner': { 
      type: 'nurse-practitioner',
      sessions: 1, 
      costPerSession: 400, 
      totalCost: 400,
      count: 1,
      priorityLevel: 'low'
    },
    // Add all remaining service categories to complete the record
    'cardiology': { 
      type: 'cardiology',
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'dermatology': { 
      type: 'dermatology',
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'neurology': { 
      type: 'neurology',
      sessions: 1, 
      costPerSession: 850, 
      totalCost: 850,
      count: 1,
      priorityLevel: 'low'
    },
    'endocrinology': { 
      type: 'endocrinology',
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'urology': { 
      type: 'urology',
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'oncology': { 
      type: 'oncology',
      sessions: 1, 
      costPerSession: 1100, 
      totalCost: 1100,
      count: 1,
      priorityLevel: 'low'
    },
    'rheumatology': { 
      type: 'rheumatology',
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'pediatrics': { 
      type: 'pediatrics',
      sessions: 1, 
      costPerSession: 600, 
      totalCost: 600,
      count: 1,
      priorityLevel: 'low'
    },
    'geriatrics': { 
      type: 'geriatrics',
      sessions: 1, 
      costPerSession: 650, 
      totalCost: 650,
      count: 1,
      priorityLevel: 'low'
    },
    'sports-medicine': { 
      type: 'sports-medicine',
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'internal-medicine': { 
      type: 'internal-medicine',
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'orthopedics': { 
      type: 'orthopedics',
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'neurosurgery': { 
      type: 'neurosurgery',
      sessions: 1, 
      costPerSession: 1500, 
      totalCost: 1500,
      count: 1,
      priorityLevel: 'low'
    },
    'infectious-disease': { 
      type: 'infectious-disease',
      sessions: 1, 
      costPerSession: 850, 
      totalCost: 850,
      count: 1,
      priorityLevel: 'low'
    },
    'plastic-surgery': { 
      type: 'plastic-surgery',
      sessions: 1, 
      costPerSession: 1400, 
      totalCost: 1400,
      count: 1,
      priorityLevel: 'low'
    },
    'obstetrics-gynecology': { 
      type: 'obstetrics-gynecology',
      sessions: 1, 
      costPerSession: 750, 
      totalCost: 750,
      count: 1,
      priorityLevel: 'low'
    },
    'emergency-medicine': { 
      type: 'emergency-medicine',
      sessions: 1, 
      costPerSession: 1000, 
      totalCost: 1000,
      count: 1,
      priorityLevel: 'low'
    },
    'anesthesiology': { 
      type: 'anesthesiology',
      sessions: 1, 
      costPerSession: 1100, 
      totalCost: 1100,
      count: 1,
      priorityLevel: 'low'
    },
    'radiology': { 
      type: 'radiology',
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'geriatric-medicine': { 
      type: 'geriatric-medicine',
      sessions: 1, 
      costPerSession: 650, 
      totalCost: 650,
      count: 1,
      priorityLevel: 'low'
    },
    'strength-coaching': { 
      type: 'strength-coaching',
      sessions: 3, 
      costPerSession: 550, 
      totalCost: 1650,
      count: 3,
      priorityLevel: 'medium'
    },
    'run-coaching': { 
      type: 'run-coaching',
      sessions: 3, 
      costPerSession: 600, 
      totalCost: 1800,
      count: 3,
      priorityLevel: 'medium'
    },
    'gynecology': { 
      type: 'gynecology',
      sessions: 1, 
      costPerSession: 800, 
      totalCost: 800,
      count: 1,
      priorityLevel: 'low'
    },
    'ophthalmology': { 
      type: 'ophthalmology',
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
      count: 1,
      priorityLevel: 'low'
    },
    'speech-therapy': { 
      type: 'speech-therapy',
      sessions: 3, 
      costPerSession: 600, 
      totalCost: 1800,
      count: 3,
      priorityLevel: 'medium'
    },
    'audiology': { 
      type: 'audiology',
      sessions: 1, 
      costPerSession: 500, 
      totalCost: 500,
      count: 1,
      priorityLevel: 'low'
    },
    'acupuncture': { 
      type: 'acupuncture',
      sessions: 3, 
      costPerSession: 450, 
      totalCost: 1350,
      count: 3,
      priorityLevel: 'low'
    },
    'yoga-instructor': { 
      type: 'yoga-instructor',
      sessions: 4, 
      costPerSession: 300, 
      totalCost: 1200,
      count: 4,
      priorityLevel: 'low'
    },
    'pilates-instructor': { 
      type: 'pilates-instructor',
      sessions: 4, 
      costPerSession: 350, 
      totalCost: 1400,
      count: 4,
      priorityLevel: 'low'
    },
    'tai-chi-instructor': { 
      type: 'tai-chi-instructor',
      sessions: 4, 
      costPerSession: 300, 
      totalCost: 1200,
      count: 4,
      priorityLevel: 'low'
    },
    'naturopathy': { 
      type: 'naturopathy',
      sessions: 2, 
      costPerSession: 400, 
      totalCost: 800,
      count: 2,
      priorityLevel: 'low'
    },
    'homeopathy': { 
      type: 'homeopathy',
      sessions: 2, 
      costPerSession: 350, 
      totalCost: 700,
      count: 2,
      priorityLevel: 'low'
    },
    'osteopathy': { 
      type: 'osteopathy',
      sessions: 2, 
      costPerSession: 500, 
      totalCost: 1000,
      count: 2,
      priorityLevel: 'low'
    },
    'pharmacy': { 
      type: 'pharmacy',
      sessions: 1, 
      costPerSession: 250, 
      totalCost: 250,
      count: 1,
      priorityLevel: 'low'
    },
    'medical-specialist': { 
      type: 'medical-specialist',
      sessions: 1, 
      costPerSession: 900, 
      totalCost: 900,
      count: 1,
      priorityLevel: 'low'
    },
    'all': { 
      type: 'all',
      sessions: 1, 
      costPerSession: 700, 
      totalCost: 700,
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
      type: service,
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
        type: service,
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
