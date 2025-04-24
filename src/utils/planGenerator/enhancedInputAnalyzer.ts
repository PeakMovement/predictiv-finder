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
  'persistent': 0.75
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
  'office': { location: 'office' }
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
  const { categories: suggestedCategories, priorities: categoryPriorities, contraindicated } = 
    getProfessionalsForSymptoms(inputLower);
  
  // Extract symptoms and map to medical conditions
  const { symptoms } = identifySymptoms(inputLower);
  const medicalConditions = mapSymptomsToConditions(symptoms, inputLower);
  
  console.log("Primary symptoms identified:", symptoms);
  console.log("Mapped to medical conditions:", medicalConditions);
  console.log("Suggested service categories:", suggestedCategories);
  console.log("Category priorities:", categoryPriorities);
  
  // Identify primary issue
  const primaryIssue = symptoms.length > 0 ? 
    symptoms.sort((a, b) => (categoryPriorities[a] || 0) - (categoryPriorities[b] || 0))[0] : 
    undefined;
  
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
      inputLower.includes('college') || inputLower.includes('varsity')) {
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

  // Extract timeframe
  const timeFrameMatch = inputLower.match(/in\s+(\d+)\s*(weeks?|months?|days?)/i);
  if (timeFrameMatch) {
    const amount = parseInt(timeFrameMatch[1], 10);
    const unit = timeFrameMatch[2].toLowerCase();
    timeFrame = `${amount} ${unit}`;
    console.log("Extracted timeframe:", timeFrame);
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
    contraindicated: contraindicated,
    userType
  };
};

