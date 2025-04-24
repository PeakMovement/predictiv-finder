
import { ServiceCategory } from "./types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  priority: number;
  secondary?: ServiceCategory[];
  keywords?: string[];
  context?: string[];
  contraindications?: string[];
}

export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  // Musculoskeletal Issues
  "pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "pain-management"],
    priority: 1.0,
    keywords: [
      "hurt", "hurting", "ache", "aching", "sore", "soreness",
      "injury", "injured", "pulled", "strained", "sprain",
      "discomfort", "stiffness", "tight", "tightness"
    ],
    context: [
      "shoulder", "knee", "back", "hip", "elbow", "wrist", "ankle",
      "neck", "joint", "muscle", "tendon", "spine", "spinal"
    ]
  },
  "shoulder pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.95,
    keywords: [
      "shoulder", "rotator cuff", "impingement", "overhead", "press", 
      "bench", "lifting", "overhead press", "shoulder press", "bench press",
      "can't lift", "can't raise", "shoulder injury"
    ],
    contraindications: ["dietician", "coaching"]
  },
  "knee pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "orthopedics"],
    priority: 0.95,
    keywords: [
      "knee", "patella", "acl", "mcl", "meniscus", "running pain", "squats",
      "can't bend", "knee injury", "knee cap", "kneecap"
    ],
    contraindications: ["dietician", "coaching"]
  },
  "back pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.95,
    secondary: ["orthopedics", "personal-trainer"],
    keywords: [
      "sore back", "backache", "spinal", "lower back", "upper back", "spine",
      "stiff back", "pulled muscle", "herniated", "disc", "disk",
      "sciatica", "lumbar", "thoracic", "back injury", "slipped disc",
      "lumbago", "can't bend", "can't stand straight", "back hurts"
    ],
    context: ["sitting", "desk", "office", "posture", "ergonomic", "desk job"]
  },
  "neck pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist"],
    priority: 0.9,
    keywords: [
      "stiff neck", "neck injury", "whiplash", "cervical", "can't turn head",
      "neck stiffness", "trap pain", "trapezius", "cervical spine"
    ],
    context: ["desk", "pillow", "sleep", "computer", "posture", "phone", "text neck"]
  },
  "joint pain": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "rheumatology"],
    priority: 0.85,
    secondary: ["orthopedics"],
    keywords: [
      "arthritis", "stiff joints", "swelling", "inflamed", "inflammation",
      "rheumatic", "gout", "joints", "joint stiffness"
    ]
  },
  
  // Sports & Specific Injuries
  "sports injury": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "personal-trainer"],
    priority: 0.9,
    keywords: [
      "sports", "injury", "game", "match", "competition", "race", "tournament",
      "pulled muscle", "strain", "sprain", "torn", "rupture"
    ]
  },
  "recovery": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "biokineticist", "personal-trainer"],
    priority: 0.7,
    keywords: [
      "recover", "healing", "rest", "recuperate", "rehab", "rehabilitation",
      "sore", "doms", "delayed onset muscle soreness", "tight muscles"
    ]
  },
  
  // Fitness & Strength Goals
  "strength": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "biokineticist"],
    priority: 0.8,
    keywords: [
      "strong", "stronger", "strength", "build muscle", "hypertrophy",
      "gain muscle", "toning", "toned", "lifting", "weights", "resistance",
      "powerful", "power", "buff", "bulking", "muscles"
    ]
  },
  "fitness": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "biokineticist"],
    priority: 0.75,
    secondary: ["coaching"],
    keywords: [
      "fit", "fitter", "fitness", "cardio", "endurance", "stamina",
      "conditioning", "workout", "exercise", "training", "gym", "sculpt"
    ]
  },
  "weight management": {
    primary: "dietician",
    specialties: ["dietician", "personal-trainer"],
    priority: 0.85,
    secondary: ["coaching"],
    keywords: [
      "lose weight", "weight loss", "fat loss", "slim down", "get leaner",
      "drop kilos", "shed kilos", "burn fat", "calorie deficit", "diet",
      "eating plan", "nutrition plan", "meal plan"
    ]
  },
  
  // Nutrition & Digestive Issues
  "nutrition": {
    primary: "dietician",
    specialties: ["dietician"],
    priority: 0.85,
    secondary: ["coaching"],
    keywords: [
      "eat", "eating", "diet", "food", "nutrition", "meal", "meals",
      "healthy eating", "balanced diet", "macros", "macronutrients"
    ]
  },
  "digestive issues": {
    primary: "dietician",
    specialties: ["dietician", "gastroenterology"],
    priority: 0.9,
    keywords: [
      "bloating", "bloated", "gas", "constipation", "diarrhea", "IBS",
      "irritable bowel", "gut health", "digestive", "indigestion",
      "stomach pain", "stomach issues", "abdominal", "gut discomfort",
      "food intolerance", "GERD", "acid reflux"
    ],
    contraindications: ["personal-trainer", "physiotherapist"]
  },
  
  // Mental Health & Wellness
  "stress": {
    primary: "coaching",
    specialties: ["coaching", "psychiatry"],
    priority: 0.7,
    keywords: [
      "anxious", "worried", "overwhelmed", "burnout", "tension", "pressure",
      "mental pressure", "stressed out", "can't cope", "exhausted", "mental fatigue",
      "anxiety", "anxious", "panic", "stress management"
    ]
  },
  "sleep issues": {
    primary: "coaching",
    specialties: ["coaching", "psychiatry"],
    priority: 0.75,
    keywords: [
      "insomnia", "can't sleep", "trouble sleeping", "sleep quality",
      "waking up", "tired", "fatigue", "exhausted", "sleep hygiene",
      "rest", "recovery", "energy levels", "waking up tired"
    ],
    secondary: ["dietician"]
  },
  
  // Event Preparation
  "event preparation": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "coaching"],
    priority: 0.8,
    secondary: ["dietician", "physiotherapist"],
    keywords: [
      "marathon", "race", "competition", "event", "tournament", "match",
      "prep", "prepare", "training for", "getting ready", "upcoming",
      "run", "running", "cycling", "swim", "triathlon", "ironman", "comrades",
      "half marathon", "10k", "5k", "sports event"
    ]
  },
  
  // General Health
  "general health": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine"],
    priority: 0.6,
    keywords: [
      "health", "check-up", "medical", "doctor", "physician",
      "general practitioner", "GP", "wellness", "illness", "sick"
    ]
  },
  "fatigue": {
    primary: "family-medicine",
    specialties: ["family-medicine", "internal-medicine", "dietician"],
    priority: 0.75,
    secondary: ["endocrinology"],
    keywords: [
      "tired", "exhausted", "no energy", "lethargic", "sluggish",
      "worn out", "drained", "fatigue", "chronic fatigue"
    ]
  },
  
  // Special contexts
  "desk job": {
    primary: "physiotherapist",
    specialties: ["physiotherapist", "personal-trainer"],
    priority: 0.7,
    keywords: [
      "desk", "office", "sitting", "computer", "ergonomic", 
      "posture", "sedentary", "office worker", "desk worker"
    ]
  },
  "student": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "dietician"],
    priority: 0.5,
    keywords: [
      "student", "university", "college", "studies", "studying",
      "exams", "academic", "campus", "school", "varsity"
    ]
  },
  "busy lifestyle": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "coaching"],
    priority: 0.6,
    keywords: [
      "busy", "no time", "hectic", "schedule", "time-poor",
      "efficient", "quick", "fast", "short sessions", "on the go"
    ]
  },
  "affordable": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "coaching"],
    priority: 0.4,
    keywords: [
      "affordable", "budget", "cheap", "cost-effective", "low cost",
      "inexpensive", "reasonable price", "economical", "tight budget",
      "money", "financial", "can't afford", "expensive", "price"
    ]
  }
};

