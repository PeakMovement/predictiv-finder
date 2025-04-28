import { ServiceCategory } from "./types";
import { AnalyzedInput } from "./enhancedTypes";
import { CONDITION_TO_SERVICES } from "./serviceMappings";
import { getProfessionalsForSymptoms, identifySymptoms } from "./symptomMapper";
import { BASELINE_COSTS, DEFAULT_SERVICE_FREQUENCIES, STUDENT_DISCOUNT } from "./types";

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
  'nervous': { mentalHealth: 'anxiety' }
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

export const enhancedAnalyzeUserInput = (input: string): AnalyzedInput => {
  const inputLower = input.toLowerCase();
  const words = inputLower.split(/\s+/);
  const severity: Record<string, number> = {};
  const preferences: Record<string, string> = {};
  let timeAvailability = 10; // Default hours per week
  let extractedBudget: number | undefined = undefined;
  let extractedLocation: string | undefined = undefined;
  let preferOnline: boolean | undefined = undefined;
  let timeFrame: string | undefined = undefined;
  const specificGoals: Record<string, any> = {};

  console.log("Enhanced analysis of user input:", inputLower);

  // First, use our advanced symptom and professional analysis
  const { categories: suggestedCategories, priorities: categoryPriorities, contraindicated = [] } = 
    getProfessionalsForSymptoms(inputLower);
  
  // Extract symptoms and map to medical conditions
  const { symptoms } = identifySymptoms(inputLower);
  const medicalConditions = mapSymptomsToConditions(symptoms, inputLower);
  
  console.log("Primary symptoms identified:", symptoms);
  console.log("Mapped to medical conditions:", medicalConditions);
  console.log("Suggested service categories:", suggestedCategories);
  console.log("Category priorities:", categoryPriorities);
  
  // Identify primary issue
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
  }
  
  // Extract budget constraints
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/pay\s*r?\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i) ||
                         inputLower.match(/cost.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    extractedBudget = parseInt(budgetMatches[1], 10);
    console.log("Extracted budget:", extractedBudget);
  }
  
  // Determine userType based on keywords and budget
  let userType: 'student' | 'working' | 'premium' | undefined = undefined;
  if (inputLower.includes('student') || inputLower.includes('university') || 
      inputLower.includes('college') || inputLower.includes('varsity') || 
      inputLower.includes('brother')) { // Add "brother" as potential student
    userType = 'student';
    if (!extractedBudget) {
      extractedBudget = 800; // Default student budget
    }
  } else if (extractedBudget && extractedBudget > 3000) {
    userType = 'premium';
  } else {
    userType = 'working';
    if (!extractedBudget && inputLower.includes('tight budget')) {
      extractedBudget = 1200;
    }
  }
  
  console.log("Determined user type:", userType);
  
  // Detect budget constraints
  if (inputLower.includes('tight budget') || 
      inputLower.includes('limited budget') || 
      inputLower.includes('cheap') || 
      inputLower.includes('affordable') || 
      inputLower.includes('low cost') || 
      inputLower.includes("can't afford") ||
      inputLower.includes('budget constraint')) {
    preferences['budgetConstraint'] = 'tight';
    if (!extractedBudget) {
      extractedBudget = userType === 'student' ? 800 : 1200; // Default modest budget
      console.log("Budget constraint detected, setting default:", extractedBudget);
    }
  }

  // Extract location preference
  preferOnline = ['online', 'virtual', 'remote', 'zoom', 'teams', 'video call']
    .some(term => inputLower.includes(term));
  
  // Extract location
  const locationMatches = inputLower.match(/\bin\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+from|\s+$)/i);
  if (locationMatches && locationMatches[1]) {
    const possibleLocation = locationMatches[1].trim();
    if (!['general', 'particular', 'specific', 'the area', 'mind', 'my experience']
        .some(phrase => possibleLocation.includes(phrase))) {
      extractedLocation = possibleLocation;
      console.log("Extracted location:", extractedLocation);
    }
  }

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
    // Add weight loss as a condition
    if (!medicalConditions.includes('weight loss')) {
      medicalConditions.push('weight loss');
    }
  }

  // Extract race preparation timeframe
  let raceTimeFrame: string | undefined = undefined;
  const raceTimeFrameMatch = inputLower.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) || 
                             inputLower.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
  
  if (raceTimeFrameMatch) {
    const amount = parseInt(raceTimeFrameMatch[1] || raceTimeFrameMatch[3], 10);
    const unit = (raceTimeFrameMatch[2] || raceTimeFrameMatch[4]).toLowerCase();
    raceTimeFrame = `${amount} ${unit}`;
    timeFrame = raceTimeFrame;
    
    // Add to specific goals
    specificGoals.racePreparation = {
      timeFrame: raceTimeFrame,
      weeks: unit.includes('week') ? amount : 
             unit.includes('month') ? amount * 4 : 
             Math.ceil(amount / 7) // Convert days to weeks
    };
    
    console.log("Extracted race preparation timeframe:", raceTimeFrame);
    
    // If race prep is soon (4 weeks or less), add to medical conditions
    if ((unit.includes('week') && amount <= 4) || 
        (unit.includes('day') && amount <= 28)) {
      if (!medicalConditions.includes('race preparation')) {
        medicalConditions.push('race preparation');
      }
    }
  }

  // Extract general timeframe if not already set
  if (!timeFrame) {
    const timeFrameMatch = inputLower.match(/in\s+(\d+)\s*(weeks?|months?|days?)/i);
    if (timeFrameMatch) {
      const amount = parseInt(timeFrameMatch[1], 10);
      const unit = timeFrameMatch[2].toLowerCase();
      timeFrame = `${amount} ${unit}`;
      console.log("Extracted timeframe:", timeFrame);
    }
  }

  // Extract time availability
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

  // Extract severity for conditions
  extractSeverityFromInput(inputLower, severity);
  
  // Special case for mental health + nutrition
  if (inputLower.includes('anxiety') && 
      (inputLower.includes('struggle to eat') || inputLower.includes('struggling to eat'))) {
    severity['anxiety'] = Math.max(severity['anxiety'] || 0, 0.8);
    severity['nutrition'] = Math.max(severity['nutrition'] || 0, 0.75);
    console.log("Detected anxiety with eating difficulties");
  }

  // Extract user preferences
  extractPreferencesFromInput(inputLower, preferences);
  
  // Apply default severity for conditions without explicit severity
  medicalConditions.forEach(condition => {
    if (!severity[condition]) {
      severity[condition] = 0.5; // Default medium severity
    }
  });
  
  // Extract contextual factors that influence plan generation
  const contextualFactors = extractContextualFactors(inputLower);
  
  // Add event preparation to contextual factors if race mentioned
  if (inputLower.includes('race') || inputLower.includes('run') || 
      inputLower.includes('marathon') || inputLower.includes('event')) {
    if (!contextualFactors.includes('event-preparation')) {
      contextualFactors.push('event-preparation');
    }
  }
  
  // Add mental health factor if anxiety mentioned
  if (inputLower.includes('anxiety') || inputLower.includes('anxious') || 
      inputLower.includes('mental health')) {
    if (!contextualFactors.includes('mental-health')) {
      contextualFactors.push('mental-health');
    }
  }

  return {
    medicalConditions,
    suggestedCategories: Array.from(suggestedCategories),
    budget: extractedBudget,
    location: extractedLocation,
    preferOnline,
    severity,
    preferences,
    timeAvailability,
    timeFrame,
    specificGoals,
    primaryIssue,
    contextualFactors,
    servicePriorities: categoryPriorities,
    contraindicated,
    userType
  };
};

