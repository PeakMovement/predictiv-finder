
import { ServiceCategory } from "../types";

/**
 * Creates a fully initialized Record with all ServiceCategory keys and default values
 * @param defaultValue Default value to set for all service categories
 * @returns A complete Record with all service categories initialized
 */
export function createServiceCategoryRecord<T>(defaultValue: T): Record<ServiceCategory, T> {
  return {
    'physiotherapist': defaultValue,
    'biokineticist': defaultValue,
    'dietician': defaultValue,
    'personal-trainer': defaultValue,
    'coaching': defaultValue,
    'psychology': defaultValue,
    'psychiatry': defaultValue,
    'family-medicine': defaultValue,
    'pain-management': defaultValue,
    'podiatrist': defaultValue,
    'general-practitioner': defaultValue,
    'sport-physician': defaultValue,
    'orthopedic-surgeon': defaultValue,
    'gastroenterology': defaultValue,
    'massage-therapy': defaultValue,
    'nutrition-coaching': defaultValue, 
    'occupational-therapy': defaultValue,
    'physical-therapy': defaultValue,
    'chiropractor': defaultValue,
    'nurse-practitioner': defaultValue,
    'cardiology': defaultValue,
    'dermatology': defaultValue,
    'neurology': defaultValue,
    'endocrinology': defaultValue,
    'urology': defaultValue,
    'oncology': defaultValue,
    'rheumatology': defaultValue,
    'pediatrics': defaultValue,
    'geriatrics': defaultValue,
    'sports-medicine': defaultValue,
    'internal-medicine': defaultValue,
    'orthopedics': defaultValue,
    'neurosurgery': defaultValue,
    'infectious-disease': defaultValue,
    'plastic-surgery': defaultValue,
    'obstetrics-gynecology': defaultValue,
    'emergency-medicine': defaultValue,
    'anesthesiology': defaultValue,
    'radiology': defaultValue,
    'geriatric-medicine': defaultValue,
    'all': defaultValue
  };
}

/**
 * Creates a Record with all ServiceCategory keys and a factory function for producing values
 * @param valueFactory Function that takes a ServiceCategory and returns a value
 * @returns A complete Record with all service categories initialized using the factory function
 */
export function createServiceCategoryRecordWithFactory<T>(
  valueFactory: (category: ServiceCategory) => T
): Record<ServiceCategory, T> {
  const categories: ServiceCategory[] = [
    'physiotherapist', 'biokineticist', 'dietician', 'personal-trainer',
    'coaching', 'psychology', 'psychiatry', 'family-medicine',
    'pain-management', 'podiatrist', 'general-practitioner', 'sport-physician',
    'orthopedic-surgeon', 'gastroenterology', 'massage-therapy', 'nutrition-coaching',
    'occupational-therapy', 'physical-therapy', 'chiropractor', 'nurse-practitioner',
    'cardiology', 'dermatology', 'neurology', 'endocrinology',
    'urology', 'oncology', 'rheumatology', 'pediatrics',
    'geriatrics', 'sports-medicine', 'internal-medicine', 'orthopedics',
    'neurosurgery', 'infectious-disease', 'plastic-surgery', 'obstetrics-gynecology',
    'emergency-medicine', 'anesthesiology', 'radiology', 'geriatric-medicine',
    'all'
  ];
  
  const record = {} as Record<ServiceCategory, T>;
  
  categories.forEach(category => {
    record[category] = valueFactory(category);
  });
  
  return record;
}
