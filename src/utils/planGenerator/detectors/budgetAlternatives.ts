
import { ServiceCategory, BASELINE_COSTS } from '../types';
import { createServiceCategoryRecord } from '../helpers/serviceRecordInitializer';

/**
 * Find alternative service providers that are more affordable
 * for similar health outcomes
 */
export function findAffordableAlternatives(
  originalService: ServiceCategory,
  budget: number
): ServiceCategory[] {
  // Map of services that can substitute for more expensive ones
  const alternativeMap: Record<ServiceCategory, ServiceCategory[]> = {
    'psychiatry': ['psychology', 'coaching'],
    'orthopedic-surgeon': ['physiotherapist', 'orthopedics'],
    'neurosurgery': ['pain-management', 'neurology'],
    'cardiology': ['general-practitioner', 'internal-medicine'],
    'gastroenterology': ['dietician', 'general-practitioner'],
    'dermatology': ['general-practitioner'],
    'endocrinology': ['dietician', 'general-practitioner']
  };
  
  // Create a more complete map using our helper
  const fullAlternativeMap = createServiceCategoryRecord([] as ServiceCategory[]);
  
  // Fill in the known alternatives
  Object.entries(alternativeMap).forEach(([service, alternatives]) => {
    fullAlternativeMap[service as ServiceCategory] = alternatives;
  });
  
  // If this service has alternatives and its cost exceeds budget
  if (fullAlternativeMap[originalService].length > 0 && 
      (BASELINE_COSTS[originalService] || 0) > budget) {
    
    // Return alternatives that fit within budget
    return fullAlternativeMap[originalService].filter(
      alt => (BASELINE_COSTS[alt] || 0) <= budget
    );
  }
  
  return []; // No suitable alternatives found
}

/**
 * Suggests budget alternatives when client's budget is too low
 * @param services List of desired services
 * @param budget Client's budget
 * @returns Alternative service suggestions and explanations
 */
export function suggestBudgetAlternatives(
  services: ServiceCategory[],
  budget: number
): {
  alternatives: ServiceCategory[];
  explanations: string[];
  originalCost: number;
  alternativeCost: number;
} {
  // Calculate original cost
  const originalCost = services.reduce((total, service) => 
    total + (BASELINE_COSTS[service] || 500), 0);
  
  // If budget is sufficient, no need for alternatives
  if (budget >= originalCost) {
    return {
      alternatives: [...services],
      explanations: ["Your budget is sufficient for the recommended services."],
      originalCost,
      alternativeCost: originalCost
    };
  }
  
  const alternatives: ServiceCategory[] = [];
  const explanations: string[] = [];
  let remainingBudget = budget;
  
  // Sort services by cost (most expensive first)
  const sortedServices = [...services].sort((a, b) => 
    (BASELINE_COSTS[b] || 500) - (BASELINE_COSTS[a] || 500)
  );
  
  // Try to replace expensive services with cheaper alternatives
  sortedServices.forEach(service => {
    const serviceCost = BASELINE_COSTS[service] || 500;
    
    // If we can afford this service, keep it
    if (serviceCost <= remainingBudget) {
      alternatives.push(service);
      remainingBudget -= serviceCost;
    } else {
      // Find affordable alternatives
      const affordableOptions = findAffordableAlternatives(service, remainingBudget);
      
      if (affordableOptions.length > 0) {
        // Add the first affordable alternative
        const alternative = affordableOptions[0];
        alternatives.push(alternative);
        remainingBudget -= (BASELINE_COSTS[alternative] || 500);
        
        explanations.push(
          `Replaced ${service} (R${serviceCost}) with more affordable ${alternative} (R${BASELINE_COSTS[alternative] || 500}).`
        );
      } else {
        explanations.push(
          `Couldn't include ${service} (R${serviceCost}) due to budget constraints.`
        );
      }
    }
  });
  
  // Calculate new total cost
  const alternativeCost = alternatives.reduce((total, service) => 
    total + (BASELINE_COSTS[service] || 500), 0);
  
  // Add summary explanation
  if (originalCost > alternativeCost) {
    explanations.push(
      `Original plan (R${originalCost}) adjusted to fit your budget of R${budget} with alternative plan (R${alternativeCost}).`
    );
  }
  
  return {
    alternatives,
    explanations,
    originalCost,
    alternativeCost
  };
}
