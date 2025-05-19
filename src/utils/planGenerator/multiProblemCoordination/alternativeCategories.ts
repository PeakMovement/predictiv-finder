
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
  'cardiology': ['internal-medicine', 'general-practitioner'],
  'dermatology': ['general-practitioner', 'internal-medicine'],
  'neurology': ['psychiatry', 'internal-medicine'],
  'endocrinology': ['internal-medicine', 'dietician'],
  'urology': ['internal-medicine', 'general-practitioner'],
  'oncology': ['internal-medicine', 'psychology'],
  'rheumatology': ['internal-medicine', 'orthopedics'],
  'pediatrics': ['general-practitioner', 'family-medicine'],
  'geriatrics': ['geriatric-medicine', 'family-medicine'],
  'sports-medicine': ['sport-physician', 'physiotherapist'],
  'internal-medicine': ['general-practitioner', 'family-medicine'],
  'orthopedics': ['orthopedic-surgeon', 'physiotherapist'],
  'neurosurgery': ['neurology', 'orthopedic-surgeon'],
  'infectious-disease': ['internal-medicine', 'general-practitioner'],
  'plastic-surgery': ['dermatology', 'orthopedic-surgeon'],
  'obstetrics-gynecology': ['general-practitioner', 'internal-medicine'],
  'emergency-medicine': ['general-practitioner', 'internal-medicine'],
  'anesthesiology': ['pain-management', 'emergency-medicine'],
  'radiology': ['internal-medicine', 'orthopedics'],
  'geriatric-medicine': ['geriatrics', 'internal-medicine'],
  'gynecology': ['obstetrics-gynecology', 'general-practitioner'],
  'ophthalmology': ['general-practitioner', 'neurology'],
  'speech-therapy': ['occupational-therapy', 'psychology'],
  'audiology': ['general-practitioner', 'neurology'],
  'acupuncture': ['massage-therapy', 'pain-management'],
  'yoga-instructor': ['pilates-instructor', 'personal-trainer'],
  'pilates-instructor': ['yoga-instructor', 'personal-trainer'],
  'tai-chi-instructor': ['yoga-instructor', 'pilates-instructor'],
  'naturopathy': ['dietician', 'homeopathy'],
  'homeopathy': ['naturopathy', 'dietician'],
  'osteopathy': ['physiotherapist', 'chiropractor'],
  'pharmacy': ['general-practitioner', 'nurse-practitioner'],
  'medical-specialist': ['general-practitioner', 'internal-medicine'],
  'all': ['general-practitioner', 'personal-trainer', 'dietician']
};

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
