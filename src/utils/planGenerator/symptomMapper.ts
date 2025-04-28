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
  
  // Mental Health & Psychology
  "anxiety": {
    primary: "coaching",
    specialties: ["coaching", "dietician"],
    priority: 0.9,
    keywords: [
      "anxious", "worry", "nervous", "stress", "panic", "fear", 
      "overwhelmed", "overthinking", "can't relax", "on edge", 
      "racing thoughts", "mental health", "anxiety attack"
    ],
    secondary: ["psychiatry"],
    contraindications: ["physiotherapist", "orthopedics"]
  },
  "mental health": {
    primary: "coaching",
    specialties: ["coaching", "psychiatry"],
    priority: 0.85,
    keywords: [
      "depression", "mood", "therapy", "counseling", "trauma", 
      "emotional", "mental", "psychological", "stress", "burnout"
    ],
    secondary: ["dietician"],
    contraindications: ["physiotherapist", "orthopedics"]
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
    priority: 0.9,
    secondary: ["coaching"],
    keywords: [
      "eat", "eating", "diet", "food", "nutrition", "meal", "meals",
      "healthy eating", "balanced diet", "macros", "macronutrients",
      "appetite", "hunger", "nutrients", "struggling to eat", "not eating",
      "poor appetite", "meal planning", "nutrition plan"
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
      "food intolerance", "GERD", "acid reflux", "appetite", "nauseous"
    ],
    contraindications: ["personal-trainer", "physiotherapist"]
  },
  
  // Event Preparation
  "race preparation": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "coaching"],
    priority: 0.95,
    secondary: ["dietician"],
    keywords: [
      "race", "run", "running", "marathon", "half marathon", "5k", "10k", 
      "training for race", "prepare for race", "upcoming race", "competition",
      "event", "preparing", "race day", "starting line", "finish line",
      "race prep", "weeks until race", "race training"
    ],
    contraindications: ["physiotherapist", "orthopedics"]
  },
  
  "event preparation": {
    primary: "personal-trainer",
    specialties: ["personal-trainer", "coaching"],
    priority: 0.85,
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
  
  // Special detection for mental health + nutrition + race preparation
  const mentalHealthKeywords = ["anxiety", "anxious", "mental health", "stress", "nervous", "worry"];
  const nutritionKeywords = ["eat", "eating", "diet", "food", "appetite", "meal", "nutrition", "hungry"];
  const raceKeywords = ["race", "run", "running", "marathon", "half marathon", "5k", "10k", "weeks until"];
  
  // Check for mental health + nutrition combination
  let hasAnxiety = false;
  let hasNutrition = false;
  let hasRace = false;
  
  for (const keyword of mentalHealthKeywords) {
    if (inputLower.includes(keyword)) {
      hasAnxiety = true;
      if (!symptoms.includes("anxiety")) {
        symptoms.push("anxiety");
        priorities["anxiety"] = SYMPTOM_MAPPINGS["anxiety"].priority;
        console.log(`Found mental health symptom: anxiety`);
      }
      break;
    }
  }
  
  for (const keyword of nutritionKeywords) {
    if (inputLower.includes(keyword)) {
      hasNutrition = true;
      if (!symptoms.includes("nutrition")) {
        symptoms.push("nutrition");
        priorities["nutrition"] = SYMPTOM_MAPPINGS["nutrition"].priority;
        console.log(`Found nutrition concern`);
      }
      break;
    }
  }
  
  for (const keyword of raceKeywords) {
    if (inputLower.includes(keyword)) {
      hasRace = true;
      if (!symptoms.includes("race preparation")) {
        symptoms.push("race preparation");
        // Give race preparation higher priority when explicitly mentioned
        priorities["race preparation"] = SYMPTOM_MAPPINGS["race preparation"].priority * 1.2;
        console.log(`Found race preparation need`);
      }
      break;
    }
  }
  
  // Special case: anxiety + eating issues + race preparation
  if (hasAnxiety && hasNutrition && hasRace) {
    // Boost priority for dietician and coaching
    priorities["nutrition"] = (priorities["nutrition"] || 0) * 1.3;
    priorities["anxiety"] = (priorities["anxiety"] || 0) * 1.2;
    priorities["race preparation"] = (priorities["race preparation"] || 0) * 1.2;
    
    // Add contraindications for physiotherapy
    if (!contraindications.includes("physiotherapist" as ServiceCategory)) {
      contraindications.push("physiotherapist" as ServiceCategory);
      contraindications.push("biokineticist" as ServiceCategory);
    }
    
    console.log("Found special case: anxiety + nutrition + race preparation");
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

  // Check for timeframes
  const weekMatches = inputLower.match(/(\d+)\s*weeks?/i);
  if (weekMatches && parseInt(weekMatches[1], 10) <= 4) {
    // Short timeframe (4 weeks or less) - prioritize coaching and specialized training
    console.log("Short timeframe detected, prioritizing rapid expertise");
    if (!symptoms.includes("race preparation")) {
      symptoms.push("race preparation");
      priorities["race preparation"] = 1.0; // Highest priority for short timeframe events
    }
  }
  
  // If no symptoms found, add some defaults
  if (symptoms.length === 0) {
    symptoms.push("general health");
    priorities["general health"] = SYMPTOM_MAPPINGS["general health"]?.priority || 0.5;
  }

  return { symptoms, priorities, contraindications };
};

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
  
  // Special case for anxiety + eating + race prep
  if (symptoms.includes("anxiety") && symptoms.includes("nutrition") && 
      (symptoms.includes("race preparation") || symptoms.includes("event preparation"))) {
    
    // Ensure dietician is prioritized for eating issues with anxiety
    categories.add("dietician");
    categoryPriorities["dietician"] = Math.max(categoryPriorities["dietician"] || 0, 0.95);
    
    // Ensure personal trainer is there for race prep
    categories.add("personal-trainer");
    categoryPriorities["personal-trainer"] = Math.max(categoryPriorities["personal-trainer"] || 0, 0.9);
    
    // Add coaching for anxiety support
    categories.add("coaching");
    categoryPriorities["coaching"] = Math.max(categoryPriorities["coaching"] || 0, 0.85);
    
    // Explicitly remove physiotherapy if not needed
    categories.delete("physiotherapist");
    delete categoryPriorities["physiotherapist"];
    
    console.log("Optimized profile for anxiety + nutrition + race preparation");
  }
  
  // Remove contraindicated categories
  contraindications.forEach(category => {
    categories.delete(category);
    delete categoryPriorities[category];
  });
  
  // If no categories found, add default
  if (categories.size === 0) {
    categories.add('dietician');
    categoryPriorities['dietician'] = 0.8;
    
    categories.add('personal-trainer');
    categoryPriorities['personal-trainer'] = 0.7;
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
