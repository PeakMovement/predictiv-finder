
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Base prices for each service category per session
 * These are conservative estimates and can be adjusted
 */
const BASELINE_COSTS: Record<ServiceCategory, number> = createServiceCategoryRecord(0);

// Set baseline costs for each service
BASELINE_COSTS.physiotherapist = 750;
BASELINE_COSTS.biokineticist = 700;
BASELINE_COSTS.dietician = 650;
BASELINE_COSTS['personal-trainer'] = 500;
BASELINE_COSTS.coaching = 600;
BASELINE_COSTS.psychology = 900;
BASELINE_COSTS.psychiatry = 1500;
BASELINE_COSTS['family-medicine'] = 800;
BASELINE_COSTS['pain-management'] = 1200;
BASELINE_COSTS.podiatrist = 750;
BASELINE_COSTS['general-practitioner'] = 600;
BASELINE_COSTS['sport-physician'] = 1200;
BASELINE_COSTS['orthopedic-surgeon'] = 2000;
BASELINE_COSTS.gastroenterology = 1500;
BASELINE_COSTS['massage-therapy'] = 600;
BASELINE_COSTS['nutrition-coaching'] = 500;
BASELINE_COSTS['occupational-therapy'] = 800;
BASELINE_COSTS['physical-therapy'] = 750;
BASELINE_COSTS.chiropractor = 700;
BASELINE_COSTS['nurse-practitioner'] = 500;
BASELINE_COSTS.cardiology = 1500;
BASELINE_COSTS.dermatology = 1200;
BASELINE_COSTS.neurology = 1800;
BASELINE_COSTS.endocrinology = 1400;
BASELINE_COSTS.urology = 1300;
BASELINE_COSTS.oncology = 2000;
BASELINE_COSTS.rheumatology = 1500;
BASELINE_COSTS.pediatrics = 800;
BASELINE_COSTS.geriatrics = 900;
BASELINE_COSTS['sports-medicine'] = 1100;
BASELINE_COSTS['internal-medicine'] = 1200;
BASELINE_COSTS.orthopedics = 1400;
BASELINE_COSTS.neurosurgery = 3000;
BASELINE_COSTS['infectious-disease'] = 1500;
BASELINE_COSTS['plastic-surgery'] = 2500;
BASELINE_COSTS['obstetrics-gynecology'] = 1200;
BASELINE_COSTS['emergency-medicine'] = 1500;
BASELINE_COSTS.anesthesiology = 1800;
BASELINE_COSTS.radiology = 1300;
BASELINE_COSTS['geriatric-medicine'] = 900;
BASELINE_COSTS.all = 1000; // Generic fallback

/**
 * Calculate the budget required for a service category
 * @param category The service category
 * @param sessions Number of sessions
 * @returns Total budget required
 */
export function calculateBudget(category: ServiceCategory, sessions: number = 1): number {
  const costPerSession = BASELINE_COSTS[category] || 1000; // Default to 1000 if not found
  return costPerSession * sessions;
}

/**
 * Calculate ideal number of sessions based on service type and condition severity
 * @param category The service category
 * @param severity Condition severity (0 to 1)
 * @returns Recommended number of sessions
 */
export function calculateIdealSessions(category: ServiceCategory, severity: number = 0.5): number {
  // Base sessions by category
  let baseSessions = 4; // Default
  
  // Adjust based on service type
  switch (category) {
    case 'physiotherapist':
    case 'biokineticist':
    case 'personal-trainer':
      baseSessions = 6; // These often require more sessions
      break;
    case 'psychiatry':
    case 'orthopedic-surgeon':
    case 'neurosurgery':
      baseSessions = 2; // These often require fewer, more intensive sessions
      break;
    case 'dietician':
    case 'coaching':
    case 'psychology':
      baseSessions = 4; // Standard frequency
      break;
    default:
      baseSessions = 3;
  }
  
  // Adjust for severity
  if (severity < 0.3) {
    return Math.max(1, Math.floor(baseSessions * 0.7)); // Lower severity needs fewer sessions
  } else if (severity > 0.7) {
    return Math.ceil(baseSessions * 1.5); // Higher severity needs more sessions
  }
  
  return baseSessions;
}

