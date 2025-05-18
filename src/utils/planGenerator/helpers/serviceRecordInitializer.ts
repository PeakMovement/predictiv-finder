
import { ServiceCategory } from '../types';

/**
 * Creates a record with all service categories initialized to a default value
 * @param defaultValue The default value to initialize each category with
 * @returns A record with all service categories as keys
 */
export function createServiceCategoryRecord<T>(defaultValue: T): Record<ServiceCategory, T> {
  const record = {} as Record<ServiceCategory, T>;
  
  const allCategories: ServiceCategory[] = [
    'physiotherapist',
    'biokineticist', 
    'dietician',
    'personal-trainer',
    'coaching',
    'psychology',
    'psychiatry',
    'family-medicine',
    'pain-management',
    'podiatrist',
    'general-practitioner',
    'sport-physician',
    'orthopedic-surgeon',
    'gastroenterology',
    'massage-therapy',
    'nutrition-coaching',
    'occupational-therapy',
    'physical-therapy',
    'chiropractor',
    'nurse-practitioner',
    'cardiology',
    'dermatology',
    'neurology',
    'endocrinology',
    'urology',
    'oncology',
    'rheumatology',
    'pediatrics',
    'geriatrics',
    'sports-medicine',
    'internal-medicine',
    'orthopedics',
    'neurosurgery',
    'infectious-disease',
    'plastic-surgery',
    'obstetrics-gynecology',
    'emergency-medicine',
    'anesthesiology',
    'radiology',
    'geriatric-medicine',
    'strength-coaching',
    'run-coaching',
    'all'
  ];
  
  allCategories.forEach(category => {
    record[category] = defaultValue;
  });
  
  return record;
}
