
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
import { expandSynonyms } from './synonymExpansion';
import { calculateConditionWeights, mapWeightsToServicePriorities, extractTimeframe } from './weightingSystem';

/**
 * Analyzes user input text to extract health needs and preferences
 * Enhanced to handle multiple conditions, timeline extraction, and professional preferences
 */
export const analyzeUserInput = (input: string): {
  medicalConditions: string[];
  suggestedCategories: ServiceCategory[];
  budget?: number;
  location?: string;
  preferOnline?: boolean;
  conditionWeights?: Record<string, { value: number; multiplier: number; reason?: string }>;
  servicePriorities?: Record<ServiceCategory, number>;
  timeframeDays?: number;
  urgencyLevel?: number;
  practitionerPreferences?: Record<string, number>; // Mapping of preferred practitioners to confidence level
  comorbidityFactors?: string[]; // Additional factors for handling multiple conditions
  goalDetails?: Record<string, any>; // Specific goal details (e.g., race distance, target weight)
} => {
  // First, expand the input with synonyms to catch more relevant terms
  const expandedInput = expandSynonyms(input);
  const inputLower = expandedInput.toLowerCase();
  
  const medicalConditions: string[] = [];
  const serviceCategories = new Set<ServiceCategory>();
  const practitionerPreferences: Record<string, number> = {};
  
  console.log("Analyzing user input:", inputLower);
  console.log("Expanded input with synonyms:", expandedInput !== input ? "yes" : "no");

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
    // Access the serviceCategory property instead of trying to add the whole object
    serviceCategories.add(service.serviceCategory);
    
    // Track practitioner preferences with confidence scores
    practitionerPreferences[service.serviceCategory] = service.confidence;
    
    console.log("Adding service from professional mention:", service.serviceCategory, 
                "with confidence:", service.confidence);
  });

  // Handle negation patterns
  handleNegationPatterns(inputLower, serviceCategories);
  
  // Handle special cases for fitness and weight loss goals
  handleSpecialCases(inputLower, serviceCategories);
  
  // Extract timeframe information - now more important per requirements
  const timeframeDays = extractTimeframe(inputLower);
  console.log("Extracted timeframe (days):", timeframeDays);
  
  // Calculate weights for conditions using our weighting system
  const { conditionWeights, urgencyLevel } = calculateConditionWeights(
    medicalConditions, 
    inputLower,
    timeframeDays
  );
  
  // Map condition weights to service priorities
  const servicePriorities = mapWeightsToServicePriorities(conditionWeights, urgencyLevel);

  // Detect goal details (like race distance, target weight)
  const goalDetails = extractGoalDetails(inputLower);
  
  // Detect comorbidity factors (interaction between multiple conditions)
  const comorbidityFactors = detectComorbidityFactors(medicalConditions, inputLower);

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
    preferOnline,
    conditionWeights,
    servicePriorities,
    timeframeDays,
    urgencyLevel,
    practitionerPreferences,
    comorbidityFactors,
    goalDetails
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
  
  // New: Race preparation special case
  if (inputLower.includes('race') || inputLower.includes('marathon') || 
      inputLower.includes('run') || inputLower.includes('10k') || 
      inputLower.includes('5k') || inputLower.includes('half marathon')) {
    serviceCategories.add('coaching');
    console.log("Race preparation detected, adding coaching services");
    
    // If timeline is mentioned with race, it's a priority
    if (inputLower.match(/race.+(\d+).+(week|day|month)/i) || 
        inputLower.match(/(\d+).+(week|day|month).+race/i)) {
      serviceCategories.add('personal-trainer');
      console.log("Time-sensitive race preparation, adding personal trainer");
    }
  }
}

/**
 * Extracts specific details about the user's goals
 */
function extractGoalDetails(inputLower: string): Record<string, any> {
  const goalDetails: Record<string, any> = {};
  
  // Extract weight loss targets
  const weightLossMatch = inputLower.match(/lose\s+(\d+)\s*(kg|kgs|pounds|lbs)/i);
  if (weightLossMatch) {
    const amount = parseInt(weightLossMatch[1]);
    const unit = weightLossMatch[2].toLowerCase();
    goalDetails.weightLoss = {
      amount,
      unit: unit.startsWith('k') ? 'kg' : 'lbs'
    };
    console.log(`Detected weight loss goal: ${amount} ${goalDetails.weightLoss.unit}`);
  }
  
  // Extract running distance goals
  const raceDistanceMatch = inputLower.match(/(5k|10k|21k|42k|half marathon|marathon|ultra)/i);
  if (raceDistanceMatch) {
    goalDetails.raceDistance = raceDistanceMatch[1].toLowerCase();
    console.log(`Detected race distance: ${goalDetails.raceDistance}`);
  }
  
  // Extract specific pain intensity if mentioned
  const painIntensityMatch = inputLower.match(/(mild|moderate|severe|extreme|unbearable)\s+pain/i);
  if (painIntensityMatch) {
    goalDetails.painIntensity = painIntensityMatch[1].toLowerCase();
    console.log(`Detected pain intensity: ${goalDetails.painIntensity}`);
  }
  
  return goalDetails;
}

/**
 * Identifies factors related to multiple conditions that may interact
 */
function detectComorbidityFactors(conditions: string[], inputLower: string): string[] {
  const comorbidityFactors: string[] = [];
  
  // Only check for comorbidity with multiple conditions
  if (conditions.length > 1) {
    console.log("Multiple conditions detected, checking for comorbidity factors");
    
    // Check for conditions that may compound each other
    if ((conditions.includes('knee pain') || conditions.includes('joint pain')) && 
        conditions.includes('weight loss')) {
      comorbidityFactors.push('weight-joint-interaction');
      console.log("Detected comorbidity: weight and joint pain");
    }
    
    // Mental and physical health interaction
    if ((conditions.includes('anxiety') || conditions.includes('depression') || 
         conditions.includes('stress')) && 
        (conditions.includes('back pain') || conditions.includes('knee pain'))) {
      comorbidityFactors.push('mental-physical-interaction');
      console.log("Detected comorbidity: mental health and physical pain");
    }
    
    // Digestive and fitness goal interaction
    if ((conditions.includes('stomach issues') || 
         conditions.includes('digestive problems')) &&
        (conditions.includes('fitness goals') || conditions.includes('weight loss'))) {
      comorbidityFactors.push('digestive-fitness-interaction');
      console.log("Detected comorbidity: digestive issues and fitness goals");
    }
  }
  
  // Check urgency language even with single condition
  if (inputLower.includes('urgent') || inputLower.includes('immediately') || 
      inputLower.includes('asap') || inputLower.includes('emergency')) {
    comorbidityFactors.push('urgent-care-needed');
    console.log("Detected urgent care need");
  }
  
  return comorbidityFactors;
}