// Helper function to extract severity information from user input
function extractSeverityFromInput(inputLower: string, severity: Record<string, number>): void {
  for (const [keyword, severityValue] of Object.entries(SEVERITY_KEYWORDS)) {
    if (inputLower.includes(keyword)) {
      // Look for condition mentioned near severity keyword
      const nearbyWords = 5; // Words to check before and after
      const words = inputLower.split(/\s+/);
      
      for (let i = 0; i < words.length; i++) {
        if (words[i] === keyword) {
          // Check nearby words for body parts or conditions
          const start = Math.max(0, i - nearbyWords);
          const end = Math.min(words.length, i + nearbyWords);
          
          const bodyParts = ['shoulder', 'knee', 'back', 'neck', 'hip', 'joint', 'muscle'];
          
          for (let j = start; j < end; j++) {
            // Check for body parts
            for (const part of bodyParts) {
              if (words[j].includes(part)) {
                const condition = `${part} pain`;
                severity[condition] = severityValue;
                console.log(`Found severity "${keyword}" (${severityValue}) for "${condition}"`);
              }
            }
            
            // Check for other conditions
            for (const condition of Object.keys(CONDITION_TO_SERVICES)) {
              if (condition.split(' ').some(word => words[j] === word)) {
                severity[condition] = severityValue;
                console.log(`Found severity "${keyword}" (${severityValue}) for "${condition}"`);
              }
            }
          }
        }
      }
    }
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
      inputLower.includes('university') || inputLower.includes('college')) {
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
  if (inputLower.includes('marathon') || inputLower.includes('race') || 
      inputLower.includes('event') || inputLower.includes('competition')) {
    factors.push('event-preparation');
  }
  
  // Budget sensitivity
  if (inputLower.includes('affordable') || inputLower.includes('budget') || 
      inputLower.includes('cost') || inputLower.includes('cheap')) {
    factors.push('budget-sensitive');
  }
  
  // Special demographics
  if (inputLower.includes('student') || inputLower.includes('university')) {
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
    'event preparation': ['fitness goals']
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
  
  // Special handling for weight loss and fitness
  if (inputLower.includes('lose weight') || 
      inputLower.includes('weight loss') || 
      inputLower.includes('kg') ||
      inputLower.includes('tone') || 
      inputLower.includes('toning') ||
      inputLower.includes('lean')) {
    if (!conditions.includes('weight loss')) {
      conditions.push('weight loss');
    }
  }
  
  if (inputLower.includes('muscle') || 
      inputLower.includes('strength') || 
      inputLower.includes('strong') || 
      inputLower.includes('training') ||
      inputLower.includes('gym') ||
      inputLower.includes('workout')) {
    if (!conditions.includes('fitness goals')) {
      conditions.push('fitness goals');
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
  
  // Diabetes + hypertension often requires cardiology
  if (conditions.includes('diabetes') && conditions.includes('hypertension')) {
    additionalCategories.push('cardiology', 'endocrinology');
  }
  
  // Back pain + stress might benefit from psychiatric help
  if (conditions.includes('back pain') && conditions.includes('stress')) {
    additionalCategories.push('psychiatry', 'coaching');
  }
  
  // Knee pain + fitness goals need both physiotherapy and training
  if (conditions.includes('knee pain') && conditions.includes('fitness goals')) {
    additionalCategories.push('physiotherapist', 'personal-trainer');
  }
  
  // Weight loss + digestive issues need dietary support
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
  
  // Add priority issue note if available
  if (primaryIssue) {
    const issue = primaryIssue.charAt(0).toUpperCase() + primaryIssue.slice(1);
    notes.push(`This plan focuses on addressing your ${issue}.`);
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
  
  // Add weight loss goal notes
  if (specificGoals.weightLoss) {
    const { amount, unit } = specificGoals.weightLoss;
    const timeFrameWeeks = extractTimeFrameInWeeks(timeFrame);
    const weeklyRate = calculateWeightLossRatePerWeek(specificGoals, timeFrameWeeks);
    
    if (weeklyRate > 0.8) {
      notes.push(`Goal of losing ${amount} ${unit} may be ambitious - plan focuses on sustainable results.`);
    } else {
      notes.push(`Weight loss goal of ${amount} ${unit} over ${timeFrame || '3 months'} is realistic with this plan.`);
    }
  }
  
  // Add note about multiple conditions
  if (medicalConditions.length > 1) {
    notes.push('Plan addresses multiple health factors for comprehensive care.');
  }
  
  // Add notes about sedentary lifestyle
  if (contextualFactors.includes('sedentary-work')) {
    notes.push('Plan includes strategies to counteract sedentary work habits.');
  }
  
  // Add event preparation note
  if (contextualFactors.includes('event-preparation')) {
    notes.push('Sessions are structured to prepare you for your upcoming event.');
  }
  
  // Add note about high severity conditions
  const highSeverityConditions = Object.entries(severity)
    .filter(([_, value]) => value >= 0.7)
    .map(([condition, _]) => condition);
    
  if (highSeverityConditions.length > 0) {
    if (highSeverityConditions.length === 1) {
      notes.push(`Priority given to addressing your ${highSeverityConditions[0]}.`);
    } else {
      notes.push(`Priority given to addressing your ${highSeverityConditions.join(' and ')}.`);
    }
  }
  
  return notes;
};

// Calculate optimal service allocation based on priorities and budgetary constraints
export const calculateOptimalServiceAllocation = (
  serviceCategories: ServiceCategory[],
  priorities: Record<ServiceCategory, number>,
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
    
    if (contextualFactors.includes('time-restricted')) {
      adjusted.minFrequency = Math.min(adjusted.minFrequency, 1);
      adjusted.maxFrequency = Math.min(adjusted.maxFrequency, 1);
      adjusted.totalSessions = Math.min(adjusted.totalSessions, 4);
    }
    
    if (contextualFactors.includes('event-preparation')) {
      if (category === 'personal-trainer' || category === 'coaching') {
        adjusted.minFrequency = Math.max(adjusted.minFrequency, 2);
        adjusted.totalSessions = Math.max(adjusted.totalSessions, 8);
      }
    }
    
    frequencyPreferences[category] = adjusted;
  });
  
  // Calculate the optimal allocation based on priorities
  const totalPriority = Object.values(priorities).reduce((sum, p) => sum + p, 0);
  
  // Sort services by priority (highest first)
  const sortedServices = [...serviceCategories]
    .sort((a, b) => (priorities[b] || 0) - (priorities[a] || 0));
  
  // Calculate raw allocation percentages
  const rawAllocations = sortedServices.map(category => {
    const priorityShare = (priorities[category] || 0) / totalPriority;
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
    const frequency = frequencyPreferences[alloc.category];
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
