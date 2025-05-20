
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

export interface ComorbidityConfig {
  primaryCondition: string;
  secondaryCondition: string;
  recommendedServices: ServiceCategory[];
  specialConsiderations?: string[];
}

export interface Treatment {
  serviceType: ServiceCategory;
  sessionsPerWeek: number;
  duration: number; // in weeks
  notes: string;
}

export interface TreatmentPlan {
  primaryCondition: string;
  secondaryConditions: string[];
  treatments: Treatment[];
  totalDuration: number;
  estimatedCost: number;
}

// Helper constants
const BASE_COST_MAP = createServiceCategoryRecord(0);

// Fill in specific costs for common services
BASE_COST_MAP['physiotherapist'] = 600;
BASE_COST_MAP['dietician'] = 500;
BASE_COST_MAP['personal-trainer'] = 400;
BASE_COST_MAP['psychology'] = 800;
BASE_COST_MAP['cardiology'] = 1000;
BASE_COST_MAP['endocrinology'] = 800;
BASE_COST_MAP['general-practitioner'] = 500;
BASE_COST_MAP['nutrition-coaching'] = 400;

// Generate a treatment plan that considers comorbidities
export function generateComorbidityAwarePlan(
  primaryCondition: string,
  secondaryConditions: string[],
  budget: number,
  timeframe: number = 8 // weeks
): TreatmentPlan {
  // Initialize plan
  const treatments: Treatment[] = [];
  let estimatedCost = 0;
  
  // Determine primary recommended service
  const primaryService = determinePrimaryService(primaryCondition);
  
  // Start with primary service
  const primaryTreatment: Treatment = {
    serviceType: primaryService,
    sessionsPerWeek: 1,
    duration: timeframe,
    notes: `Treatment for ${primaryCondition}`
  };
  
  treatments.push(primaryTreatment);
  estimatedCost += calculateTreatmentCost(primaryTreatment);
  
  // Add services for comorbidities
  const remainingBudget = budget - estimatedCost;
  const comorbidityServices = determineComorbidityServices(
    primaryCondition, 
    secondaryConditions
  );
  
  // Allocate remaining budget to comorbidity services
  if (remainingBudget > 0 && comorbidityServices.length > 0) {
    const budgetPerService = remainingBudget / comorbidityServices.length;
    
    comorbidityServices.forEach(service => {
      // Only add if we can afford at least 2 sessions
      const costPerSession = BASE_COST_MAP[service];
      const affordableSessions = Math.floor(budgetPerService / costPerSession);
      
      if (affordableSessions >= 2) {
        const sessionsPerWeek = 1;
        const duration = Math.min(timeframe, Math.floor(affordableSessions / sessionsPerWeek));
        
        const treatment: Treatment = {
          serviceType: service,
          sessionsPerWeek,
          duration,
          notes: `Additional service for ${secondaryConditions.join(', ')}`
        };
        
        treatments.push(treatment);
        estimatedCost += calculateTreatmentCost(treatment);
      }
    });
  }
  
  return {
    primaryCondition,
    secondaryConditions,
    treatments,
    totalDuration: timeframe,
    estimatedCost
  };
}

// Helper function to determine primary service based on condition
function determinePrimaryService(condition: string): ServiceCategory {
  const condition_lower = condition.toLowerCase();
  
  if (condition_lower.includes('heart') || condition_lower.includes('cardio')) {
    return 'cardiology';
  } else if (condition_lower.includes('diabetes') || condition_lower.includes('thyroid')) {
    return 'endocrinology';
  } else if (condition_lower.includes('diet') || condition_lower.includes('nutrition')) {
    return 'dietician';
  } else if (condition_lower.includes('fitness') || condition_lower.includes('strength')) {
    return 'personal-trainer';
  } else if (condition_lower.includes('mental') || condition_lower.includes('stress')) {
    return 'psychology';
  } else if (condition_lower.includes('pain') || condition_lower.includes('injury')) {
    return 'physiotherapist';
  } else {
    return 'general-practitioner';
  }
}

// Helper to determine additional services for comorbidities
function determineComorbidityServices(
  primaryCondition: string, 
  secondaryConditions: string[]
): ServiceCategory[] {
  // Define common comorbidity mappings
  const comorbidityMap: Record<string, Record<string, ServiceCategory[]>> = {
    'diabetes': {
      'hypertension': ['cardiology', 'dietician'],
      'obesity': ['dietician', 'personal-trainer'],
      'depression': ['psychology'],
      'chronic kidney disease': ['nephrology']
    },
    'hypertension': {
      'diabetes': ['endocrinology', 'dietician'],
      'high cholesterol': ['dietician', 'cardiology'],
      'stroke risk': ['neurology', 'cardiology']
    },
    'back pain': {
      'depression': ['psychology', 'physiotherapist'],
      'obesity': ['dietician', 'personal-trainer'],
      'arthritis': ['rheumatology', 'physiotherapist']
    }
  };
  
  const primaryLower = primaryCondition.toLowerCase();
  let recommendedServices: ServiceCategory[] = [];
  
  secondaryConditions.forEach(condition => {
    const conditionLower = condition.toLowerCase();
    
    // Check if we have a mapping for this comorbidity pair
    if (comorbidityMap[primaryLower] && comorbidityMap[primaryLower][conditionLower]) {
      recommendedServices = [
        ...recommendedServices,
        ...comorbidityMap[primaryLower][conditionLower]
      ];
    } else {
      // Default handling based on secondary condition
      const defaultService = determinePrimaryService(conditionLower);
      if (!recommendedServices.includes(defaultService)) {
        recommendedServices.push(defaultService);
      }
    }
  });
  
  // De-duplicate services
  return Array.from(new Set(recommendedServices));
}

// Calculate the cost of a treatment
function calculateTreatmentCost(treatment: Treatment): number {
  const costPerSession = BASE_COST_MAP[treatment.serviceType];
  const totalSessions = treatment.sessionsPerWeek * treatment.duration;
  return costPerSession * totalSessions;
}