// Helper function to extract severity information from user input
function extractSeverityFromInput(inputLower: string, severity: Record<string, number>): void {
  // ... keep existing code (severity extraction) the same
  
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
  
  if (inputLower.includes('busy') || inputLower.includes('hectic') || 
      inputLower.includes('no time') || inputLower.includes('tight schedule')) {
    factors.push('time-restricted');
  }
  
  // Activity levels
  if (inputLower.includes('gym') || inputLower.includes('workout') || 
      inputLower.includes('exercise') || inputLower.includes('training')) {
    factors.push('active-lifestyle');
  }
  
  // Event preparation
  if (inputLower.includes('race') || inputLower.includes('marathon') || 
      inputLower.includes('run') || inputLower.includes('event')) {
    factors.push('event-preparation');
  }
  
  // Mental health
  if (inputLower.includes('anxiety') || inputLower.includes('mental health') || 
      inputLower.includes('stress') || inputLower.includes('worried')) {
    factors.push('mental-health');
  }
  
  // Nutrition concerns
  if (inputLower.includes('eat') || inputLower.includes('food') || 
      inputLower.includes('appetite') || inputLower.includes('nutrition')) {
    factors.push('nutrition-focused');
  }
  
  // Budget sensitivity
  if (inputLower.includes('affordable') || inputLower.includes('budget') || 
      inputLower.includes('cost') || inputLower.includes('cheap')) {
    factors.push('budget-sensitive');
  }
  
  // Special demographics
  if (inputLower.includes('student') || inputLower.includes('university') ||
      inputLower.includes('brother')) {
    factors.push('student-discount');
  }
  
  return factors;
}