// More sophisticated symptom identification with context awareness
export const identifySymptoms = (userInput: string): { 
  symptoms: string[], 
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
} => {
  const symptoms: string[] = [];
  const priorities: Record<string, number> = {};
  const contraindications: ServiceCategory[] = [];
  const inputLower = userInput.toLowerCase();
  const words = inputLower.split(/\s+/);
  
  console.log("Identifying symptoms from:", inputLower);
  
  // Check for specific body parts mentioned with pain keywords
  const painKeywords = ["pain", "ache", "hurt", "injury", "sore", "tight", "stiff"];
  const bodyParts = ["shoulder", "knee", "back", "neck", "hip", "elbow", "wrist", "ankle", "joint"];
  
  for (const bodyPart of bodyParts) {
    if (inputLower.includes(bodyPart)) {
      // Check if there's a pain keyword within 5 words of the body part
      const bodyPartIndex = words.findIndex(w => w.includes(bodyPart));
      if (bodyPartIndex >= 0) {
        const start = Math.max(0, bodyPartIndex - 5);
        const end = Math.min(words.length, bodyPartIndex + 5);
        
        for (let i = start; i < end; i++) {
          if (painKeywords.some(pk => words[i].includes(pk))) {
            const specificSymptom = `${bodyPart} pain`;
            if (!symptoms.includes(specificSymptom) && SYMPTOM_MAPPINGS[specificSymptom]) {
              symptoms.push(specificSymptom);
              priorities[specificSymptom] = SYMPTOM_MAPPINGS[specificSymptom].priority * 1.2; // Boost specific matches
              
              // Add contraindications
              SYMPTOM_MAPPINGS[specificSymptom].contraindications?.forEach(category => {
                if (!contraindications.includes(category)) {
                  contraindications.push(category);
                }
              });
              
              console.log(`Found specific symptom: ${specificSymptom}`);
            }
          }
        }
      }
    }
  }
  
  // General mappings check
  Object.entries(SYMPTOM_MAPPINGS).forEach(([symptom, mapping]) => {
    const hasMainKeyword = inputLower.includes(symptom.toLowerCase());
    let hasRelatedKeyword = false;
    let hasContextKeyword = false;
    
    // Check for any related keywords
    if (mapping.keywords) {
      hasRelatedKeyword = mapping.keywords.some(keyword => inputLower.includes(keyword.toLowerCase()));
    }
    
    // Check for context keywords if available
    if (mapping.context) {
      hasContextKeyword = mapping.context.some(context => inputLower.includes(context.toLowerCase()));
    }
    
    // Add symptom if we have a direct match or (related keyword and context)
    if (hasMainKeyword || (hasRelatedKeyword && (hasContextKeyword || !mapping.context))) {
      if (!symptoms.includes(symptom)) {
        symptoms.push(symptom);
        priorities[symptom] = mapping.priority;
        
        // Add contraindications
        mapping.contraindications?.forEach(category => {
          if (!contraindications.includes(category)) {
            contraindications.push(category);
          }
        });
        
        console.log(`Found symptom: ${symptom} (priority: ${mapping.priority})`);
      }
    }
  });

  // Special handling for injury + specifics
  if ((inputLower.includes("injury") || inputLower.includes("hurt")) && 
      (inputLower.includes("gym") || inputLower.includes("training") || 
       inputLower.includes("workout") || inputLower.includes("exercise"))) {
    
    if (!symptoms.includes("sports injury")) {
      symptoms.push("sports injury");
      priorities["sports injury"] = SYMPTOM_MAPPINGS["sports injury"].priority * 1.1;
      console.log("Found sports injury context");
    }
  }
  
  // Special case for desk-related issues
  if ((inputLower.includes("desk") || inputLower.includes("sitting") || 
       inputLower.includes("office") || inputLower.includes("computer")) &&
      (inputLower.includes("pain") || inputLower.includes("posture") || 
       inputLower.includes("stiff") || inputLower.includes("ache"))) {
    
    if (!symptoms.includes("desk job")) {
      symptoms.push("desk job");
      priorities["desk job"] = SYMPTOM_MAPPINGS["desk job"].priority;
      console.log("Found desk job context");
    }
  }
  
  // Check for budget constraints
  if (inputLower.includes("affordable") || inputLower.includes("budget") ||
      inputLower.includes("cheap") || inputLower.includes("cost") || 
      inputLower.includes("expensive") || inputLower.includes("price") ||
      inputLower.includes("money") || inputLower.includes("financial")) {
    
    if (!symptoms.includes("affordable")) {
      symptoms.push("affordable");
      priorities["affordable"] = SYMPTOM_MAPPINGS["affordable"].priority;
      console.log("Found budget constraints");
    }
  }
  
  // Check for busy lifestyle
  if (inputLower.includes("busy") || inputLower.includes("no time") ||
      inputLower.includes("hectic") || inputLower.includes("schedule") ||
      inputLower.includes("quick") || inputLower.includes("fast")) {
    
    if (!symptoms.includes("busy lifestyle")) {
      symptoms.push("busy lifestyle");
      priorities["busy lifestyle"] = SYMPTOM_MAPPINGS["busy lifestyle"].priority;
      console.log("Found busy lifestyle context");
    }
  }

  return { symptoms, priorities, contraindications };
};

