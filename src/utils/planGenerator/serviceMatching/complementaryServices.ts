
import { ServiceCategory } from "../types";

/**
 * Find complementary services that work well with a given service
 */
export function findComplementaryServices(
  category: ServiceCategory,
  condition?: string,
  symptoms: string[] = []
): ServiceCategory[] {
  const complementary: ServiceCategory[] = [];
  
  // Create a complete record for complementary pairs with type safety
  const createComplementaryPairs = (): Record<ServiceCategory, ServiceCategory[]> => {
    return {
      'personal-trainer': ['dietician', 'physiotherapist', 'coaching'],
      'dietician': ['personal-trainer', 'coaching', 'family-medicine'],
      'physiotherapist': ['personal-trainer', 'pain-management', 'orthopedics'],
      'psychiatry': ['coaching', 'family-medicine'],
      'family-medicine': ['dietician', 'physiotherapist'],
      'orthopedics': ['physiotherapist', 'pain-management'],
      'coaching': ['personal-trainer', 'dietician', 'psychiatry'],
      'gastroenterology': ['dietician', 'family-medicine'],
      'cardiology': [],
      'neurology': [],
      'dermatology': [],
      'obstetrics-gynecology': [],
      'emergency-medicine': [],
      'anesthesiology': [],
      'endocrinology': [],
      'urology': [],
      'oncology': [],
      'neurosurgery': [],
      'infectious-disease': [],
      'radiology': [],
      'geriatric-medicine': [],
      'plastic-surgery': [],
      'rheumatology': [],
      'pain-management': [],
      'pediatrics': [],
      'biokineticist': [],
      'internal-medicine': []
    } as Record<ServiceCategory, ServiceCategory[]>;
  };
  
  // Get complementary pairs mapping
  const complementaryPairs = createComplementaryPairs();
  
  // Add standard complementary services
  if (complementaryPairs[category] && complementaryPairs[category].length > 0) {
    complementary.push(...complementaryPairs[category]);
  }
  
  // Special case for knee pain + performance goals
  if (condition?.includes('knee') && symptoms.some(s => 
      s.includes('race') || s.includes('marathon') || s.includes('run'))) {
    if (category === 'physiotherapist') {
      complementary.push('personal-trainer', 'coaching');
    } else if (category === 'personal-trainer' || category === 'coaching') {
      complementary.push('physiotherapist');
    }
  }
  
  return complementary;
}
