
import { ServiceCategory } from "./types";
import { CONDITION_TO_SERVICES } from "./serviceMappings";

// Common complementary service pairings
const COMPLEMENTARY_SERVICES: Record<ServiceCategory, ServiceCategory[]> = {
  'dietician': ['personal-trainer', 'coaching', 'endocrinology'],
  'personal-trainer': ['dietician', 'physiotherapist', 'coaching'],
  'physiotherapist': ['personal-trainer', 'family-medicine'],
  'coaching': ['personal-trainer', 'dietician'],
  'family-medicine': ['dietician', 'physiotherapist'],
  'cardiology': ['dietician', 'personal-trainer'],
  'endocrinology': ['dietician', 'personal-trainer'],
  'internal-medicine': ['dietician', 'physiotherapist'],
  'gastroenterology': ['dietician', 'family-medicine'],
  'biokineticist': ['physiotherapist', 'personal-trainer'],
  'pediatrics': ['dietician', 'family-medicine'],
  'dermatology': ['dietician', 'family-medicine'],
  'orthopedics': ['physiotherapist', 'personal-trainer'],
  'neurology': ['physiotherapist', 'family-medicine'],
  'obstetrics-gynecology': ['dietician', 'family-medicine'],
  'emergency-medicine': ['family-medicine', 'physiotherapist'],
  'psychiatry': ['coaching', 'family-medicine'],
  'anesthesiology': ['family-medicine', 'pain-management'],
  'urology': ['family-medicine', 'dietician'],
  'oncology': ['dietician', 'family-medicine'],
  'neurosurgery': ['physiotherapist', 'family-medicine'],
  'infectious-disease': ['family-medicine', 'dietician'],
  'radiology': ['family-medicine', 'orthopedics'],
  'geriatric-medicine': ['physiotherapist', 'dietician'],
  'plastic-surgery': ['family-medicine', 'dietician'],
  'rheumatology': ['physiotherapist', 'dietician'],
  'pain-management': ['physiotherapist', 'family-medicine']
};

// Default recommended categories if none are specified
const DEFAULT_CATEGORIES: ServiceCategory[] = [
  'dietician',
  'personal-trainer',
  'coaching'
];

export const findAlternativeCategories = (
  selectedCategories: ServiceCategory[]
): ServiceCategory[] => {
  const recommended = new Set<ServiceCategory>();

  // If we have selected categories, find complementary ones
  if (selectedCategories.length > 0) {
    selectedCategories.forEach(category => {
      const complementary = COMPLEMENTARY_SERVICES[category] || [];
      complementary.forEach(c => {
        if (!selectedCategories.includes(c)) {
          recommended.add(c);
        }
      });
    });
  } else {
    // If no categories selected, provide defaults
    DEFAULT_CATEGORIES.forEach(c => recommended.add(c));
  }

  return Array.from(recommended).slice(0, 3);
};
