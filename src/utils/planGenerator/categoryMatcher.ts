
import { ServiceCategory } from "./types";

/**
 * Finds alternative service categories based on the user's selected categories
 * @param selectedCategories Currently selected service categories
 * @returns Array of recommended additional service categories
 */
export const findAlternativeCategories = (
  selectedCategories: ServiceCategory[]
): ServiceCategory[] => {
  // Common complementary service pairings
  const complementaryServices: Partial<Record<ServiceCategory, ServiceCategory[]>> = {
    'personal-trainer': ['dietician', 'physiotherapist', 'coaching'],
    'dietician': ['personal-trainer', 'coaching', 'family-medicine'],
    'physiotherapist': ['personal-trainer', 'biokineticist', 'pain-management'],
    'coaching': ['personal-trainer', 'dietician', 'psychiatry'],
    'family-medicine': ['dietician', 'psychiatry', 'gastroenterology'],
    'gastroenterology': ['dietician', 'family-medicine'],
    'psychiatry': ['coaching', 'family-medicine'],
    'cardiology': ['family-medicine', 'dietician'],
    'orthopedics': ['physiotherapist', 'biokineticist'],
    'pain-management': ['physiotherapist', 'family-medicine'],
    'biokineticist': ['personal-trainer', 'physiotherapist'],
    'internal-medicine': ['family-medicine', 'dietician'],
    'pediatrics': ['family-medicine', 'dietician'],
    'dermatology': ['family-medicine'],
    'neurology': ['psychiatry', 'pain-management'],
    'obstetrics-gynecology': ['family-medicine', 'dietician'],
    'emergency-medicine': ['family-medicine'],
    'anesthesiology': ['pain-management'],
    'endocrinology': ['dietician', 'internal-medicine'],
    'urology': ['family-medicine'],
    'oncology': ['internal-medicine', 'dietician'],
    'neurosurgery': ['neurology', 'pain-management'],
    'infectious-disease': ['internal-medicine', 'family-medicine'],
    'radiology': ['family-medicine'],
    'geriatric-medicine': ['family-medicine', 'psychiatry'],
    'plastic-surgery': ['dermatology'],
    'rheumatology': ['pain-management', 'physiotherapist']
  };
  
  const recommendedCategories = new Set<ServiceCategory>();
  
  // If no categories selected, recommend some common starting points
  if (selectedCategories.length === 0) {
    return ['family-medicine', 'personal-trainer', 'dietician'];
  }
  
  // Add complementary services based on selected categories
  selectedCategories.forEach(category => {
    const complementary = complementaryServices[category];
    if (complementary) {
      complementary.forEach(service => {
        // Only recommend services that aren't already selected
        if (!selectedCategories.includes(service)) {
          recommendedCategories.add(service);
        }
      });
    }
  });
  
  // Special case: If selected categories contain both personal trainer and dietician,
  // suggest coaching as it complements both
  if (selectedCategories.includes('personal-trainer') && 
      selectedCategories.includes('dietician') &&
      !selectedCategories.includes('coaching')) {
    recommendedCategories.add('coaching');
  }
  
  // If selected categories include any pain-related service,
  // suggest pain-management if not already selected
  const painRelatedServices: ServiceCategory[] = ['physiotherapist', 'orthopedics'];
  if (painRelatedServices.some(s => selectedCategories.includes(s)) && 
      !selectedCategories.includes('pain-management')) {
    recommendedCategories.add('pain-management');
  }
  
  // Return up to 3 recommendations
  return Array.from(recommendedCategories).slice(0, 3);
};

/**
 * Maps user health conditions to appropriate service categories
 * @param conditions Array of health conditions
 * @returns Recommended service categories
 */
export const mapConditionsToCategories = (
  conditions: string[]
): ServiceCategory[] => {
  const conditionMap: Record<string, ServiceCategory[]> = {
    'back pain': ['physiotherapist', 'orthopedics', 'pain-management'],
    'knee pain': ['physiotherapist', 'orthopedics'],
    'weight loss': ['dietician', 'personal-trainer'],
    'fitness goals': ['personal-trainer', 'coaching'],
    'stomach issues': ['gastroenterology', 'dietician'],
    'digestive problems': ['gastroenterology', 'dietician'],
    'anxiety': ['psychiatry', 'coaching'],
    'depression': ['psychiatry', 'coaching'],
    'stress': ['psychiatry', 'coaching'],
    'headaches': ['neurology', 'family-medicine'],
    'sleep issues': ['psychiatry', 'family-medicine'],
    'hypertension': ['cardiology', 'dietician'],
    'diabetes': ['endocrinology', 'dietician']
  };
  
  const categories = new Set<ServiceCategory>();
  
  conditions.forEach(condition => {
    const mappedCategories = conditionMap[condition.toLowerCase()];
    if (mappedCategories) {
      mappedCategories.forEach(category => categories.add(category));
    } else {
      // Default to family medicine for unknown conditions
      categories.add('family-medicine');
    }
  });
  
  return Array.from(categories);
};
