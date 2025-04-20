
import { ServiceCategory } from "./types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  priority: number;
  secondary?: ServiceCategory[];
}

export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  "stomach pain": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "internal-medicine", "family-medicine"],
    priority: 1.0
  },
  "back pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist"],
    priority: 0.7,
    secondary: ["orthopedics"]
  },
  "joint pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist"],
    priority: 0.7,
    secondary: ["orthopedics", "rheumatology"]
  },
  "weight management": {
    primary: "dietician",
    specialties: ["dietician"],
    priority: 0.6,
    secondary: ["personal-trainer", "coaching"]
  },
  "fatigue": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine"],
    priority: 0.8,
    secondary: ["endocrinology"]
  },
  "headaches": {
    primary: "family-medicine",
    specialties: ["family-medicine"],
    priority: 0.7,
    secondary: ["neurology"]
  }
};

export const identifySymptoms = (userInput: string): string[] => {
  const symptoms: string[] = [];
  const inputLower = userInput.toLowerCase();
  
  Object.keys(SYMPTOM_MAPPINGS).forEach(symptom => {
    if (inputLower.includes(symptom)) {
      symptoms.push(symptom);
    }
  });
  
  return symptoms;
};

export const getProfessionalsForSymptoms = (symptoms: string[]): ServiceCategory[] => {
  const professionals = new Set<ServiceCategory>();
  
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (mapping) {
      professionals.add(mapping.primary);
      mapping.specialties.forEach(specialty => professionals.add(specialty));
      mapping.secondary?.forEach(secondary => professionals.add(secondary));
    }
  });
  
  return Array.from(professionals);
};