// Map symptoms to medical conditions
function mapSymptomsToConditions(symptoms: string[], inputLower: string): string[] {
  const conditions: string[] = [];
  
  // Direct mapping from symptoms to conditions
  const SYMPTOM_TO_CONDITION_MAP: Record<string, string[]> = {
    'shoulder pain': ['shoulder strain'],
    'knee pain': ['knee pain'],
    'back pain': ['back pain'],
    'neck pain': ['neck pain'],
    'joint pain': ['joint pain'],
    'digestive issues': ['stomach issues'],
    'weight management': ['weight loss'],
    'strength': ['fitness goals'],
    'fitness': ['fitness goals'],
    'stress': ['mental health', 'stress'],
    'sleep issues': ['sleep issues'],
    'fatigue': ['chronic fatigue'],
    'sports injury': ['sports injury'],
    'event preparation': ['fitness goals', 'race preparation'],
    'race preparation': ['race preparation', 'fitness goals'],
    'anxiety': ['mental health', 'anxiety'],
    'mental health': ['mental health'],
    'nutrition': ['nutrition needs']
  };
  
  // Map each symptom to conditions
  symptoms.forEach(symptom => {
    const mappedConditions = SYMPTOM_TO_CONDITION_MAP[symptom];
    if (mappedConditions) {
      mappedConditions.forEach(condition => {
        if (!conditions.includes(condition)) {
          conditions.push(condition);
        }
      });
    }
  });
  
  // Special handling for specific combinations
  if (inputLower.includes('anxiety') && 
      (inputLower.includes('eat') || inputLower.includes('appetite'))) {
    if (!conditions.includes('anxiety')) {
      conditions.push('anxiety');
    }
    if (!conditions.includes('nutrition needs')) {
      conditions.push('nutrition needs');
    }
  }
  
  if ((inputLower.includes('race') || inputLower.includes('run') || 
       inputLower.includes('marathon')) && 
      (inputLower.includes('weeks') || inputLower.includes('soon'))) {
    if (!conditions.includes('race preparation')) {
      conditions.push('race preparation');
    }
  }
  
  // If no conditions found, add default
  if (conditions.length === 0) {
    conditions.push('general health');
  }
  
  return conditions;
}

