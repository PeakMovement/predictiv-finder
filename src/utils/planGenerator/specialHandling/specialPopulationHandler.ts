
import { ServiceCategory, SpecialPopulation } from "../types";

// Define SPECIAL_POPULATIONS constant
export const SPECIAL_POPULATIONS: Record<string, SpecialPopulation> = {
  'child': {
    type: 'child',
    ageRange: [0, 12],
    recommendedServices: ['pediatrics', 'family-medicine', 'dietician'],
    contraindicatedServices: ['personal-trainer', 'chiropractor'],
    specializedProviders: ['pediatrics']
  },
  'teen': {
    type: 'child',
    ageRange: [13, 18],
    recommendedServices: ['pediatrics', 'sports-medicine', 'psychology', 'dietician'],
    contraindicatedServices: [],
    specializedProviders: ['sports-medicine', 'pediatrics']
  },
  'elderly': {
    type: 'elderly',
    ageRange: [65, 120],
    recommendedServices: ['geriatrics', 'physical-therapy', 'pain-management', 'geriatric-medicine'],
    contraindicatedServices: ['personal-trainer', 'chiropractor'],
    specializedProviders: ['geriatric-medicine', 'geriatrics']
  },
  'athlete': {
    type: 'athlete',
    recommendedServices: ['sports-medicine', 'physiotherapist', 'biokineticist', 'dietician', 'personal-trainer'],
    contraindicatedServices: [],
    specializedProviders: ['sports-medicine', 'sport-physician']
  },
  'pregnant': {
    type: 'pregnant',
    recommendedServices: ['obstetrics-gynecology', 'dietician', 'physiotherapist'],
    contraindicatedServices: ['chiropractor', 'personal-trainer'],
    specializedProviders: ['obstetrics-gynecology']
  }
};

/**
 * Determines appropriate service recommendations for special populations
 */
export function getSpecialPopulationServices(
  populationType: string,
  budget: number,
  goal?: string
): {
  recommended: ServiceCategory[];
  contraindicated: ServiceCategory[];
  specialMessage?: string;
} {
  // Default empty response
  const defaultResponse = {
    recommended: [] as ServiceCategory[],
    contraindicated: [] as ServiceCategory[],
  };
  
  // If no population type provided or not in our special populations list
  if (!populationType || !SPECIAL_POPULATIONS[populationType]) {
    return defaultResponse;
  }
  
  const populationData = SPECIAL_POPULATIONS[populationType];
  
  // Add goal-specific services
  let additionalServices: ServiceCategory[] = [];
  if (goal) {
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('weight') || goalLower.includes('nutrition')) {
      additionalServices.push('dietician');
    }
    
    if (goalLower.includes('pain') || goalLower.includes('injury')) {
      additionalServices.push('physiotherapist');
      additionalServices.push('pain-management');
    }
    
    if (goalLower.includes('stress') || goalLower.includes('anxiety')) {
      additionalServices.push('psychology');
      additionalServices.push('coaching');
    }
  }
  
  // Combine recommended services and remove duplicates
  const allRecommended = [
    ...populationData.recommendedServices,
    ...additionalServices
  ].filter((value, index, self) => self.indexOf(value) === index) as ServiceCategory[];

  // Special handling for budget constraints
  let finalRecommended = [...allRecommended];
  let specialMessage: string | undefined = undefined;
  
  // For very low budgets, prioritize the most important services
  if (budget && budget < 1000) {
    finalRecommended = finalRecommended.slice(0, 2);
    specialMessage = `Budget constrained plan focused on essential services for ${populationType}s.`;
  }
  
  return {
    recommended: finalRecommended,
    contraindicated: (populationData.contraindicatedServices || []) as ServiceCategory[],
    ...(specialMessage ? { specialMessage } : {})
  };
}
