
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
  'asthma': ['asthma'],
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
  'spine': ['back pain']
};

// Map goals to service categories
const GOAL_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['dietician', 'personal-trainer', 'coaching'],
  'strength': ['personal-trainer', 'physiotherapist'],
  'muscle': ['personal-trainer', 'dietician'],
  'nutrition': ['dietician', 'coaching'],
  'recovery': ['physiotherapist', 'personal-trainer'],
  'pain management': ['physiotherapist', 'family-medicine'],
  'fitness': ['personal-trainer', 'coaching'],
  'health': ['family-medicine', 'dietician'],
  'cardio': ['personal-trainer', 'coaching'],
  'energy': ['dietician', 'personal-trainer', 'endocrinology'],
  'stress': ['coaching', 'physiotherapist'],
  'performance': ['personal-trainer', 'coaching', 'physiotherapist'],
  'rehabilitation': ['physiotherapist', 'personal-trainer'],
  'endurance': ['personal-trainer', 'coaching'],
  'stomach pain': ['gastroenterology', 'family-medicine'],
  'stomach issues': ['gastroenterology', 'family-medicine'],
  'digestive problems': ['gastroenterology', 'family-medicine']
};

export const analyzeUserInput = (input: string): {
  medicalConditions: string[];
  suggestedCategories: ServiceCategory[];
  budget?: number;
} => {
  const inputLower = input.toLowerCase();
  const medicalConditions: string[] = [];
  const serviceCategories = new Set<ServiceCategory>();
  let extractedBudget: number | undefined = undefined;

  // Extract budget from input
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                          inputLower.match(/pay\s*r\s*(\d+)/i) || 
                          inputLower.match(/budget.*?(\d+)/i) ||
                          inputLower.match(/afford.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    extractedBudget = parseInt(budgetMatches[1], 10);
  }

  // Check for medical conditions from symptoms
  Object.entries(SYMPTOM_TO_CONDITION).forEach(([symptom, conditions]) => {
    if (inputLower.includes(symptom)) {
      conditions.forEach(condition => {
        if (!medicalConditions.includes(condition)) {
          medicalConditions.push(condition);
        }
      });
    }
  });

  // Direct condition mentions
  Object.keys(CONDITION_TO_SERVICES).forEach(condition => {
    if (inputLower.includes(condition.toLowerCase())) {
      if (!medicalConditions.includes(condition)) {
        medicalConditions.push(condition);
      }
    }
  });

  // Match goals
  Object.entries(GOAL_TO_SERVICES).forEach(([goal, categories]) => {
    if (inputLower.includes(goal.toLowerCase())) {
      categories.forEach(category => serviceCategories.add(category));
    }
  });

  // Add services from medical conditions
  medicalConditions.forEach(condition => {
    const services = CONDITION_TO_SERVICES[condition] || [];
    services.forEach(service => serviceCategories.add(service));
  });

  // Check if user explicitly mentions doctor
  if (inputLower.includes('doctor') || inputLower.includes('physician')) {
    serviceCategories.add('family-medicine');
    
    // If stomach issues are detected, add gastroenterology
    if (medicalConditions.includes('stomach issues')) {
      serviceCategories.add('gastroenterology');
    }
  }

  // If no services found, add default ones
  if (serviceCategories.size === 0 && medicalConditions.length === 0) {
    serviceCategories.add('family-medicine');
  }

  return {
    medicalConditions,
    suggestedCategories: Array.from(serviceCategories),
    budget: extractedBudget
  };
};