// Helper functions to be used with the enhanced analyzer
export const checkCoMorbidities = (conditions: string[]): ServiceCategory[] => {
  const additionalCategories: ServiceCategory[] = [];
  
  // Anxiety + nutrition issues often benefits from both dietician and coaching
  if (conditions.includes('anxiety') && conditions.includes('nutrition needs')) {
    additionalCategories.push('dietician', 'coaching');
  }
  
  // Race preparation + anxiety might benefit from coaching
  if (conditions.includes('race preparation') && conditions.includes('anxiety')) {
    additionalCategories.push('coaching', 'personal-trainer');
  }
  
  // Race preparation + nutrition issues need dietary support
  if (conditions.includes('race preparation') && conditions.includes('nutrition needs')) {
    additionalCategories.push('dietician', 'personal-trainer');
  }
  
  // Keep existing co-morbidities checks
  if (conditions.includes('diabetes') && conditions.includes('hypertension')) {
    additionalCategories.push('cardiology', 'endocrinology');
  }
  
  if (conditions.includes('back pain') && conditions.includes('stress')) {
    additionalCategories.push('psychiatry', 'coaching');
  }
  
  if (conditions.includes('knee pain') && conditions.includes('fitness goals')) {
    additionalCategories.push('physiotherapist', 'personal-trainer');
  }
  
  if (conditions.includes('weight loss') && conditions.includes('stomach issues')) {
    additionalCategories.push('dietician', 'gastroenterology');
  }
  
  return additionalCategories;
};

export const extractTimeFrameInWeeks = (timeFrame?: string): number => {
  if (!timeFrame) return 12; // Default 12 weeks (3 months)
  
  const match = timeFrame.match(/(\d+)\s*(week|month|day)s?/i);
  if (!match) return 12;
  
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  if (unit === 'week') return amount;
  if (unit === 'month') return amount * 4.3; // Approximate weeks in a month
  if (unit === 'day') return Math.ceil(amount / 7);
  
  return 12;
};

export const calculateWeightLossRatePerWeek = (
  goal: Record<string, any> = {},
  timeFrameWeeks: number
): number => {
  if (!goal.weightLoss || !goal.weightLoss.kilograms) return 0;
  
  const totalKg = goal.weightLoss.kilograms;
  const weeklyRate = totalKg / timeFrameWeeks;
  
  // A healthy weight loss rate is 0.5-1kg per week
  const healthyMax = 1.0;
  return Math.min(weeklyRate, healthyMax);
};

export const generatePlanNotes = (
  preferences: Record<string, string>,
  medicalConditions: string[],
  severity: Record<string, number>,
  specificGoals: Record<string, any> = {},
  timeFrame?: string,
  location?: string,
  preferOnline?: boolean,
  contextualFactors: string[] = [],
  primaryIssue?: string,
  servicePriorities?: Record<string, number>
): string[] => {
  const notes: string[] = [];
  
  // Add primary issue note if available
  if (primaryIssue) {
    const issue = primaryIssue.charAt(0).toUpperCase() + primaryIssue.slice(1);
    
    // Special case for anxiety + eating issues
    if (primaryIssue === 'anxiety' && medicalConditions.includes('nutrition needs')) {
      notes.push(`This plan focuses on addressing anxiety and nutrition concerns together.`);
    }
    // Special case for race preparation
    else if (primaryIssue === 'race preparation' || primaryIssue === 'event preparation') {
      const timeFrameText = timeFrame ? `within ${timeFrame}` : 'soon';
      notes.push(`This plan is designed for your upcoming race ${timeFrameText}.`);
    }
    // Default primary issue note
    else {
      notes.push(`This plan focuses on addressing your ${issue}.`);
    }
  }
  
  // Special notes for anxiety and nutrition
  if (medicalConditions.includes('anxiety') && medicalConditions.includes('nutrition needs')) {
    notes.push(`Services selected to support both mental wellbeing and nutrition needs.`);
  }
  
  // Add race preparation note
  if (medicalConditions.includes('race preparation') || contextualFactors.includes('event-preparation')) {
    if (specificGoals.racePreparation?.timeFrame) {
      notes.push(`Training plan designed for your race in ${specificGoals.racePreparation.timeFrame}.`);
    } else {
      notes.push(`Training plan focused on race preparation and performance.`);
    }
  }
  
  // Add notes about delivery method
  if (preferOnline) {
    notes.push('Services prioritized for online delivery where available.');
  } else if (preferences.delivery === 'in-person') {
    notes.push('In-person sessions have been prioritized as requested.');
  }
  
  // Add location note
  if (location) {
    notes.push(`Plan tailored for providers in ${location}.`);
  }
  
  // Add schedule-related notes
  if (preferences.schedule === 'busy' || contextualFactors.includes('time-restricted')) {
    notes.push('Plan designed for minimal time commitment to fit your busy schedule.');
  }
  
  if (preferences.occupation === 'student' || contextualFactors.includes('student-discount')) {
    notes.push('Student-friendly pricing options prioritized.');
  }
  
  // Add dietary preference notes
  if (preferences.diet) {
    notes.push(`${preferences.diet.charAt(0).toUpperCase() + preferences.diet.slice(1)} dietary needs considered.`);
  }
  
  // Add note about multiple conditions
  if (medicalConditions.length > 1) {
    notes.push('Plan addresses multiple health factors for comprehensive care.');
  }
  
  // Add event preparation note
  if (contextualFactors.includes('event-preparation')) {
    notes.push('Sessions are structured to prepare you for your upcoming event.');
  }
  
  return notes;
};

