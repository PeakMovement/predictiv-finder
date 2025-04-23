
import { ServiceCategory } from "./types";
import { CONDITION_TO_SERVICES } from "./serviceMappings";

// Map common symptoms/goals to relevant health conditions
const SYMPTOM_TO_CONDITION: Record<string, string[]> = {
  'weight': ['weight loss'],
  'diet': ['weight loss'],
  'nutrition': ['weight loss'],
  'blood pressure': ['hypertension'],
  'high blood pressure': ['hypertension'],
  'pressure': ['hypertension'],
  'sugar': ['diabetes'],
  'diabetes': ['diabetes'],
  'glucose': ['diabetes'],
  'breathing': ['asthma'],
  'breathe': ['asthma'],
  'inhaler': ['asthma'],
  'ankle': ['ankle sprain'],
  'sprain': ['ankle sprain'],
  'shoulder': ['shoulder strain'],
  'strain': ['shoulder strain'],
  'tired': ['chronic fatigue'],
  'fatigue': ['chronic fatigue'],
  'exhausted': ['chronic fatigue'],
  'stomach': ['stomach issues'],
  'digestive': ['stomach issues'],
  'gut': ['stomach issues'],
  'stomach pain': ['stomach issues'],
  "doesn't feel good": ['stomach issues'],
  'nausea': ['stomach issues'],
  'vomiting': ['stomach issues'],
  'diarrhea': ['stomach issues'],
  'constipation': ['stomach issues'],
  'bloating': ['stomach issues'],
  'indigestion': ['stomach issues'],
  'knee': ['knee pain'],
  'back': ['back pain'],
  'spine': ['back pain'],
  'stress': ['mental health'],
  'anxiety': ['mental health', 'anxiety'],
  'depression': ['mental health', 'depression'],
  'mental': ['mental health'],
  'sleep': ['sleep issues'],
  'insomnia': ['sleep issues'],
  'headache': ['headaches'],
  'migraine': ['headaches'],
  'joint': ['joint pain'],
  'arthritis': ['joint pain'],
  'inflammation': ['joint pain'],
  'skin': ['skin issues'],
  'rash': ['skin issues'],
  'acne': ['skin issues'],
  'eczema': ['skin issues']
};

// Map goals to service categories
const GOAL_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['dietician', 'personal-trainer', 'coaching'],
  'strength': ['personal-trainer', 'physiotherapist'],
  'muscle': ['personal-trainer', 'dietician'],
  'nutrition': ['dietician', 'coaching'],
  'recovery': ['physiotherapist', 'personal-trainer'],
  'pain management': ['physiotherapist', 'family-medicine', 'pain-management'],
  'fitness': ['personal-trainer', 'coaching'],
  'health': ['family-medicine', 'dietician'],
  'cardio': ['personal-trainer', 'coaching'],
  'energy': ['dietician', 'personal-trainer', 'endocrinology'],
  'stress': ['coaching', 'physiotherapist', 'psychiatry'],
  'performance': ['personal-trainer', 'coaching', 'physiotherapist'],
  'rehabilitation': ['physiotherapist', 'personal-trainer'],
  'endurance': ['personal-trainer', 'coaching'],
  'stomach pain': ['gastroenterology', 'family-medicine'],
  'stomach issues': ['gastroenterology', 'family-medicine'],
  'digestive problems': ['gastroenterology', 'family-medicine'],
  'anxiety': ['psychiatry', 'coaching'],
  'depression': ['psychiatry', 'coaching'],
  'mental health': ['psychiatry', 'coaching'],
  'sleep issues': ['psychiatry', 'family-medicine'],
  'headaches': ['neurology', 'family-medicine'],
  'joint pain': ['physiotherapist', 'orthopedics', 'rheumatology'],
  'skin issues': ['dermatology', 'family-medicine']
};

