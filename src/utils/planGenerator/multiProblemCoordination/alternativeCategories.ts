
import { ServiceCategory } from "../types";

/**
 * Finds alternative service categories based on the given categories
 * @param categories List of service categories to find alternatives for
 * @param budget Optional budget constraint to consider
 * @returns Map of original categories to alternative options
 */
export function findAlternativeCategories(
  categories: ServiceCategory[],
  budget?: number
): Map<ServiceCategory, ServiceCategory[]> {
  const alternatives = new Map<ServiceCategory, ServiceCategory[]>();
  
  // Define some common alternatives
  const commonAlternatives: Partial<Record<ServiceCategory, ServiceCategory[]>> = {
    'physiotherapist': ['biokineticist', 'pain-management'],
    'psychology': ['psychiatry', 'coaching'],
    'dietician': ['nutrition-coaching'],
    'personal-trainer': ['strength-coaching', 'run-coaching', 'biokineticist'],
    'psychiatry': ['psychology'],
    'biokineticist': ['physiotherapist', 'personal-trainer'],
  };
  
  // Fill in alternatives for each category
  categories.forEach(category => {
    if (commonAlternatives[category]) {
      alternatives.set(category, commonAlternatives[category] as ServiceCategory[]);
    } else {
      // Default alternatives if none specifically defined
      alternatives.set(category, []);
    }
  });
  
  // Budget-specific alternatives could be added here
  if (budget && budget < 2000) {
    // For low budgets, suggest more affordable alternatives
    if (alternatives.has('psychiatry')) {
      alternatives.set('psychiatry', ['psychology', 'coaching']);
    }
  }
  
  return alternatives;
}