// Calculate optimal service allocation based on priorities and budgetary constraints
export const calculateOptimalServiceAllocation = (
  serviceCategories: ServiceCategory[],
  priorities: Record<ServiceCategory, number> = {},
  budget: number,
  userType: 'student' | 'working' | 'premium' = 'working',
  contextualFactors: string[] = []
): { 
  type: ServiceCategory; 
  sessions: number; 
  cost: number;
  frequency?: string;
}[] => {
  // First, calculate base costs adjusted for user type
  const adjustedCosts: Record<ServiceCategory, number> = {};
  
  serviceCategories.forEach(category => {
    let cost = BASELINE_COSTS[category] || 500;
    
    // Apply student discount if applicable
    if (userType === 'student' && STUDENT_DISCOUNT[category]) {
      cost = Math.round(cost * (1 - STUDENT_DISCOUNT[category]!));
    } else if (userType === 'premium') {
      cost = Math.round(cost * 1.2); // 20% premium for high-end service
    }
    
    adjustedCosts[category] = cost;
  });
  
  // Apply frequency preferences based on service type and contextual factors
  const frequencyPreferences: Record<ServiceCategory, FrequencyPreference> = {};
  
  serviceCategories.forEach(category => {
    const baseFrequency = DEFAULT_SERVICE_FREQUENCIES[category] || 
      { minFrequency: 0.5, maxFrequency: 1, totalSessions: 2 };
      
    // Adjust based on contextual factors
    let adjusted = { ...baseFrequency };
    
    // Race preparation adjustments
    if (contextualFactors.includes('event-preparation')) {
      if (category === 'personal-trainer') {
        // More frequent training for race prep
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 2);
        adjusted.maxFrequency = Math.max(adjusted.maxFrequency, 3);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 8);
      } 
      else if (category === 'coaching') {
        // Regular coaching for race prep
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 1);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 4);
      }
      else if (category === 'dietician') {
        // Nutrition guidance for race prep
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 0.5);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 2);
      }
    }
    
    // Mental health adjustments
    if (contextualFactors.includes('mental-health')) {
      if (category === 'coaching') {
        // Regular coaching for anxiety
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 1);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 4);
      }
      else if (category === 'dietician' && contextualFactors.includes('nutrition-focused')) {
        // Nutrition support for anxiety and eating issues
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 0.5);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 2);
      }
    }
    
    // Time restricted adjustments
    if (contextualFactors.includes('time-restricted')) {
      adjusted.minFrequency = Math.min(adjusted.minFrequency, 1);
      adjusted.maxFrequency = Math.min(adjusted.maxFrequency, 2);
    }
    
    frequencyPreferences[category] = adjusted;
  });
  
  // Calculate the optimal allocation based on priorities
  const totalPriority = Object.values(priorities).reduce((sum, p) => sum + p, 0) || serviceCategories.length;
  
  // Sort services by priority (highest first)
  const sortedServices = [...serviceCategories]
    .sort((a, b) => (priorities[b] || 0) - (priorities[a] || 0));
  
  // Calculate raw allocation percentages
  const rawAllocations = sortedServices.map(category => {
    const priorityShare = totalPriority > 0 ? 
      (priorities[category] || 1) / totalPriority : 1 / serviceCategories.length;
    
    const rawBudgetShare = budget * priorityShare;
    const maxSessions = Math.floor(rawBudgetShare / adjustedCosts[category]);
    
    return {
      category,
      priorityShare,
      rawBudgetShare,
      maxSessions,
      costPerSession: adjustedCosts[category]
    };
  });
  
  // Apply minimum and maximum session rules based on frequency preferences
  let allocations = rawAllocations.map(alloc => {
    const frequency = frequencyPreferences[alloc.category] || 
      { minFrequency: 0.5, maxFrequency: 1, totalSessions: 2 };
    
    const minSessions = Math.max(1, Math.ceil(frequency.minFrequency * 4)); // At least one session
    const idealSessions = Math.min(
      alloc.maxSessions, 
      frequency.totalSessions
    );
    
    return {
      ...alloc,
      minSessions,
      idealSessions
    };
  });
  
  // Total cost of minimum sessions
  const minSessionsCost = allocations.reduce(
    (sum, alloc) => sum + (alloc.minSessions * alloc.costPerSession), 
    0
  );
  
  // Adjust if minimum sessions exceed budget
  if (minSessionsCost > budget) {
    // Sort by priority and keep only the highest priority services
    allocations = allocations
      .sort((a, b) => (priorities[b.category] || 0) - (priorities[a.category] || 0))
      .slice(0, 2); // Keep top 2 most important services
  }
  
  // Calculate actual sessions based on remaining budget
  let remainingBudget = budget;
  const result: { type: ServiceCategory; sessions: number; cost: number; frequency?: string }[] = [];
  
  // First pass: allocate minimum sessions to each service
  allocations.forEach(alloc => {
    const sessionCost = alloc.minSessions * alloc.costPerSession;
    if (remainingBudget >= sessionCost) {
      result.push({
        type: alloc.category,
        sessions: alloc.minSessions,
        cost: sessionCost
      });
      remainingBudget -= sessionCost;
    } else if (remainingBudget >= alloc.costPerSession) {
      // Can afford at least one session
      const affordableSessions = Math.floor(remainingBudget / alloc.costPerSession);
      result.push({
        type: alloc.category,
        sessions: affordableSessions,
        cost: affordableSessions * alloc.costPerSession
      });
      remainingBudget -= affordableSessions * alloc.costPerSession;
    }
  });
  
  // Second pass: distribute remaining budget to services based on priority
  if (remainingBudget > 0) {
    // Sort again by priority
    const sortedForRemaining = [...result]
      .sort((a, b) => (priorities[b.type] || 0) - (priorities[a.type] || 0));
      
    for (const service of sortedForRemaining) {
      const costPerSession = adjustedCosts[service.type];
      if (remainingBudget >= costPerSession) {
        const additionalSessions = Math.min(
          Math.floor(remainingBudget / costPerSession),
          // Don't exceed the ideal number of sessions
          frequencyPreferences[service.type]?.totalSessions - service.sessions || 5
        );
        
        if (additionalSessions > 0) {
          service.sessions += additionalSessions;
          service.cost += additionalSessions * costPerSession;
          remainingBudget -= additionalSessions * costPerSession;
        }
      }
    }
  }
  
  // Add frequency descriptions
  result.forEach(service => {
    const freq = frequencyPreferences[service.type];
    if (freq) {
      if (freq.minFrequency >= 1) {
        service.frequency = `${freq.minFrequency}-${freq.maxFrequency} sessions per week`;
      } else if (freq.minFrequency === 0.5) {
        service.frequency = 'Every other week';
      } else if (freq.minFrequency === 0.25) {
        service.frequency = 'Monthly';
      } else {
        service.frequency = `${service.sessions} sessions total`;
      }
    }
  });
  
  return result;
};
