
import { AIHealthPlan, ServiceCategory } from '@/types';
import { analyzeUserInput } from './inputAnalyzer';
import { findAlternativeCategories } from './categoryMatcher';
import { AnalyzedInput, PlanNote } from './enhancedTypes';
import { expandSynonyms } from './inputAnalyzer/synonymExpansion';

// Enhanced keyword extraction
const SEVERITY_KEYWORDS: Record<string, number> = {
  'severe': 0.9,
  'serious': 0.85,
  'bad': 0.7,
  'terrible': 0.9,
  'worst': 1.0,
  'chronic': 0.8,
  'extreme': 0.9,
  'intense': 0.8,
  'mild': 0.4,
  'moderate': 0.6,
  'slight': 0.3,
  'little': 0.2,
  'minor': 0.3,
  'excruciating': 0.95,
  'unbearable': 0.95,
  'debilitating': 0.9,
  'crippling': 0.9,
  'aggravating': 0.7,
  'nagging': 0.6,
  'constant': 0.8,
  'intermittent': 0.5,
  'occasional': 0.4,
  'acute': 0.8,
  'persistent': 0.75,
  'struggling': 0.7,
  'difficulty': 0.65
};

// Lifestyle and preference keywords
const PREFERENCE_KEYWORDS: Record<string, Record<string, string>> = {
  'student': { occupation: 'student', budget: 'limited' },
  'university': { occupation: 'student', budget: 'limited' },
  'college': { occupation: 'student', budget: 'limited' },
  'varsity': { occupation: 'student', budget: 'limited' },
  'work': { occupation: 'professional', schedule: 'restricted' },
  'job': { occupation: 'professional', schedule: 'restricted' },
  'professional': { occupation: 'professional' },
  'busy': { schedule: 'busy' },
  'no time': { schedule: 'busy' },
  'hectic': { schedule: 'busy' },
  'morning': { preferredTime: 'morning' },
  'evening': { preferredTime: 'evening' },
  'weekend': { preferredTime: 'weekend' },
  'budget': { budgetConstraint: 'tight' },
  'afford': { budgetConstraint: 'tight' },
  'cheap': { budgetConstraint: 'tight' },
  'expensive': { budgetConstraint: 'tight', budget: 'limited' },
  'cost': { budgetConstraint: 'tight' },
  'vegan': { diet: 'vegan' },
  'vegetarian': { diet: 'vegetarian' },
  'gluten': { diet: 'gluten-free' },
  'online': { delivery: 'online' },
  'virtual': { delivery: 'online' },
  'remote': { delivery: 'online' },
  'in person': { delivery: 'in-person' },
  'face to face': { delivery: 'in-person' },
  'at home': { location: 'home' },
  'at gym': { location: 'gym' },
  'office': { location: 'office' },
  'race': { goal: 'race preparation' },
  'marathon': { goal: 'race preparation' },
  'run': { goal: 'running' },
  'anxiety': { mentalHealth: 'anxiety' },
  'anxious': { mentalHealth: 'anxiety' },
  'nervous': { mentalHealth: 'anxiety' },
  // Additional preference keywords
  'insurance': { paymentMethod: 'insurance' },
  'medical aid': { paymentMethod: 'medical aid' },
  'afternoon': { preferredTime: 'afternoon' },
  'night': { preferredTime: 'evening' },
  'female': { practitionerGender: 'female' },
  'male': { practitionerGender: 'male' },
  'woman': { practitionerGender: 'female' },
  'man': { practitionerGender: 'male' },
  'experienced': { practitionerExperience: 'experienced' },
  'specialist': { practitionerExperience: 'specialist' },
  'senior': { practitionerExperience: 'experienced' },
  'yoga': { approach: 'holistic' },
  'holistic': { approach: 'holistic' },
  'quick': { approach: 'efficient' },
  'fast': { approach: 'efficient' },
  'gentle': { approach: 'gentle' },
  'careful': { approach: 'gentle' }
};

// Time availability keywords
const TIME_AVAILABILITY: Record<string, number> = {
  'once a week': 1,
  'twice a week': 2,
  'three times a week': 3, 
  'four times a week': 4,
  'every day': 7,
  'every other day': 3.5
};

