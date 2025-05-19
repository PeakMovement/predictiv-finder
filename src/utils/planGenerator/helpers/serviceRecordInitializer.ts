
import { ServiceCategory } from "../types";

/**
 * Creates an empty record with all ServiceCategory keys initialized to the provided default value
 * @param defaultValue The default value to initialize each category with
 * @returns A record with all ServiceCategory keys
 */
export function createServiceCategoryRecord<T>(defaultValue: T): Record<ServiceCategory, T> {
  const categories: ServiceCategory[] = [
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
  
  return Object.fromEntries(
    categories.map(category => [category, defaultValue])
  ) as Record<ServiceCategory, T>;
}