/**
 * Find affordable alternatives for expensive services
 * @param originalCategory The original service category
 * @param budget Available budget
 * @param requiredSessions Number of sessions needed
 * @returns Array of affordable alternatives
 */
export function findAffordableAlternatives(
  originalCategory: ServiceCategory,
  budget: number,
  requiredSessions: number = 4
): { category: ServiceCategory; reasoning: string; savings: number }[] {
  const originalCost = BASELINE_COSTS[originalCategory] * requiredSessions;
  
  // If within budget, no alternatives needed
  if (originalCost <= budget) {
    return [];
  }
  
  // Define alternative mappings (more affordable alternatives)
  const alternativeMappings: Record<string, { alternatives: ServiceCategory[], reasoning: string }> = {
    'psychiatry': {
      alternatives: ['psychology', 'coaching'],
      reasoning: 'Can provide support for mild to moderate mental health issues'
    },
    'orthopedic-surgeon': {
      alternatives: ['physiotherapist', 'biokineticist'],
      reasoning: 'Can help with musculoskeletal issues that don't require surgery'
    },
    'neurosurgery': {
      alternatives: ['neurology', 'pain-management'],
      reasoning: 'Can help manage symptoms for conditions that don't require immediate surgery'
    },
    'plastic-surgery': {
      alternatives: ['dermatology'],
      reasoning: 'Can address some skin concerns non-surgically'
    },
    'cardiology': {
      alternatives: ['general-practitioner', 'internal-medicine'],
      reasoning: 'Can handle initial assessment and mild cardiac conditions'
    },
    'sport-physician': {
      alternatives: ['physiotherapist', 'biokineticist'],
      reasoning: 'Can address many sports-related issues at lower cost'
    },
    'gastroenterology': {
      alternatives: ['dietician', 'general-practitioner'],
      reasoning: 'Can help with diet-related digestive issues'
    }
  };
  
  const alternatives: { category: ServiceCategory; reasoning: string; savings: number }[] = [];
  
  // Check if we have alternatives for this category
  const mapping = alternativeMappings[originalCategory];
  if (mapping) {
    mapping.alternatives.forEach(altCategory => {
      const altCost = BASELINE_COSTS[altCategory] * requiredSessions;
      const savings = originalCost - altCost;
      
      if (altCost <= budget && savings > 0) {
        alternatives.push({
          category: altCategory,
          reasoning: mapping.reasoning,
          savings
        });
      }
    });
  }
  
  // Sort by cost (lowest first)
  return alternatives.sort((a, b) => 
    (BASELINE_COSTS[a.category] - BASELINE_COSTS[b.category])
  );
}

/**
 * Optimize a plan to fit within budget constraints
 * @param recommendations Array of service recommendations
 * @param budget Total available budget
 * @returns Optimized recommendations and budget allocation
 */