export const analyzeUserInput = (input: string): {
  medicalConditions: string[];
  suggestedCategories: ServiceCategory[];
  budget?: number;
  location?: string;
  preferOnline?: boolean;
} => {
  const inputLower = input.toLowerCase();
  const medicalConditions: string[] = [];
  const serviceCategories = new Set<ServiceCategory>();
  let extractedBudget: number | undefined = undefined;
  let extractedLocation: string | undefined = undefined;
  let preferOnline: boolean | undefined = undefined;

  console.log("Analyzing user input:", inputLower);

  // Extract budget from input
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/pay\s*r?\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    extractedBudget = parseInt(budgetMatches[1], 10);
    console.log("Extracted budget:", extractedBudget);
  }

  // Extract location preference
  const preferOnlineMatches = ['online', 'virtual', 'remote', 'zoom', 'teams', 'video call'];
  preferOnline = preferOnlineMatches.some(term => inputLower.includes(term));
  
  // Extract location
  const locationMatches = inputLower.match(/\bin\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+from|\s+$)/i);
  if (locationMatches && locationMatches[1]) {
    const possibleLocation = locationMatches[1].trim();
    // Filter out common non-location phrases
    const nonLocationPhrases = ['general', 'particular', 'specific', 'the area', 'mind', 'my experience'];
    if (!nonLocationPhrases.some(phrase => possibleLocation.includes(phrase))) {
      extractedLocation = possibleLocation;
      console.log("Extracted location:", extractedLocation);
    }
  }

  // Check for medical conditions from symptoms
  Object.entries(SYMPTOM_TO_CONDITION).forEach(([symptom, conditions]) => {
    if (inputLower.includes(symptom)) {
      conditions.forEach(condition => {
        if (!medicalConditions.includes(condition)) {
          medicalConditions.push(condition);
          console.log("Found condition from symptom:", condition, "from", symptom);
        }
      });
    }
  });

  // Direct condition mentions
  Object.keys(CONDITION_TO_SERVICES).forEach(condition => {
    if (inputLower.includes(condition.toLowerCase())) {
      if (!medicalConditions.includes(condition)) {
        medicalConditions.push(condition);
        console.log("Found direct condition mention:", condition);
      }
    }
  });

  // Match goals
  Object.entries(GOAL_TO_SERVICES).forEach(([goal, categories]) => {
    if (inputLower.includes(goal.toLowerCase())) {
      categories.forEach(category => {
        serviceCategories.add(category);
        console.log("Adding service from goal match:", category, "from goal:", goal);
      });
    }
  });

  // Add services from medical conditions
  medicalConditions.forEach(condition => {
    const services = CONDITION_TO_SERVICES[condition] || [];
    services.forEach(service => {
      serviceCategories.add(service);
      console.log("Adding service from condition:", service, "for condition:", condition);
    });
  });

  // Check for specific professionals mentioned
  const professionalMentions = [
    { term: 'doctor', service: 'family-medicine' },
    { term: 'physician', service: 'family-medicine' },
    { term: 'dietician', service: 'dietician' },
    { term: 'nutritionist', service: 'dietician' },
    { term: 'trainer', service: 'personal-trainer' },
    { term: 'coach', service: 'coaching' },
    { term: 'physio', service: 'physiotherapist' },
    { term: 'physiotherapist', service: 'physiotherapist' },
    { term: 'therapist', service: 'psychiatry' },
    { term: 'psychiatrist', service: 'psychiatry' },
    { term: 'psychologist', service: 'psychiatry' },
    { term: 'dermatologist', service: 'dermatology' },
    { term: 'skin doctor', service: 'dermatology' },
    { term: 'cardiologist', service: 'cardiology' },
    { term: 'heart doctor', service: 'cardiology' },
    { term: 'neurologist', service: 'neurology' },
    { term: 'gastroenterologist', service: 'gastroenterology' },
    { term: 'orthopedist', service: 'orthopedics' },
    { term: 'rheumatologist', service: 'rheumatology' }
  ];

  professionalMentions.forEach(({ term, service }) => {
    if (inputLower.includes(term)) {
      serviceCategories.add(service as ServiceCategory);
      console.log("Adding service from professional mention:", service, "from term:", term);
    }
  });

  // If stomach issues are detected, add gastroenterology
  if (medicalConditions.includes('stomach issues')) {
    serviceCategories.add('gastroenterology');
    console.log("Adding gastroenterology for stomach issues");
  }

  // If no services found, add default ones
  if (serviceCategories.size === 0 && medicalConditions.length === 0) {
    serviceCategories.add('family-medicine');
    console.log("No specific needs detected, adding default: family-medicine");
  }

  return {
    medicalConditions,
    suggestedCategories: Array.from(serviceCategories),
    budget: extractedBudget,
    location: extractedLocation,
    preferOnline
  };
};