export interface FrequencyPreference {
  minFrequency: number; // sessions per week
  maxFrequency: number; // sessions per week
  totalSessions: number; // recommended total sessions
}

/**
 * Enhanced analysis of user input to extract detailed information
 * @param input User's input text
 * @returns Structured analysis with extracted details and follow-up questions if needed
 */
export const enhancedAnalyzeUserInput = (input: string): AnalyzedInput & {
  followUpQuestions?: string[];
  missingFields?: string[];
} => {
  // First, expand the input with synonyms to catch more relevant terms
  const expandedInput = expandSynonyms(input);
  const inputLower = expandedInput.toLowerCase();
  
  const medicalConditions: string[] = [];
  const serviceCategories = new Set<ServiceCategory>();
  
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

  // Process symptoms and extracted data
  const { symptoms } = identifySymptoms(inputLower);
  
  // Extract goals more extensively 
  const goals = extractGoals(inputLower);
  
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
  const extractedServiceCategories = mapGoalsToCategories(inputLower, serviceCategories);
  
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
    serviceCategories.add(service.category);
  });

  // Handle negation patterns
  handleNegationPatterns(inputLower, serviceCategories);
  
  // Special handling for fitness and weight loss goals
  handleSpecialCases(inputLower, serviceCategories);
  
  // Extract timeframe information
  const timeframeDays = extractTimeframe(inputLower);
  
  // Calculate weights for conditions
  const { conditionWeights, urgencyLevel } = calculateConditionWeights(
    medicalConditions, 
    inputLower,
    timeframeDays
  );
  
  // Map condition weights to service priorities
  const servicePriorities = mapWeightsToServicePriorities(conditionWeights, urgencyLevel);

  // Extract specific practitioner preferences
  const practitionerPreferences = extractPractitionerPreferences(inputLower);

  // Extract severity for conditions
  const severity: Record<string, number> = {};
  extractSeverityFromInput(inputLower, severity);
  
  // Extract user preferences
  const preferences: Record<string, string> = {};
  extractPreferencesFromInput(inputLower, preferences);
  
  // Apply default severity for conditions without explicit severity
  medicalConditions.forEach(condition => {
    if (!severity[condition]) {
      severity[condition] = 0.5; // Default medium severity
    }
  });
  
  // Extract contextual factors that influence plan generation
  const contextualFactors = extractContextualFactors(inputLower);

  // If no services found, add default ones
  if (serviceCategories.size === 0 && medicalConditions.length === 0) {
    serviceCategories.add('family-medicine');
    console.log("No specific needs detected, adding default: family-medicine");
  }

  // Prepare missing fields and follow-up questions
  const missingFields: string[] = [];
  const followUpQuestions: string[] = [];

  // Check for missing critical information and generate follow-up questions
  if (medicalConditions.length === 0 && symptoms.length === 0) {
    missingFields.push('condition');
    followUpQuestions.push("Could you please tell me what specific health concern or condition you're seeking help with?");
  }

  if (goals.length === 0) {
    missingFields.push('goal');
    followUpQuestions.push("What specific outcome or goal are you hoping to achieve from your treatment?");
  }

  if (!timeframeDays && !inputLower.includes('urgent')) {
    missingFields.push('timeframe');
    if (followUpQuestions.length < 2) {
      followUpQuestions.push("Do you have a specific timeframe in mind for your treatment or recovery?");
    }
  }

  if (!extractedBudget && !inputLower.includes('budget') && !inputLower.includes('afford')) {
    missingFields.push('budget');
    if (followUpQuestions.length < 2) {
      followUpQuestions.push("Do you have a specific budget range for your health plan?");
    }
  }

  if (!preferOnline && !extractedLocation) {
    missingFields.push('location preference');
    if (followUpQuestions.length < 2) {
      followUpQuestions.push("Do you prefer in-person or online consultations?");
    }
  }

  return {
    medicalConditions,
    suggestedCategories: Array.from(serviceCategories),
    budget: extractedBudget,
    location: extractedLocation,
    preferOnline,
    severity,
    preferences,
    timeAvailability: extractTimeAvailability(inputLower),
    timeFrame: timeframeDays ? `${timeframeDays} days` : undefined,
    specificGoals: {
      goals: goals,
      ...extractSpecificGoals(inputLower)
    },
    primaryIssue: determinePrimaryIssue(symptoms, medicalConditions, inputLower),
    contextualFactors,
    servicePriorities,
    contraindicated: [], // Will be populated by specializied detectors
    userType: determineUserType(inputLower, extractedBudget),
    followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
    missingFields: missingFields.length > 0 ? missingFields : undefined,
    practitionerPreferences
  };
};

