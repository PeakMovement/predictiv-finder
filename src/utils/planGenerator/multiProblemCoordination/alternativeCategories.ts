
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Maps service categories to their alternative recommendations
 */
const ALTERNATIVE_CATEGORY_MAP: Record<ServiceCategory, ServiceCategory[]> = createServiceCategoryRecord([] as ServiceCategory[]);

// Fill in the specific alternatives for commonly used services
ALTERNATIVE_CATEGORY_MAP['physiotherapist'] = ['physical-therapy', 'massage-therapy', 'biokineticist'];
ALTERNATIVE_CATEGORY_MAP['biokineticist'] = ['physiotherapist', 'personal-trainer', 'physical-therapy'];
ALTERNATIVE_CATEGORY_MAP['dietician'] = ['nutrition-coaching', 'personal-trainer'];
ALTERNATIVE_CATEGORY_MAP['personal-trainer'] = ['strength-coaching', 'run-coaching', 'biokineticist'];
ALTERNATIVE_CATEGORY_MAP['coaching'] = ['psychology', 'personal-trainer'];
ALTERNATIVE_CATEGORY_MAP['psychology'] = ['psychiatry', 'coaching'];
ALTERNATIVE_CATEGORY_MAP['psychiatry'] = ['psychology', 'family-medicine'];
ALTERNATIVE_CATEGORY_MAP['family-medicine'] = ['general-practitioner', 'psychiatry'];
ALTERNATIVE_CATEGORY_MAP['pain-management'] = ['physiotherapist', 'massage-therapy'];
ALTERNATIVE_CATEGORY_MAP['podiatrist'] = ['orthopedics', 'physiotherapist'];
ALTERNATIVE_CATEGORY_MAP['general-practitioner'] = ['family-medicine', 'nurse-practitioner'];
ALTERNATIVE_CATEGORY_MAP['sport-physician'] = ['sports-medicine', 'orthopedics'];
ALTERNATIVE_CATEGORY_MAP['orthopedic-surgeon'] = ['orthopedics', 'sports-medicine'];
ALTERNATIVE_CATEGORY_MAP['gastroenterology'] = ['dietician', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['massage-therapy'] = ['physiotherapist', 'pain-management'];
ALTERNATIVE_CATEGORY_MAP['nutrition-coaching'] = ['dietician', 'personal-trainer'];
ALTERNATIVE_CATEGORY_MAP['occupational-therapy'] = ['physiotherapist', 'psychology'];
ALTERNATIVE_CATEGORY_MAP['physical-therapy'] = ['physiotherapist', 'biokineticist'];
ALTERNATIVE_CATEGORY_MAP['chiropractor'] = ['physiotherapist', 'massage-therapy'];
ALTERNATIVE_CATEGORY_MAP['nurse-practitioner'] = ['general-practitioner', 'family-medicine'];
ALTERNATIVE_CATEGORY_MAP['strength-coaching'] = ['personal-trainer', 'biokineticist'];
ALTERNATIVE_CATEGORY_MAP['run-coaching'] = ['personal-trainer', 'sport-physician'];
ALTERNATIVE_CATEGORY_MAP['cardiology'] = ['internal-medicine', 'general-practitioner'];
ALTERNATIVE_CATEGORY_MAP['dermatology'] = ['general-practitioner', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['neurology'] = ['psychiatry', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['endocrinology'] = ['internal-medicine', 'dietician'];
ALTERNATIVE_CATEGORY_MAP['urology'] = ['internal-medicine', 'general-practitioner'];
ALTERNATIVE_CATEGORY_MAP['oncology'] = ['internal-medicine', 'psychology'];
ALTERNATIVE_CATEGORY_MAP['rheumatology'] = ['internal-medicine', 'orthopedics'];
ALTERNATIVE_CATEGORY_MAP['pediatrics'] = ['general-practitioner', 'family-medicine'];
ALTERNATIVE_CATEGORY_MAP['geriatrics'] = ['geriatric-medicine', 'family-medicine'];
ALTERNATIVE_CATEGORY_MAP['sports-medicine'] = ['sport-physician', 'physiotherapist'];
ALTERNATIVE_CATEGORY_MAP['internal-medicine'] = ['general-practitioner', 'family-medicine'];
ALTERNATIVE_CATEGORY_MAP['orthopedics'] = ['orthopedic-surgeon', 'physiotherapist'];
ALTERNATIVE_CATEGORY_MAP['neurosurgery'] = ['neurology', 'orthopedic-surgeon'];
ALTERNATIVE_CATEGORY_MAP['infectious-disease'] = ['internal-medicine', 'general-practitioner'];
ALTERNATIVE_CATEGORY_MAP['plastic-surgery'] = ['dermatology', 'orthopedic-surgeon'];
ALTERNATIVE_CATEGORY_MAP['obstetrics-gynecology'] = ['general-practitioner', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['emergency-medicine'] = ['general-practitioner', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['anesthesiology'] = ['pain-management', 'emergency-medicine'];
ALTERNATIVE_CATEGORY_MAP['radiology'] = ['internal-medicine', 'orthopedics'];
ALTERNATIVE_CATEGORY_MAP['geriatric-medicine'] = ['geriatrics', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['gynecology'] = ['obstetrics-gynecology', 'general-practitioner'];
ALTERNATIVE_CATEGORY_MAP['ophthalmology'] = ['general-practitioner', 'neurology'];
ALTERNATIVE_CATEGORY_MAP['speech-therapy'] = ['occupational-therapy', 'psychology'];
ALTERNATIVE_CATEGORY_MAP['audiology'] = ['general-practitioner', 'neurology'];
ALTERNATIVE_CATEGORY_MAP['acupuncture'] = ['massage-therapy', 'pain-management'];
ALTERNATIVE_CATEGORY_MAP['yoga-instructor'] = ['pilates-instructor', 'personal-trainer'];
ALTERNATIVE_CATEGORY_MAP['pilates-instructor'] = ['yoga-instructor', 'personal-trainer'];
ALTERNATIVE_CATEGORY_MAP['tai-chi-instructor'] = ['yoga-instructor', 'pilates-instructor'];
ALTERNATIVE_CATEGORY_MAP['naturopathy'] = ['dietician', 'homeopathy'];
ALTERNATIVE_CATEGORY_MAP['homeopathy'] = ['naturopathy', 'dietician'];
ALTERNATIVE_CATEGORY_MAP['osteopathy'] = ['physiotherapist', 'chiropractor'];
ALTERNATIVE_CATEGORY_MAP['pharmacy'] = ['general-practitioner', 'nurse-practitioner'];
ALTERNATIVE_CATEGORY_MAP['medical-specialist'] = ['general-practitioner', 'internal-medicine'];
ALTERNATIVE_CATEGORY_MAP['all'] = ['general-practitioner', 'personal-trainer', 'dietician'];

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
