
/**
 * Helper functions to create records based on ServiceCategory
 */
import { ServiceCategory } from "../types";

/**
 * Creates a record with all ServiceCategory keys initialized to a default value
 * @param defaultValue The default value to assign to each key
 * @returns A record with all ServiceCategory keys
 */
export function createServiceCategoryRecord<T>(defaultValue: T): Record<ServiceCategory, T> {
  const categories: ServiceCategory[] = [
    'physiotherapist',
    'biokineticist',
    'dietician',
    'personal-trainer',
    'psychology',
    'coaching',
    'psychiatry',
    'general-practitioner',
    'family-medicine',
    'cardiology',
    'endocrinology',
    'gastroenterology',
    'neurology',
    'orthopedic-surgeon',
    'rheumatology',
    'sports-medicine',
    'dermatology',
    'gynecology',
    'ophthalmology',
    'pain-management',
    'podiatrist',
    'occupational-therapy',
    'speech-therapy',
    'audiology',
    'nutrition-coaching',
    'chiropractor',
    'massage-therapy',
    'acupuncture',
    'yoga-instructor',
    'pilates-instructor',
    'tai-chi-instructor',
    'naturopathy',
    'homeopathy',
    'osteopathy',
    'pharmacy',
    'medical-specialist',
    'pediatrics',
    'geriatrics',
    'physical-therapy',
    'strength-coaching',
    'run-coaching',
    'internal-medicine',
    'infectious-disease',
    'plastic-surgery',
    'orthopedics',
    'neurosurgery',
    'oncology',
    'urology',
    'obstetrics-gynecology',
    'emergency-medicine',
    'anesthesiology',
    'radiology',
    'geriatric-medicine',
    'sport-physician',
    'nurse-practitioner',
    'all'
  ];

  const result: Record<ServiceCategory, T> = {} as Record<ServiceCategory, T>;
  categories.forEach(category => {
    result[category] = defaultValue;
  });
  
  return result;
}

/**
 * Creates a record with all ServiceCategory keys initialized using a factory function
 * @param factory A function that returns the value to assign to each key
 * @returns A record with all ServiceCategory keys
 */
export function createServiceCategoryRecordWithFactory<T>(factory: (category: ServiceCategory) => T): Record<ServiceCategory, T> {
  const result: Partial<Record<ServiceCategory, T>> = {};
  const categories: ServiceCategory[] = [
    'physiotherapist',
    'biokineticist',
    'dietician',
    'personal-trainer',
    'psychology',
    'coaching',
    'psychiatry',
    'general-practitioner',
    'family-medicine',
    'cardiology',
    'endocrinology',
    'gastroenterology',
    'neurology',
    'orthopedic-surgeon',
    'rheumatology',
    'sports-medicine',
    'dermatology',
    'gynecology',
    'ophthalmology',
    'pain-management',
    'podiatrist',
    'occupational-therapy',
    'speech-therapy',
    'audiology',
    'nutrition-coaching',
    'chiropractor',
    'massage-therapy',
    'acupuncture',
    'yoga-instructor',
    'pilates-instructor',
    'tai-chi-instructor',
    'naturopathy',
    'homeopathy',
    'osteopathy',
    'pharmacy',
    'medical-specialist',
    'pediatrics',
    'geriatrics',
    'physical-therapy',
    'strength-coaching',
    'run-coaching',
    'internal-medicine',
    'infectious-disease',
    'plastic-surgery',
    'orthopedics',
    'neurosurgery',
    'oncology',
    'urology',
    'obstetrics-gynecology',
    'emergency-medicine',
    'anesthesiology',
    'radiology',
    'geriatric-medicine',
    'sport-physician',
    'nurse-practitioner',
    'all'
  ];
  
  categories.forEach(category => {
    result[category] = factory(category);
  });
  
  return result as Record<ServiceCategory, T>;
}