/**
 * Extract user's time availability from input
 */
function extractTimeAvailability(inputLower: string): number {
  let timeAvailability = 10; // Default hours per week
  
  // Check for specific time availability phrases
  for (const [phrase, hours] of Object.entries(TIME_AVAILABILITY)) {
    if (inputLower.includes(phrase)) {
      timeAvailability = hours;
      console.log("Extracted time availability:", hours, "hours per week");
      break;
    }
  }

  // Match specific numbers of days per week
  const daysPerWeekMatch = inputLower.match(/(\d+)\s*days?\s*(?:a|per)\s*week/i);
  if (daysPerWeekMatch) {
    timeAvailability = parseInt(daysPerWeekMatch[1], 10);
    console.log("Extracted days per week:", timeAvailability);
  }

  return timeAvailability;
}

/**
 * Extract specific goals from user input
 */
function extractSpecificGoals(inputLower: string): Record<string, any> {
  const specificGoals: Record<string, any> = {};

  // Extract specific weight loss goals
  const weightLossMatch = inputLower.match(/lose\s+(\d+)\s*(kg|pounds|lbs)/i);
  if (weightLossMatch) {
    const amount = parseInt(weightLossMatch[1], 10);
    const unit = weightLossMatch[2].toLowerCase();
    specificGoals.weightLoss = {
      amount,
      unit,
      kilograms: unit === 'kg' ? amount : Math.round(amount * 0.453592) // Convert to kg if pounds/lbs
    };
    console.log("Extracted weight loss goal:", specificGoals.weightLoss);
  }

  // Extract race preparation timeframe
  const raceTimeFrameMatch = inputLower.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) || 
                              inputLower.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
  
  if (raceTimeFrameMatch) {
    const amount = parseInt(raceTimeFrameMatch[1] || raceTimeFrameMatch[3], 10);
    const unit = (raceTimeFrameMatch[2] || raceTimeFrameMatch[4]).toLowerCase();
    const raceTimeFrame = `${amount} ${unit}`;
    
    specificGoals.racePreparation = {
      timeFrame: raceTimeFrame,
      weeks: unit.includes('week') ? amount : 
              unit.includes('month') ? amount * 4 : 
              Math.ceil(amount / 7) // Convert days to weeks
    };
    
    console.log("Extracted race preparation timeframe:", raceTimeFrame);
  }

  // Extract strength goals
  const strengthMatch = inputLower.match(/(increase|improve|gain|build)\s+(strength|muscle|power)/i);
  if (strengthMatch) {
    specificGoals.strength = {
      type: 'improvement',
      focus: strengthMatch[2].toLowerCase()
    };
    console.log("Extracted strength goal:", specificGoals.strength);
  }

  // Extract pain reduction goals
  const painMatch = inputLower.match(/(reduce|relieve|manage|eliminate)\s+(pain|discomfort)/i);
  if (painMatch) {
    specificGoals.painManagement = {
      type: painMatch[1].toLowerCase(),
      target: 'reduction'
    };
    console.log("Extracted pain management goal:", specificGoals.painManagement);
  }

  return specificGoals;
}

/**
 * Extract user's goals from input
 */
