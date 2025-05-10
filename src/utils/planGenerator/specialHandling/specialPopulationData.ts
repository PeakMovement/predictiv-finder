
import { ServiceCategory } from "@/types";

/**
 * Special population data for generating appropriate service recommendations
 */
export const SPECIAL_POPULATIONS = {
  child: {
    ageRange: [0, 17],
    recommendedServices: [
      'pediatrics', 
      'family-medicine',
      'dietician'
    ] as ServiceCategory[],
    contraindicatedServices: [
      'psychiatry', 
      'pain-management'
    ] as ServiceCategory[],
    specialConsiderations: [
      "Requires parental consent",
      "Specialized child-friendly approach needed",
      "Growth and development monitoring important"
    ]
  },
  elderly: {
    ageRange: [65, 120],
    recommendedServices: [
      'geriatrics', 
      'geriatric-medicine',
      'physical-therapy', 
      'physiotherapist'
    ] as ServiceCategory[],
    contraindicatedServices: [
      'personal-trainer' // Unless specialized in elderly fitness
    ] as ServiceCategory[],
    specialConsiderations: [
      "May require more frequent but shorter sessions",
      "Transportation assistance may be needed",
      "Medication management often required"
    ]
  },
  athlete: {
    recommendedServices: [
      'sports-medicine', 
      'physiotherapist',
      'personal-trainer', 
      'dietician', 
      'biokineticist'
    ] as ServiceCategory[],
    contraindicatedServices: [] as ServiceCategory[],
    specialConsiderations: [
      "Training periodization important",
      "Recovery protocols should be emphasized",
      "Performance goals need consideration"
    ]
  },
  pregnant: {
    recommendedServices: [
      'obstetrics-gynecology',
      'dietician',
      'physiotherapist'
    ] as ServiceCategory[],
    contraindicatedServices: [
      'orthopedic-surgeon',
      'chiropractor' // Unless specialized in prenatal care
    ] as ServiceCategory[],
    specialConsiderations: [
      "Trimester-specific considerations needed",
      "Avoid certain physical positions and exercises",
      "Nutrition needs specific focus"
    ]
  }
};

/**
 * Returns special population data for a specific population type
 */
export function getSpecialPopulationData(type: string) {
  if (type in SPECIAL_POPULATIONS) {
    return SPECIAL_POPULATIONS[type as keyof typeof SPECIAL_POPULATIONS];
  }
  return null;
}
