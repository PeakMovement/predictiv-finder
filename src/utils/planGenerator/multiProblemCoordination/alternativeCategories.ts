
import { ServiceCategory } from "../types";

/**
 * Maps service categories to their alternative recommendations
 */
const ALTERNATIVE_CATEGORY_MAP: Record<ServiceCategory, ServiceCategory[]> = {
  'physiotherapist': ['physical-therapy', 'massage-therapy', 'biokineticist'],
  'biokineticist': ['physiotherapist', 'personal-trainer', 'physical-therapy'],
  'dietician': ['nutrition-coaching', 'personal-trainer'],
  'personal-trainer': ['strength-coaching', 'run-coaching', 'biokineticist'],
  'coaching': ['psychology', 'personal-trainer'],
  'psychology': ['psychiatry', 'coaching'],
  'psychiatry': ['psychology', 'family-medicine'],
  'family-medicine': ['general-practitioner', 'psychiatry'],
  'pain-management': ['physiotherapist', 'massage-therapy'],
  'podiatrist': ['orthopedics', 'physiotherapist'],
  'general-practitioner': ['family-medicine', 'nurse-practitioner'],
  'sport-physician': ['sports-medicine', 'orthopedics'],
  'orthopedic-surgeon': ['orthopedics', 'sports-medicine'],
  'gastroenterology': ['dietician', 'internal-medicine'],
  'massage-therapy': ['physiotherapist', 'pain-management'],
  'nutrition-coaching': ['dietician', 'personal-trainer'],
  'occupational-therapy': ['physiotherapist', 'psychology'],
  'physical-therapy': ['physiotherapist', 'biokineticist'],
  'chiropractor': ['physiotherapist', 'massage-therapy'],
  'nurse-practitioner': ['general-practitioner', 'family-medicine'],
  'strength-coaching': ['personal-trainer', 'biokineticist'],
  'run-coaching': ['personal-trainer', 'sport-physician'],
  'all': ['general-practitioner', 'personal-trainer', 'dietician']
};

// Add remaining categories with some reasonable defaults
Object.keys(require('../types').BASELINE_COSTS).forEach(category => {
  if (!ALTERNATIVE_CATEGORY_MAP[category as ServiceCategory]) {
    ALTERNATIVE_CATEGORY_MAP[category as ServiceCategory] = ['general-practitioner', 'family-medicine'];
  }
});

/**
 * Finds alternative categories based on selected categories
 * 
 * @param selectedCategories Array of service categories already selected
 * @returns Array of alternative service categories as strings
 */
export function findAlternativeCategories(selectedCategories: ServiceCategory[]): ServiceCategory[] {
  // If no categories selected, recommend common starting points
  if (!selectedCategories || selectedCategories.length === 0) {
    return ['general-practitioner', 'physiotherapist', 'psychology'];
  }
  
  // Get all alternatives for selected categories
  const allAlternatives = selectedCategories.flatMap(category => 
    ALTERNATIVE_CATEGORY_MAP[category] || []
  );
  
  // Filter out categories that are already selected
  const filteredAlternatives = allAlternatives.filter(
    alt => !selectedCategories.includes(alt)
  );
  
  // Remove duplicates and return top 3
  return Array.from(new Set(filteredAlternatives)).slice(0, 3);
}