function extractGoals(inputLower: string): string[] {
  const goals: string[] = [];
  
  // Common goal phrases to look for
  const goalPhrases = [
    { phrase: /want to (run|do|complete) a (race|marathon|half[-\s]marathon|5k|10k)/i, goal: 'race completion' },
    { phrase: /prepare for (race|marathon|half[-\s]marathon|5k|10k|event)/i, goal: 'race preparation' },
    { phrase: /(lose|losing) weight/i, goal: 'weight loss' },
    { phrase: /build (muscle|strength)/i, goal: 'strength building' },
    { phrase: /improve (fitness|stamina|endurance)/i, goal: 'fitness improvement' },
    { phrase: /reduce (pain|discomfort)/i, goal: 'pain reduction' },
    { phrase: /manage (anxiety|stress|depression)/i, goal: 'mental health management' },
    { phrase: /return to (sport|running|activity|exercise)/i, goal: 'return to activity' },
    { phrase: /increase (flexibility|mobility)/i, goal: 'mobility improvement' },
    { phrase: /prevent (injury|injuries|pain)/i, goal: 'injury prevention' },
    { phrase: /recover from (injury|surgery|accident)/i, goal: 'recovery' },
    { phrase: /improve (sleep|sleeping)/i, goal: 'sleep improvement' },
    { phrase: /better (nutrition|eating|diet)/i, goal: 'nutrition improvement' },
    { phrase: /manage (condition|disease|symptoms)/i, goal: 'condition management' }
  ];
  
  // Check for each goal phrase
  goalPhrases.forEach(({ phrase, goal }) => {
    if (phrase.test(inputLower) && !goals.includes(goal)) {
      goals.push(goal);
      console.log("Extracted goal:", goal);
    }
  });
  
  // If goals were mentioned with 'goal' keyword
  const goalMatch = inputLower.match(/goal is to ([^.,:;!?]+)/i);
  if (goalMatch && goalMatch[1]) {
    const mentionedGoal = goalMatch[1].trim().toLowerCase();
    if (mentionedGoal && mentionedGoal.length > 3) {
      goals.push(mentionedGoal);
      console.log("Extracted explicit goal:", mentionedGoal);
    }
  }
  
  return goals;
}

/**
 * Determine primary issue from symptoms and conditions
 */
function determinePrimaryIssue(
  symptoms: string[], 
  medicalConditions: string[], 
  inputLower: string
): string | undefined {
  let primaryIssue: string | undefined = undefined;
  
  if (symptoms.length > 0) {
    // Sort by priority (highest first) and choose the highest priority symptom
    const sortedSymptoms = [...symptoms].sort((a, b) => {
      const priorityA = SYMPTOM_MAPPINGS[a]?.priority || 0;
      const priorityB = SYMPTOM_MAPPINGS[b]?.priority || 0;
      return priorityB - priorityA;
    });
    
    primaryIssue = sortedSymptoms[0];
    
    // Special case handling
    if (inputLower.includes('anxiety') && inputLower.includes('eat')) {
      primaryIssue = 'anxiety';
    }
    
    if ((inputLower.includes('race') || inputLower.includes('run')) && 
        inputLower.includes('week')) {
      primaryIssue = 'race preparation';
    }
  } else if (medicalConditions.length > 0) {
    // Use the first medical condition as primary issue if no symptoms detected
    primaryIssue = medicalConditions[0];
  }
  
  return primaryIssue;
}

/**
 * Extract budget from user input
 */
function extractBudget(inputLower: string): number | undefined {
  // Extract budget constraints - look for more patterns
  const budgetPatterns = [
    /r\s*(\d+)/i,
    /pay\s*r?\s*(\d+)/i, 
    /budget.*?(\d+)/i,
    /afford.*?(\d+)/i,
    /spend.*?(\d+)/i,
    /cost.*?(\d+)/i,
    /(\d+)\s*rand/i,
    /(\d+)k/i, // For expressions like "5k" meaning 5000
    /(\d+)\s*thousand/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = inputLower.match(pattern);
    if (match && match[1]) {
      let amount = parseInt(match[1], 10);
      
      // Handle 'k' or 'thousand' notation
      if (pattern.toString().includes('k') || pattern.toString().includes('thousand')) {
        amount *= 1000;
      }
      
      console.log("Extracted budget:", amount);
      return amount;
    }
  }
  
  return undefined;
}

/**
 * Extract location from user input
 */
