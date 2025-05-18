
import { BudgetAllocation, BudgetAlternative, BudgetConstraint, ProfessionalRecommendation, ServiceCategory, ServicePricing } from './types';

/**
 * Standard pricing for different service categories
 * These represent typical market rates for various professional services
 */
export const standardServicePricing: Record<ServiceCategory, ServicePricing> = {
  'physiotherapist': {
    category: 'physiotherapist',
    basePrice: 800,
    priceRange: { min: 650, max: 1200 }
  },
  'biokineticist': {
    category: 'biokineticist',
    basePrice: 750,
    priceRange: { min: 600, max: 900 }
  },
  'dietician': {
    category: 'dietician',
    basePrice: 700,
    priceRange: { min: 550, max: 950 }
  },
  'personal-trainer': {
    category: 'personal-trainer',
    basePrice: 600,
    priceRange: { min: 400, max: 1000 }
  },
  'pain-management': {
    category: 'pain-management',
    basePrice: 1200,
    priceRange: { min: 900, max: 1800 }
  },
  'psychology': {
    category: 'psychology',
    basePrice: 1100,
    priceRange: { min: 900, max: 1500 }
  },
  'psychiatry': {
    category: 'psychiatry',
    basePrice: 1500,
    priceRange: { min: 1200, max: 2500 }
  },
  'coaching': {
    category: 'coaching',
    basePrice: 750,
    priceRange: { min: 600, max: 1200 }
  },
  'general-practitioner': {
    category: 'general-practitioner',
    basePrice: 850,
    priceRange: { min: 700, max: 1200 }
  },
  'podiatrist': {
    category: 'podiatrist',
    basePrice: 900,
    priceRange: { min: 750, max: 1200 }
  },
  'family-medicine': {
    category: 'family-medicine',
    basePrice: 900,
    priceRange: { min: 800, max: 1300 }
  },
  'sport-physician': {
    category: 'sport-physician',
    basePrice: 1200,
    priceRange: { min: 1000, max: 1800 }
  },
  'orthopedic-surgeon': {
    category: 'orthopedic-surgeon',
    basePrice: 2500,
    priceRange: { min: 2000, max: 3500 }
  },
  // Expanded service categories
  'gastroenterology': {
    category: 'gastroenterology',
    basePrice: 1800,
    priceRange: { min: 1500, max: 2200 }
  },
  'massage-therapy': {
    category: 'massage-therapy',
    basePrice: 600,
    priceRange: { min: 450, max: 950 }
  },
  'nutrition-coach': {
    category: 'nutrition-coach',
    basePrice: 550,
    priceRange: { min: 400, max: 750 }
  },
  'occupational-therapy': {
    category: 'occupational-therapy',
    basePrice: 750,
    priceRange: { min: 650, max: 950 }
  },
  'physical-therapy': {
    category: 'physical-therapy',
    basePrice: 800,
    priceRange: { min: 650, max: 1100 }
  },
  'chiropractor': {
    category: 'chiropractor',
    basePrice: 700,
    priceRange: { min: 550, max: 950 }
  },
  'nurse-practitioner': {
    category: 'nurse-practitioner',
    basePrice: 650,
    priceRange: { min: 500, max: 850 }
  },
  'cardiology': {
    category: 'cardiology',
    basePrice: 2000,
    priceRange: { min: 1700, max: 2800 }
  },
  'dermatology': {
    category: 'dermatology',
    basePrice: 1500,
    priceRange: { min: 1200, max: 2200 }
  },
  'neurology': {
    category: 'neurology',
    basePrice: 2100,
    priceRange: { min: 1800, max: 3000 }
  },
  'endocrinology': {
    category: 'endocrinology',
    basePrice: 1800,
    priceRange: { min: 1500, max: 2400 }
  },
  'urology': {
    category: 'urology',
    basePrice: 1700,
    priceRange: { min: 1400, max: 2300 }
  },
  'oncology': {
    category: 'oncology',
    basePrice: 2200,
    priceRange: { min: 1900, max: 3200 }
  },
  'rheumatology': {
    category: 'rheumatology',
    basePrice: 1800,
    priceRange: { min: 1500, max: 2400 }
  },
  'pediatrics': {
    category: 'pediatrics',
    basePrice: 900,
    priceRange: { min: 750, max: 1300 }
  },
  'geriatrics': {
    category: 'geriatrics',
    basePrice: 1100,
    priceRange: { min: 900, max: 1500 }
  },
  'sports-medicine': {
    category: 'sports-medicine',
    basePrice: 1200,
    priceRange: { min: 1000, max: 1700 }
  },
  'internal-medicine': {
    category: 'internal-medicine',
    basePrice: 1400,
    priceRange: { min: 1200, max: 1900 }
  },
  'orthopedics': {
    category: 'orthopedics',
    basePrice: 1500,
    priceRange: { min: 1300, max: 2100 }
  },
  'neurosurgery': {
    category: 'neurosurgery',
    basePrice: 3000,
    priceRange: { min: 2500, max: 5000 }
  },
  'infectious-disease': {
    category: 'infectious-disease',
    basePrice: 1600,
    priceRange: { min: 1300, max: 2200 }
  },
  'plastic-surgery': {
    category: 'plastic-surgery',
    basePrice: 2500,
    priceRange: { min: 2000, max: 4000 }
  },
  'obstetrics-gynecology': {
    category: 'obstetrics-gynecology',
    basePrice: 1400,
    priceRange: { min: 1100, max: 1900 }
  },
  'emergency-medicine': {
    category: 'emergency-medicine',
    basePrice: 1800,
    priceRange: { min: 1500, max: 2500 }
  },
  'anesthesiology': {
    category: 'anesthesiology',
    basePrice: 2000,
    priceRange: { min: 1600, max: 2800 }
  },
  'radiology': {
    category: 'radiology',
    basePrice: 1800,
    priceRange: { min: 1400, max: 2600 }
  },
  'geriatric-medicine': {
    category: 'geriatric-medicine',
    basePrice: 1300,
    priceRange: { min: 1100, max: 1800 }
  },
  'all': {
    category: 'all',
    basePrice: 1000, 
    priceRange: { min: 600, max: 2000 }
  }
};

