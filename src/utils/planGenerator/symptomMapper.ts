import { ServiceCategory } from "./types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  priority: number;
  secondary?: ServiceCategory[];
  keywords?: string[];
}

export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  // Digestive System
  "stomach pain": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "internal-medicine", "family-medicine"],
    priority: 1.0,
    keywords: [
      "hurt", "hurting", "ache", "aching", 
      "cramp", "cramping", "discomfort",
      "bloated", "bloating", "upset stomach"
    ]
  },
  "nausea": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "family-medicine"],
    priority: 0.9
  },
  "indigestion": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "family-medicine", "dietician"],
    priority: 0.8
  },
  "acid reflux": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "family-medicine"],
    priority: 0.8
  },
  "bloating": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "dietician"],
    priority: 0.7
  },
  
  // Musculoskeletal System
  "back pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.9,
    secondary: ["orthopedics"]
  },
  "joint pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.8,
    secondary: ["orthopedics", "rheumatology"]
  },
  "muscle pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "personal-trainer"],
    priority: 0.7
  },
  "arthritis": {
    primary: "rheumatology",
    specialties: ["rheumatology", "physiotherapist"],
    priority: 0.9
  },
  
  // Fitness and Wellness
  "weight management": {
    primary: "dietician",
    specialties: ["dietician", "personal-trainer"],
    priority: 0.8,
    secondary: ["coaching"]
  },
  "fitness": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "biokineticist"],
    priority: 0.7,
    secondary: ["coaching"]
  },
  "nutrition": {
    primary: "dietician",
    specialties: ["dietician"],
    priority: 0.8,
    secondary: ["coaching"]
  },
  
  // General Health
  "fatigue": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine"],
    priority: 0.8,
    secondary: ["endocrinology"]
  },
  "headaches": {
    primary: "family-medicine",
    specialties: ["family-medicine", "neurology"],
    priority: 0.8
  },
  "dizziness": {
    primary: "family-medicine",
    specialties: ["family-medicine", "neurology"],
    priority: 0.8
  },
  "fever": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine"],
    priority: 0.9
  },
  
  // Mental Health
  "stress": {
    primary: "psychiatry",
    specialties: ["psychiatry", "coaching"],
    priority: 0.7
  },
  "anxiety": {
    primary: "psychiatry",
    specialties: ["psychiatry"],
    priority: 0.8
  },
  "depression": {
    primary: "psychiatry",
    specialties: ["psychiatry"],
    priority: 0.9
  },
  
  // Respiratory
  "breathing": {
    primary: "internal-medicine",
    specialties: ["internal-medicine", "family-medicine"],
    priority: 0.9
  },
  "cough": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine"],
    priority: 0.7
  }
};

export const identifySymptoms = (userInput: string): string[] => {
  const symptoms: string[] = [];
  const inputLower = userInput.toLowerCase();
  
  // First, check for exact matches
  Object.entries(SYMPTOM_MAPPINGS).forEach(([symptom, mapping]) => {
    // Check main symptom name
    if (inputLower.includes(symptom)) {
      symptoms.push(symptom);
    }
    
    // Check additional keywords if defined
    mapping.keywords?.forEach(keyword => {
      if (inputLower.includes(keyword)) {
        symptoms.push(symptom);
      }
    });
  });

  // Check for common phrases indicating discomfort
  const discomfortPhrases = [
    { phrase: "doesn't feel good", mappedSymptom: "stomach pain" },
    { phrase: "not feeling well", mappedSymptom: "fatigue" },
    { phrase: "feeling sick", mappedSymptom: "nausea" },
    { phrase: "hurts", mappedSymptom: "pain" },
    { phrase: "aching", mappedSymptom: "muscle pain" },
    { phrase: "can't sleep", mappedSymptom: "stress" },
    { phrase: "tired all the time", mappedSymptom: "fatigue" },
    { phrase: "no energy", mappedSymptom: "fatigue" },
    { phrase: "stomach issues", mappedSymptom: "stomach pain" },
    { phrase: "digestive problems", mappedSymptom: "indigestion" }
  ];

  discomfortPhrases.forEach(({ phrase, mappedSymptom }) => {
    if (inputLower.includes(phrase) && !symptoms.includes(mappedSymptom)) {
      symptoms.push(mappedSymptom);
    }
  });
  
  return Array.from(new Set(symptoms)); // Remove duplicates
};

export const getProfessionalsForSymptoms = (symptoms: string[]): ServiceCategory[] => {
  const professionals = new Set<ServiceCategory>();
  const priorityMap = new Map<ServiceCategory, number>();
  
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (mapping) {
      // Add primary specialist with highest priority
      professionals.add(mapping.primary);
      priorityMap.set(mapping.primary, Math.max(mapping.priority, priorityMap.get(mapping.primary) || 0));
      
      // Add other specialists
      mapping.specialties.forEach(specialty => {
        professionals.add(specialty);
        priorityMap.set(specialty, Math.max(mapping.priority * 0.9, priorityMap.get(specialty) || 0));
      });
      
      // Add secondary specialists with lower priority
      mapping.secondary?.forEach(secondary => {
        professionals.add(secondary);
        priorityMap.set(secondary, Math.max(mapping.priority * 0.7, priorityMap.get(secondary) || 0));
      });
    }
  });
  
  // Sort professionals by priority and return
  return Array.from(professionals)
    .sort((a, b) => (priorityMap.get(b) || 0) - (priorityMap.get(a) || 0));
};