function extractLocation(inputLower: string): { extractedLocation?: string; preferOnline?: boolean } {
  // Check for online preference
  const preferOnline = ['online', 'virtual', 'remote', 'zoom', 'teams', 'video call']
    .some(term => inputLower.includes(term));
  
  // Extract location
  let extractedLocation: string | undefined = undefined;
  const locationPatterns = [
    /\bin\s+([a-z\s]+?)(?:\s+area)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+from|\s+$)/i,
    /\bin\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+$)/i,
    /\bnear\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+$)/i,
    /\baround\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+$)/i,
    /\bfrom\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+$)/i
  ];
  
  for (const pattern of locationPatterns) {
    const locationMatches = inputLower.match(pattern);
    if (locationMatches && locationMatches[1]) {
      const possibleLocation = locationMatches[1].trim();
      if (!['general', 'particular', 'specific', 'the area', 'mind', 'my experience']
          .some(phrase => possibleLocation.includes(phrase))) {
        extractedLocation = possibleLocation;
        console.log("Extracted location:", extractedLocation);
        break;
      }
    }
  }
  
  return { extractedLocation, preferOnline };
}

/**
 * Extract specific practitioner preferences
 */
function extractPractitionerPreferences(inputLower: string): Record<string, string> | undefined {
  const preferences: Record<string, string> = {};
  
  // Gender preference
  if (inputLower.includes('female doctor') || inputLower.includes('woman doctor') || 
      inputLower.includes('female practitioner') || inputLower.includes('women practitioner')) {
    preferences.gender = 'female';
  } else if (inputLower.includes('male doctor') || inputLower.includes('man doctor') || 
             inputLower.includes('male practitioner') || inputLower.includes('men practitioner')) {
    preferences.gender = 'male';
  }
  
  // Experience level
  if (inputLower.includes('experienced') || inputLower.includes('senior') || 
      inputLower.includes('specialist')) {
    preferences.experience = 'experienced';
  } else if (inputLower.includes('new graduate') || inputLower.includes('junior') ||
             inputLower.includes('affordable practitioner')) {
    preferences.experience = 'junior';
  }
  
  // Specific practitioner mentions
  const specificDoctorMatch = inputLower.match(/doctor\s+([a-z]+)/i) || 
                              inputLower.match(/dr\.?\s+([a-z]+)/i);
  if (specificDoctorMatch && specificDoctorMatch[1]) {
    preferences.specificDoctor = specificDoctorMatch[1];
  }
  
  return Object.keys(preferences).length > 0 ? preferences : undefined;
}

/**
 * Determine user type from input and budget
 */
function determineUserType(inputLower: string, budget?: number): 'student' | 'working' | 'premium' | undefined {
  // Determine userType based on keywords and budget
  if (inputLower.includes('student') || inputLower.includes('university') || 
      inputLower.includes('college') || inputLower.includes('varsity') || 
      inputLower.includes('brother') || inputLower.includes('studying')) {
    return 'student';
  } else if (budget && budget > 3000) {
    return 'premium';
  } else if (inputLower.includes('job') || inputLower.includes('work') ||
             inputLower.includes('office') || inputLower.includes('professional') ||
             inputLower.includes('career')) {
    return 'working';
  }
  
  return undefined;
}

