
import { ServiceCategory } from "../types";
import { 
  extractBudget,
  detectBudgetConstraints
} from './budgetExtractor';
import {
  extractLocation,
  detectOnlinePreference
} from './locationExtractor';
import {
  findMedicalConditionsFromSymptoms,
  SYMPTOM_TO_CONDITION
} from './conditionExtractor';
import {
  mapGoalsToCategories,
  GOAL_TO_SERVICES
} from './goalExtractor';
import { CONDITION_TO_SERVICES } from "../serviceMappings";
import { detectProfessionalMentions } from './professionalMentions';

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
  
  console.log("Analyzing user input:", inputLower);

  // Extract budget constraints
  const extractedBudget = extractBudget(inputLower);
  
  // Extract location preference and online preference
  const { extractedLocation, preferOnline } = extractLocation(inputLower);
  
  // Find medical conditions from symptoms
  const detectedConditions = findMedicalConditionsFromSymptoms(inputLower);
  detectedConditions.forEach(condition => {
    if (!medicalConditions.includes(condition)) {
      medicalConditions.push(condition);
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

  // Add services from goals
  mapGoalsToCategories(inputLower, serviceCategories);
  
  // Add services from medical conditions
  medicalConditions.forEach(condition => {
    const services = CONDITION_TO_SERVICES[condition] || [];
    services.forEach(service => {
      serviceCategories.add(service);
      console.log("Adding service from condition:", service, "for condition:", condition);
    });
  });

  // Check for specific professionals mentioned
  const professionalServices = detectProfessionalMentions(inputLower);
  professionalServices.forEach(service => {
    serviceCategories.add(service);
  });

  // Handle negation patterns
  handleNegationPatterns(inputLower, serviceCategories);
  
  // Special handling for fitness and weight loss goals
  handleSpecialCases(inputLower, serviceCategories);

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

// Helper function for handling negation patterns
function handleNegationPatterns(inputLower: string, serviceCategories: Set<ServiceCategory>): void {
  const negationPatterns = [
    { pattern: /can['']?t afford (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /(no|not) (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /without (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' }
  ];
  
  negationPatterns.forEach(({ pattern, type }) => {
    const matches = inputLower.match(pattern);
    if (matches) {
      const negatedTerm = matches[matches.length - 1].toLowerCase();
      
      // Check if the negated term refers to a professional
      if (negatedTerm.includes('trainer') || negatedTerm.includes('coach')) {
        // If user says they can't afford a trainer, ensure we don't exclude it but prioritize cost-effective options
        // We'll still include it but flag it for budget consideration
        serviceCategories.add('personal-trainer');
        console.log("User mentioned can't afford trainer, but we'll include budget-friendly options");
      }
    }
  });
}

// Helper function for special cases
function handleSpecialCases(inputLower: string, serviceCategories: Set<ServiceCategory>): void {
  // Special handling for fitness, weight loss and toning goals
  if (inputLower.includes('lose weight') || inputLower.includes('tone') || 
      inputLower.includes('kg') || inputLower.includes('toning') ||
      inputLower.includes('train') || inputLower.includes('fitness')) {
    console.log("Adding personal trainer and dietician based on fitness/weight goals");
    serviceCategories.add('personal-trainer');
    serviceCategories.add('dietician');
  }

  // Wedding preparation is almost always fitness + nutrition focused
  if (inputLower.includes('wedding')) {
    console.log("Wedding preparation detected, adding fitness and nutrition services");
    serviceCategories.add('personal-trainer');
    serviceCategories.add('dietician');
  }

  // If user explicitly mentions "program" or "on my own", they want self-guided options
  if (inputLower.includes('program') || inputLower.includes('on my own')) {
    console.log("User wants self-guided program, adding personal trainer");
    serviceCategories.add('personal-trainer');
  }

  // If stomach issues are detected, add gastroenterology
  if (inputLower.includes('stomach') || inputLower.includes('digestive') || 
      inputLower.includes('gut') || inputLower.includes("doesn't feel good")) {
    serviceCategories.add('gastroenterology');
    console.log("Adding gastroenterology for stomach issues");
  }
}
