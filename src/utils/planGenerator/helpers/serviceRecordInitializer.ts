
import { ServiceCategory } from "../types";

/**
 * Create a record with all ServiceCategory keys initialized with the provided default value
 * This helps avoid TypeScript errors when creating partial records
 * 
 * @param defaultValue The default value to use for each service category
 * @returns A fully initialized record with all ServiceCategory keys
 */
export function createServiceCategoryRecord<T>(defaultValue: T): Record<ServiceCategory, T> {
  const record = {} as Record<ServiceCategory, T>;
  
  // Initialize all service categories with the default value
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
    'all'
  ];
  
  allCategories.forEach(category => {
    record[category] = defaultValue;
  });
  
  return record;
}