// Helper function for handling negation patterns
function handleNegationPatterns(inputLower: string, serviceCategories: Set<ServiceCategory>): void {
  const negationPatterns = [
    { pattern: /can['']?t afford (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /(no|not) (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /without (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /too expensive for (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' },
    { pattern: /avoid (a |an |the )?([a-zA-Z\- ]+)/i, type: 'exclusion' }
  ];
  
  negationPatterns.forEach(({ pattern, type }) => {
    const matches = inputLower.match(pattern);
    if (matches) {
      const negatedTerm = matches[matches.length - 1].toLowerCase();
      
      // Check if the negated term refers to a professional or service
      const professionalTerms = {
        'trainer': 'personal-trainer',
        'coach': 'coaching',
        'doctor': 'family-medicine',
        'physician': 'family-medicine',
        'physiotherapist': 'physiotherapist',
        'physio': 'physiotherapist',
        'dietician': 'dietician',
        'nutritionist': 'dietician',
        'psychiatrist': 'psychiatry',
        'biokineticist': 'biokineticist'
      };
      
      for (const [term, service] of Object.entries(professionalTerms)) {
        if (negatedTerm.includes(term)) {
          console.log(`User explicitly excluded service: ${service}`);
          serviceCategories.delete(service as ServiceCategory);
        }
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
  
  // New special case: handling specific combinations of conditions
  // Knee pain + race preparation
  if ((inputLower.includes('knee') && inputLower.includes('pain')) &&
      (inputLower.includes('race') || inputLower.includes('marathon') || inputLower.includes('run'))) {
    console.log("Special case: Knee pain + race preparation");
    serviceCategories.add('physiotherapist');
    serviceCategories.add('personal-trainer');
    serviceCategories.add('coaching');
  }
  
  // Depression or anxiety + physical pain
  if ((inputLower.includes('depression') || inputLower.includes('anxiety')) &&
      (inputLower.includes('pain') || inputLower.includes('injury'))) {
    console.log("Special case: Mental health + physical condition");
    serviceCategories.add('psychiatry');
    serviceCategories.add('physiotherapist');
  }
  
  // Nutrition + performance goals
  if ((inputLower.includes('nutrition') || inputLower.includes('diet') || inputLower.includes('eating')) &&
      (inputLower.includes('performance') || inputLower.includes('improve') || inputLower.includes('better'))) {
    console.log("Special case: Nutrition + performance");
    serviceCategories.add('dietician');
    serviceCategories.add('coaching');
  }
}

// Helper function to extract severity information from user input
function extractSeverityFromInput(inputLower: string, severity: Record<string, number>): void {
  // Extract severity terms for various conditions
  const conditionPatterns = [
    { condition: 'knee pain', patterns: ['knee pain', 'knee injury', 'knee problem'] },
    { condition: 'back pain', patterns: ['back pain', 'back injury', 'back problem'] },
    { condition: 'anxiety', patterns: ['anxiety', 'anxious', 'nervous'] },
    { condition: 'depression', patterns: ['depression', 'depressed', 'sad'] },
    { condition: 'weight loss', patterns: ['weight loss', 'lose weight', 'diet'] },
    { condition: 'race preparation', patterns: ['race', 'marathon', 'running event'] }
  ];
  
  conditionPatterns.forEach(({ condition, patterns }) => {
    // Check if any pattern for this condition exists in the input
    const hasCondition = patterns.some(pattern => inputLower.includes(pattern));
    
    if (hasCondition) {
      // Default severity
      severity[condition] = 0.5;
      
      // Check for severity modifiers
      for (const [keyword, severityValue] of Object.entries(SEVERITY_KEYWORDS)) {
        // Look for severity term within 5 words of condition
        const proximityPattern = new RegExp(
          `${keyword}\\s+(?:\\w+\\s+){0,5}(?:${patterns.join('|')})|(?:${patterns.join('|')})\\s+(?:\\w+\\s+){0,5}${keyword}`, 
          'i'
        );
        
        if (proximityPattern.test(inputLower)) {
          severity[condition] = severityValue;
          console.log(`Found severity "${keyword}" (${severityValue}) for ${condition}`);
          break;
        }
      }
    }
  });
  
  // Add special case for anxiety and eating issues
  if (inputLower.includes('anxiety') || inputLower.includes('anxious')) {
    severity['anxiety'] = 0.7; // Default severity for anxiety
    
    // Check for severity modifiers near anxiety
    for (const [keyword, severityValue] of Object.entries(SEVERITY_KEYWORDS)) {
      const pattern = new RegExp(`${keyword}\\s+(?:anxiety|anxious|mental health)|(?:anxiety|anxious|mental health)\\s+${keyword}`, 'i');
      if (pattern.test(inputLower)) {
        severity['anxiety'] = severityValue;
        console.log(`Found severity "${keyword}" (${severityValue}) for anxiety`);
        break;
      }
    }
  }
  
  if (inputLower.includes('struggle to eat') || inputLower.includes('struggling to eat') ||
      inputLower.includes('poor appetite') || inputLower.includes('not eating')) {
    severity['nutrition'] = 0.8; // Default high severity for eating issues
    console.log(`Set high severity for nutrition issues`);
  }
  
  if (inputLower.includes('race') && 
      (inputLower.includes('weeks') || inputLower.includes('soon'))) {
    severity['race preparation'] = 0.9; // High severity for upcoming races
    console.log(`Set high severity for upcoming race`);
  }
}

// Helper function to extract user preferences from input
function extractPreferencesFromInput(inputLower: string, preferences: Record<string, string>): void {
  for (const [keyword, preferencePairs] of Object.entries(PREFERENCE_KEYWORDS)) {
    if (inputLower.includes(keyword)) {
      for (const [key, value] of Object.entries(preferencePairs)) {
        preferences[key] = value;
        console.log(`Extracted preference: ${key} = ${value}`);
      }
    }
  }
}

// Helper function to extract contextual factors
function extractContextualFactors(inputLower: string): string[] {
  const factors: string[] = [];
  
  // Lifestyle factors
  if (inputLower.includes('desk') || inputLower.includes('office') || 
      inputLower.includes('sitting') || inputLower.includes('computer')) {
    factors.push('sedentary-work');
  }
  
  if (inputLower.includes('student') || inputLower.includes('study') || 
      inputLower.includes('university') || inputLower.includes('college') ||
      inputLower.includes('brother')) { // Add brother as potential student indicator
    factors.push('student-lifestyle');
  }
  
  return factors;
}

// Function to check for co-morbidities and suggest additional services
export function checkCoMorbidities(conditions: string[]): string[] {
  const additionalServices: string[] = [];
  
  // Check for anxiety + depression (common comorbidity)
  if (conditions.includes('anxiety') && conditions.includes('depression')) {
    additionalServices.push('psychiatry');
    additionalServices.push('psychology');
  }
  
  // Check for pain + mental health issues
  if ((conditions.includes('knee pain') || conditions.includes('back pain') || 
       conditions.includes('chronic pain')) && 
      (conditions.includes('anxiety') || conditions.includes('depression'))) {
    additionalServices.push('pain-management');
    additionalServices.push('psychology');
  }
  
  // Check for weight issues + other conditions
  if (conditions.includes('weight loss') && 
      (conditions.includes('diabetes') || conditions.includes('hypertension'))) {
    additionalServices.push('dietician');
    additionalServices.push('endocrinology');
  }
  
  return additionalServices;
}

// Generate personalized notes for the plan based on extracted data
export function generatePlanNotes(
  preferences: Record<string, string>,
  conditions: string[],
  severity: Record<string, number>,
  specificGoals: Record<string, any>,
  timeFrame?: string,
  location?: string,
  preferOnline?: boolean,
  contextualFactors?: string[],
  primaryIssue?: string,
  servicePriorities?: Record<ServiceCategory, number>
): string[] {
  const notes: string[] = [];
  
  // Add note about online preference
  if (preferOnline) {
    notes.push('All consultations can be conducted online for your convenience.');
  }
  
  // Add note about location if specified
  if (location) {
    notes.push(`Services are available in the ${location} area.`);
  }
  
  // Add note about practitioner preferences
  if (preferences.gender) {
    notes.push(`We've noted your preference for a ${preferences.gender} practitioner.`);
  }
  
  if (preferences.experience) {
    if (preferences.experience === 'experienced') {
      notes.push('This plan includes senior practitioners with extensive experience.');
    } else if (preferences.experience === 'junior') {
      notes.push('This plan includes more affordable practitioners for your budget considerations.');
    }
  }
  
  // Add note about timeframe if urgent
  if (timeFrame && timeFrame.includes('week') && parseInt(timeFrame.split(' ')[0], 10) < 4) {
    notes.push('Given your urgent timeframe, we've prioritized immediate availability.');
  }
  
  // Add goal-specific notes
  if (specificGoals.weightLoss) {
    const { amount, unit } = specificGoals.weightLoss;
    notes.push(`Your weight loss goal of ${amount} ${unit} requires a combination of nutrition and exercise support.`);
  }
  
  if (specificGoals.racePreparation) {
    const { timeFrame } = specificGoals.racePreparation;
    notes.push(`Your race preparation plan is designed for the ${timeFrame} timeline you specified.`);
  }
  
  // Add contextual notes
  if (contextualFactors?.includes('sedentary-work')) {
    notes.push('This plan addresses challenges related to desk work and sedentary lifestyle.');
  }
  
  if (contextualFactors?.includes('student-lifestyle')) {
    notes.push('This plan is designed with student schedules and budget considerations in mind.');
  }
  
  return notes;
}
