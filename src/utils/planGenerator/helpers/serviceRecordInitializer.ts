
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
  return {
    'physiotherapist': defaultValue,
    'biokineticist': defaultValue,
    'dietician': defaultValue,
    'personal-trainer': defaultValue,
    'psychology': defaultValue,
    'coaching': defaultValue,
    'psychiatry': defaultValue,
    'general-practitioner': defaultValue,
    'family-medicine': defaultValue,
    'cardiology': defaultValue,
    'endocrinology': defaultValue,
    'gastroenterology': defaultValue,
    'neurology': defaultValue,
    'orthopedic-surgeon': defaultValue,
    'rheumatology': defaultValue,
    'sports-medicine': defaultValue,
    'dermatology': defaultValue,
    'gynecology': defaultValue,
    'ophthalmology': defaultValue,
    'psychology': defaultValue,
    'pain-management': defaultValue,
    'podiatrist': defaultValue,
    'occupational-therapy': defaultValue,
    'speech-therapy': defaultValue,
    'audiology': defaultValue,
    'nutrition-coaching': defaultValue,
    'chiropractor': defaultValue,
    'massage-therapy': defaultValue,
    'acupuncture': defaultValue,
    'yoga-instructor': defaultValue,
    'pilates-instructor': defaultValue,
    'tai-chi-instructor': defaultValue,
    'naturopathy': defaultValue,
    'homeopathy': defaultValue,
    'osteopathy': defaultValue,
    'pharmacy': defaultValue,
    'medical-specialist': defaultValue,
    'pediatrics': defaultValue,
    'geriatrics': defaultValue,
    'physical-therapy': defaultValue,
    'strength-coaching': defaultValue,
    'run-coaching': defaultValue
  };
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
    'psychology',
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
    'run-coaching'
  ];
  
  categories.forEach(category => {
    result[category] = factory(category);
  });
  
  return result as Record<ServiceCategory, T>;
}
