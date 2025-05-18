
import { ServiceCategory } from "../types";

/**
 * Creates a Record initialized with all ServiceCategory keys set to a default value
 * @param defaultValue The default value for each ServiceCategory key
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
    'strength-coaching': defaultValue,
    'run-coaching': defaultValue,
    'all': defaultValue
  } as Record<ServiceCategory, T>;
}

/**
 * Creates a Record initialized with all ServiceCategory keys set to a value returned by the factory function
 * @param factory A function that returns the value for each ServiceCategory key
 */
export function createServiceCategoryRecordWithFactory<T>(factory: () => T): Record<ServiceCategory, T> {
  return {
    'physiotherapist': factory(),
    'biokineticist': factory(),
    'dietician': factory(),
    'personal-trainer': factory(),
    'coaching': factory(),
    'psychology': factory(),
    'psychiatry': factory(),
    'family-medicine': factory(),
    'pain-management': factory(),
    'podiatrist': factory(),
    'general-practitioner': factory(),
    'sport-physician': factory(),
    'orthopedic-surgeon': factory(),
    'gastroenterology': factory(),
    'massage-therapy': factory(),
    'nutrition-coaching': factory(),
    'occupational-therapy': factory(),
    'physical-therapy': factory(),
    'chiropractor': factory(),
    'nurse-practitioner': factory(),
    'cardiology': factory(),
    'dermatology': factory(),
    'neurology': factory(),
    'endocrinology': factory(),
    'urology': factory(),
    'oncology': factory(),
    'rheumatology': factory(),
    'pediatrics': factory(),
    'geriatrics': factory(),
    'sports-medicine': factory(),
    'internal-medicine': factory(),
    'orthopedics': factory(),
    'neurosurgery': factory(),
    'infectious-disease': factory(),
    'plastic-surgery': factory(),
    'obstetrics-gynecology': factory(),
    'emergency-medicine': factory(),
    'anesthesiology': factory(),
    'radiology': factory(),
    'geriatric-medicine': factory(),
    'strength-coaching': factory(),
    'run-coaching': factory(),
    'all': factory()
  } as Record<ServiceCategory, T>;
}
