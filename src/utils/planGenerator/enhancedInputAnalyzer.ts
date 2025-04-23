
import { ServiceCategory } from "./types";
import { AnalyzedInput } from "./enhancedTypes";
import { CONDITION_TO_SERVICES } from "./serviceMappings";

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
  'minor': 0.3
};

// Lifestyle and preference keywords
const PREFERENCE_KEYWORDS: Record<string, Record<string, string>> = {
  'student': { occupation: 'student' },
  'work': { occupation: 'professional' },
  'professional': { occupation: 'professional' },
  'busy': { schedule: 'busy' },
  'no time': { schedule: 'busy' },
  'morning': { preferredTime: 'morning' },
  'evening': { preferredTime: 'evening' },
  'weekend': { preferredTime: 'weekend' },
  'budget': { budgetConstraint: 'tight' },
  'afford': { budgetConstraint: 'tight' },
  'cheap': { budgetConstraint: 'tight' },
  'vegan': { diet: 'vegan' },
  'vegetarian': { diet: 'vegetarian' },
  'gluten': { diet: 'gluten-free' }
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
  const medicalConditions: string[] = [];
  const serviceCategories = new Set<ServiceCategory>();
  const severity: Record<string, number> = {};
  const preferences: Record<string, string> = {};
  let timeAvailability = 10; // Default hours per week
  let extractedBudget: number | undefined = undefined;
  let extractedLocation: string | undefined = undefined;
  let preferOnline: boolean | undefined = undefined;
  let timeFrame: string | undefined = undefined;
  const specificGoals: Record<string, any> = {};

  console.log("Enhanced analysis of user input:", inputLower);

  // Extract budget constraints
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/pay\s*r?\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    extractedBudget = parseInt(budgetMatches[1], 10);
    console.log("Extracted budget:", extractedBudget);
  }
  
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
      extractedBudget = 1000; // Default modest budget
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
  for (const [keyword, severityValue] of Object.entries(SEVERITY_KEYWORDS)) {
    if (inputLower.includes(keyword)) {
      // Look for condition mentioned near severity keyword
      const nearbyWords = 5; // Words to check before and after
      const words = inputLower.split(/\s+/);
      
      for (let i = 0; i < words.length; i++) {
        if (words[i] === keyword) {
          // Check nearby words for conditions
          const start = Math.max(0, i - nearbyWords);
          const end = Math.min(words.length, i + nearbyWords);
          
          for (let j = start; j < end; j++) {
            for (const condition of Object.keys(CONDITION_TO_SERVICES)) {
              if (condition.split(' ').some(word => words[j] === word)) {
                severity[condition] = severityValue;
                console.log(`Found severity "${keyword}" (${severityValue}) for condition "${condition}"`);
                
                // Add the condition if not already present
                if (!medicalConditions.includes(condition)) {
                  medicalConditions.push(condition);
                }
              }
            }
          }
        }
      }
    }
  }

  // Extract user preferences
  for (const [keyword, preferencePairs] of Object.entries(PREFERENCE_KEYWORDS)) {
    if (inputLower.includes(keyword)) {
      for (const [key, value] of Object.entries(preferencePairs)) {
        preferences[key] = value;
        console.log(`Extracted preference: ${key} = ${value}`);
      }
    }
  }

  // Check for specific conditions and service categories
  // Use existing SYMPTOM_TO_CONDITION and GOAL_TO_SERVICES logic from inputAnalyzer.ts
  // This would normally be an import from the existing inputAnalyzer.ts
  
  // Special handling for fitness, weight loss and toning goals
  if (inputLower.includes('lose weight') || 
      inputLower.includes('tone') || 
      inputLower.includes('kg') || 
      inputLower.includes('toning') ||
      inputLower.includes('train') || 
      inputLower.includes('fitness')) {
    console.log("Adding personal trainer and dietician based on fitness/weight goals");
    serviceCategories.add('personal-trainer');
    serviceCategories.add('dietician');
    
    if (!medicalConditions.includes('weight loss')) {
      medicalConditions.push('weight loss');
    }
    if (!medicalConditions.includes('fitness goals')) {
      medicalConditions.push('fitness goals');
    }
  }

  // Wedding preparation is almost always fitness + nutrition focused
  if (inputLower.includes('wedding')) {
    console.log("Wedding preparation detected, adding fitness and nutrition services");
    serviceCategories.add('personal-trainer');
    serviceCategories.add('dietician');
    
    if (!medicalConditions.includes('wedding preparation')) {
      medicalConditions.push('wedding preparation');
    }
    
    // Set a default timeframe if not already specified
    if (!timeFrame && inputLower.match(/in\s+(\d+)\s*(weeks?|months?|days?)/i)) {
      // Use the matched timeframe
    } else if (!timeFrame) {
      timeFrame = '3 months'; // Default wedding prep timeframe
    }
  }

  // For back pain
  if (inputLower.includes('back') && inputLower.includes('pain')) {
    medicalConditions.push('back pain');
    serviceCategories.add('physiotherapist');
    // Set default severity if not already set
    if (!severity['back pain']) {
      severity['back pain'] = inputLower.includes('severe') ? 0.8 : 0.5;
    }
  }

  // If no services found, add default ones
  if (serviceCategories.size === 0 && medicalConditions.length === 0) {
    serviceCategories.add('family-medicine');
    console.log("No specific needs detected, adding default: family-medicine");
  }
  
  // Apply default severity for conditions without explicit severity
  medicalConditions.forEach(condition => {
    if (!severity[condition]) {
      severity[condition] = 0.5; // Default medium severity
    }
  });

  return {
    medicalConditions,
    suggestedCategories: Array.from(serviceCategories),
    budget: extractedBudget,
    location: extractedLocation,
    preferOnline,
    severity,
    preferences,
    timeAvailability,
    timeFrame,
    specificGoals
  };
};

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
  preferOnline?: boolean
): string[] => {
  const notes: string[] = [];
  
  if (preferOnline) {
    notes.push('Services prioritized for online delivery where available.');
  }
  
  if (location) {
    notes.push(`Plan tailored for providers in ${location}.`);
  }
  
  if (preferences.schedule === 'busy') {
    notes.push('Plan designed for minimal time commitment.');
  }
  
  if (preferences.occupation === 'student') {
    notes.push('Student-friendly pricing options prioritized.');
  }
  
  if (preferences.diet) {
    notes.push(`${preferences.diet.charAt(0).toUpperCase() + preferences.diet.slice(1)} dietary needs considered.`);
  }
  
  if (specificGoals.weightLoss) {
    const { amount, unit } = specificGoals.weightLoss;
    const timeFrameWeeks = extractTimeFrameInWeeks(timeFrame);
    const weeklyRate = calculateWeightLossRatePerWeek(specificGoals, timeFrameWeeks);
    
    if (weeklyRate > 0.8) {
      notes.push(`Goal of losing ${amount}${unit} may be aggressive - focus on sustainable results.`);
    } else {
      notes.push(`Weight loss goal of ${amount}${unit} over ${timeFrame || '3 months'} is achievable.`);
    }
  }
  
  if (medicalConditions.length > 1) {
    notes.push('Plan addresses multiple health factors for comprehensive care.');
  }
  
  // Identify high-severity conditions
  const highSeverityConditions = Object.entries(severity)
    .filter(([_, value]) => value >= 0.7)
    .map(([condition, _]) => condition);
    
  if (highSeverityConditions.length > 0) {
    notes.push(`Priority given to addressing ${highSeverityConditions.join(', ')}.`);
  }
  
  return notes;
};