// Get professionals for specific symptoms with smarter prioritization
export const getProfessionalsForSymptoms = (
  userInput: string
): { 
  categories: ServiceCategory[],
  priorities: Record<ServiceCategory, number>,
  contraindicated: ServiceCategory[]
} => {
  const { symptoms, priorities: symptomPriorities, contraindications } = identifySymptoms(userInput);
  const categories = new Set<ServiceCategory>();
  const categoryPriorities: Record<ServiceCategory, number> = {};
  
  // Process symptoms and add relevant professionals
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (mapping) {
      // Add primary specialist with highest priority
      categories.add(mapping.primary);
      const symptomPriority = symptomPriorities[symptom] || mapping.priority;
      categoryPriorities[mapping.primary] = Math.max(
        symptomPriority, 
        categoryPriorities[mapping.primary] || 0
      );
      
      // Add other specialists with slightly lower priority
      mapping.specialties.forEach(specialty => {
        categories.add(specialty);
        categoryPriorities[specialty] = Math.max(
          symptomPriority * 0.9, 
          categoryPriorities[specialty] || 0
        );
      });
      
      // Add secondary specialists with even lower priority
      mapping.secondary?.forEach(secondary => {
        categories.add(secondary);
        categoryPriorities[secondary] = Math.max(
          symptomPriority * 0.7, 
          categoryPriorities[secondary] || 0
        );
      });
    }
  });
  
  // Remove contraindicated categories
  contraindications.forEach(category => {
    categories.delete(category);
    delete categoryPriorities[category];
  });
  
  // If no categories found, add default
  if (categories.size === 0) {
    categories.add('family-medicine');
    categoryPriorities['family-medicine'] = 0.5;
  }
  
  // Sort by priority
  const sortedCategories = Array.from(categories)
    .sort((a, b) => (categoryPriorities[b] || 0) - (categoryPriorities[a] || 0));
  
  return { 
    categories: sortedCategories, 
    priorities: categoryPriorities,
    contraindicated: contraindications
  };
};
