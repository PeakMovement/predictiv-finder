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
      "bloated", "bloating", "upset stomach",
      "abdominal", "belly", "gut", "tummy",
      "burning", "sharp pain", "dull pain"
    ]
  },
  "nausea": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "family-medicine"],
    priority: 0.9,
    keywords: [
      "sick", "vomit", "throwing up",
      "queasy", "nauseous", "upset stomach",
      "morning sickness", "dizzy", "woozy"
    ]
  },
  "indigestion": {
    primary: "gastroenterology",
    specialties: ["gastroenterology", "family-medicine", "dietician"],
    priority: 0.8,
    keywords: [
      "heartburn", "acid", "reflux", "burning",
      "difficulty digesting", "upset stomach",
      "after eating", "stomach ache", "dyspepsia"
    ]
  },
  
  // Musculoskeletal System
  "back pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.9,
    secondary: ["orthopedics"],
    keywords: [
      "sore back", "backache", "spinal",
      "lower back", "upper back", "spine",
      "stiff back", "pulled muscle", "herniated",
      "sciatica", "lumbar", "thoracic"
    ]
  },
  "joint pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.8,
    secondary: ["orthopedics", "rheumatology"],
    keywords: [
      "arthritis", "stiff joints", "swelling",
      "knee pain", "ankle pain", "hip pain",
      "shoulder pain", "elbow pain", "wrist pain",
      "inflammation", "rheumatic", "gout"
    ]
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
    priority: 0.7,
    keywords: [
      "anxious", "worried", "overwhelmed",
      "burnout", "tension", "pressure",
      "mental pressure", "stressed out",
      "can't cope", "exhausted", "mental fatigue"
    ]
  },
  "anxiety": {
    primary: "psychiatry",
    specialties: ["psychiatry"],
    priority: 0.8,
    keywords: [
      "panic", "worry", "nervousness",
      "fear", "phobia", "social anxiety",
      "racing thoughts", "restless", "uneasy",
      "on edge", "nervous"
    ]
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