export function optimizePlanForBudget(
  recommendations: Array<{
    category: ServiceCategory;
    sessions: number;
    priority: 'high' | 'medium' | 'low';
  }>,
  budget: number
): {
  optimizedRecommendations: Array<{
    category: ServiceCategory;
    sessions: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  budgetAllocation: Record<ServiceCategory, number>;
  totalCost: number;
  notes: string[];
} {
  const notes: string[] = [];
  let remainingBudget = budget;
  
  // Calculate initial cost
  let totalInitialCost = 0;
  recommendations.forEach(rec => {
    totalInitialCost += calculateBudget(rec.category, rec.sessions);
  });
  
  // If we're already within budget, return as is
  if (totalInitialCost <= budget) {
    const budgetAllocation: Record<ServiceCategory, number> = {};
    recommendations.forEach(rec => {
      budgetAllocation[rec.category] = calculateBudget(rec.category, rec.sessions);
    });
    
    return {
      optimizedRecommendations: recommendations,
      budgetAllocation,
      totalCost: totalInitialCost,
      notes: ['Plan is within budget constraints.']
    };
  }
  
  // We need to optimize
  notes.push(`Original plan cost R${totalInitialCost} exceeds budget of R${budget}. Optimizing plan.`);
  
  // Sort by priority (high to low)
  const sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const optimizedRecs: typeof recommendations = [];
  const budgetAllocation: Record<ServiceCategory, number> = {};
  
  // First pass: Include high priority with potentially reduced sessions
  sortedRecs.filter(rec => rec.priority === 'high').forEach(rec => {
    let sessions = rec.sessions;
    let cost = calculateBudget(rec.category, sessions);
    
    // If too expensive, reduce sessions
    while (cost > remainingBudget && sessions > 1) {
      sessions--;
      cost = calculateBudget(rec.category, sessions);
    }
    
    if (cost <= remainingBudget) {
      // We can afford this (possibly with reduced sessions)
      optimizedRecs.push({
        ...rec,
        sessions
      });
      
      budgetAllocation[rec.category] = cost;
      remainingBudget -= cost;
      
      if (sessions < rec.sessions) {
        notes.push(`Reduced ${rec.category} from ${rec.sessions} to ${sessions} sessions to fit budget.`);
      }
    } else {
      // Can't afford even 1 session, look for alternatives
      const alternatives = findAffordableAlternatives(rec.category, remainingBudget, 2);
      
      if (alternatives.length > 0) {
        const alt = alternatives[0];
        const altSessions = 2; // Start with minimum meaningful number
        const altCost = calculateBudget(alt.category, altSessions);
        
        optimizedRecs.push({
          category: alt.category,
          sessions: altSessions,
          priority: rec.priority
        });
        
        budgetAllocation[alt.category] = altCost;
        remainingBudget -= altCost;
        
        notes.push(`Substituted ${rec.category} with more affordable ${alt.category} (${alt.reasoning}).`);
      } else {
        notes.push(`Could not include ${rec.category} due to budget constraints.`);
      }
    }
  });
  
  // Second pass: Include medium and low priority if budget allows
  sortedRecs.filter(rec => rec.priority !== 'high').forEach(rec => {
    let sessions = rec.sessions;
    let cost = calculateBudget(rec.category, sessions);
    
    // If too expensive, reduce sessions
    while (cost > remainingBudget && sessions > 1) {
      sessions--;
      cost = calculateBudget(rec.category, sessions);
    }
    
    if (cost <= remainingBudget) {
      // We can afford this (possibly with reduced sessions)
      optimizedRecs.push({
        ...rec,
        sessions
      });
      
      budgetAllocation[rec.category] = cost;
      remainingBudget -= cost;
      
      if (sessions < rec.sessions) {
        notes.push(`Reduced ${rec.category} from ${rec.sessions} to ${sessions} sessions to fit budget.`);
      }
    } 
    // For non-high priority, we silently skip if unaffordable
  });
  
  // Third pass: If we have remaining budget and fewer than 3 services, add complementary options
  if (remainingBudget > BASELINE_COSTS.dietician && optimizedRecs.length < 3) {
    // Affordable complementary services
    const affordableServices = ['coaching', 'dietician', 'personal-trainer']
      .filter(service => {
        // Skip services we already included
        const serviceCategory = service as ServiceCategory;
        return !optimizedRecs.some(rec => rec.category === serviceCategory);
      })
      .map(service => service as ServiceCategory);
    
    if (affordableServices.length > 0) {
      const complementaryService = affordableServices[0];
      const sessions = Math.floor(remainingBudget / BASELINE_COSTS[complementaryService]);
      
      if (sessions > 0) {
        const cost = calculateBudget(complementaryService, sessions);
        
        optimizedRecs.push({
          category: complementaryService,
          sessions,
          priority: 'low'
        });
        
        budgetAllocation[complementaryService] = cost;
        remainingBudget -= cost;
        
        notes.push(`Added complementary ${complementaryService} service (${sessions} sessions) with remaining budget.`);
      }
    }
  }
  
  // Calculate total cost
  const totalCost = budget - remainingBudget;
  
  return {
    optimizedRecommendations: optimizedRecs,
    budgetAllocation,
    totalCost,
    notes
  };
}