/**
 * Budget-friendly alternatives to expensive professional services
 */
export const budgetAlternatives: Record<string, BudgetAlternative> = {
  "psychiatry": {
    originalService: "psychiatry",
    alternatives: ["psychology", "coaching"],
    costReduction: 0.35
  },
  "orthopedic-surgeon": {
    originalService: "orthopedic-surgeon",
    alternatives: ["physiotherapist", "orthopedics"],
    costReduction: 0.50
  }
};

/**
 * Calculate budget allocation based on professional recommendations and budget constraints
 */
export function allocateBudget(
  recommendations: ProfessionalRecommendation[],
  budget?: BudgetConstraint
): BudgetAllocation {
  // Default response if no budget constraint
  if (!budget) {
    const totalCost = recommendations.reduce(
      (sum, rec) => sum + (standardServicePricing[rec.category].basePrice * rec.sessions),
      0
    );
    
    // Create default breakdown with full price for each service
    const breakdown = recommendations.reduce((result, rec) => {
      result[rec.category] = standardServicePricing[rec.category].basePrice * rec.sessions;
      return result;
    }, {} as Record<ServiceCategory, number>);
    
    return { total: totalCost, breakdown };
  }
  
  // Calculate total cost of all recommendations at standard pricing
  const standardTotalCost = recommendations.reduce(
    (sum, rec) => sum + (standardServicePricing[rec.category].basePrice * rec.sessions),
    0
  );
  
  // If budget is sufficient for standard pricing, use that
  if (budget.total >= standardTotalCost) {
    const breakdown = recommendations.reduce((result, rec) => {
      result[rec.category] = standardServicePricing[rec.category].basePrice * rec.sessions;
      return result;
    }, {} as Record<ServiceCategory, number>);
    
    return { total: standardTotalCost, breakdown };
  }
  
  // Budget optimization needed
  // Sort recommendations by priority
  const sortedRecs = [...recommendations].sort((a, b) => {
    // Priority comparisons first
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    if (a.priority === 'medium' && b.priority === 'low') return -1;
    if (a.priority === 'low' && b.priority === 'medium') return 1;
    
    // Then by cost if priorities are equal
    return (
      standardServicePricing[a.category].basePrice - 
      standardServicePricing[b.category].basePrice
    );
  });
  
  // Start with minimum viable allocation
  let remainingBudget = budget.total;
  const breakdown = {} as Record<ServiceCategory, number>;
  
  // First pass: ensure at least one session for high priority services
  for (const rec of sortedRecs.filter(r => r.priority === 'high')) {
    const minCost = Math.min(
      standardServicePricing[rec.category].priceRange.min,
      standardServicePricing[rec.category].basePrice * 0.8
    );
    
    if (remainingBudget >= minCost) {
      breakdown[rec.category] = minCost;
      remainingBudget -= minCost;
    }
  }
  
  // Second pass: distribute remaining budget proportionally to priorities and remaining sessions
  for (const rec of sortedRecs) {
    if (!breakdown[rec.category]) {
      breakdown[rec.category] = 0;
    }
    
    const priorityFactor = rec.priority === 'high' ? 3 : rec.priority === 'medium' ? 2 : 1;
    const remainingSessions = rec.sessions - (breakdown[rec.category] > 0 ? 1 : 0);
    
    if (remainingSessions > 0) {
      const availableForService = remainingBudget * (priorityFactor / sortedRecs.reduce(
        (sum, r) => sum + (r.priority === 'high' ? 3 : r.priority === 'medium' ? 2 : 1),
        0
      ));
      
      const sessionCost = Math.min(
        standardServicePricing[rec.category].priceRange.min,
        availableForService / remainingSessions
      );
      
      const additionalCost = sessionCost * remainingSessions;
      
      if (remainingBudget >= additionalCost && additionalCost > 0) {
        breakdown[rec.category] += additionalCost;
        remainingBudget -= additionalCost;
      }
    }
  }
  
  // Calculate the actual total spent
  const total = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0);
  
  return { total, breakdown };
}
