
import { ServiceCategory } from "../types";

/**
 * Enhanced budget extraction with better pattern recognition and context analysis
 * 
 * @param userInput Full user input text
 * @returns Detailed budget information
 */
export function extractExtendedBudget(userInput: string): {
  amount: number | undefined;
  confidence: number;
  constraintLevel: 'none' | 'low' | 'medium' | 'high';
  preferredSetup?: 'monthly' | 'once-off' | 'package';
  contextClues: string[];
} {
  const inputLower = userInput.toLowerCase();
  const result = {
    amount: undefined as number | undefined,
    confidence: 0,
    constraintLevel: 'none' as 'none' | 'low' | 'medium' | 'high',
    contextClues: [] as string[]
  };
  
  // Check all possible patterns for budget mentions
  const budgetPatterns = [
    /r\s*(\d{1,6})/i,                         // R1000
    /budget.*?(\d{1,6})/i,                    // budget of 1000
    /afford.*?(\d{1,6})/i,                    // can afford 1000
    /cost.*?(\d{1,6})/i,                      // cost of 1000
    /spend.*?(\d{1,6})/i,                     // spend 1000
    /pay.*?(\d{1,6})/i,                       // pay 1000
    /(\d{1,6}).*?budget/i,                    // 1000 budget
    /(\d{1,6}).*?rands?/i,                    // 1000 rand
    /(\d{1,6}).*?per month/i,                 // 1000 per month
    /(\d{1,6}).*?a month/i,                   // 1000 a month
    /(\d{1,6}).*?monthly/i                    // 1000 monthly
  ];
  
  // Try to find a match with any pattern
  for (const pattern of budgetPatterns) {
    const match = inputLower.match(pattern);
    if (match && match[1]) {
      result.amount = parseInt(match[1], 10);
      result.confidence = 0.9;
      result.contextClues.push(`Explicit budget amount: R${result.amount}`);
      break;
    }
  }
  
  // Check for budget setup preferences
  if (inputLower.includes('per month') || 
      inputLower.includes('monthly') || 
      inputLower.includes('a month')) {
    result.preferredSetup = 'monthly';
    result.contextClues.push('Monthly payment preference detected');
  } else if (inputLower.includes('once off') || 
            inputLower.includes('one-time') || 
            inputLower.includes('single payment')) {
    result.preferredSetup = 'once-off';
    result.contextClues.push('One-time payment preference detected');
  } else if (inputLower.includes('package') || 
            inputLower.includes('bundle') || 
            inputLower.includes('program')) {
    result.preferredSetup = 'package';
    result.contextClues.push('Package/bundle payment preference detected');
  }
  
  // Check for budget constraint level terms
  const highConstraintTerms = [
    'tight budget', 'very limited', 'low budget', 'not much money',
    'can\'t afford much', 'minimal budget', 'strict budget',
    'financial constraints', 'cheap', 'cheapest'
  ];
  
  const mediumConstraintTerms = [
    'budget conscious', 'reasonable price', 'affordable', 'not too expensive',
    'value for money', 'cost effective', 'mid-range', 'moderate budget'
  ];
  
  const lowConstraintTerms = [
    'flexible budget', 'not concerned about cost', 'price not a factor',
    'whatever it costs', 'high quality', 'premium', 'best regardless of cost'
  ];
  
  // Determine constraint level based on terminology
  if (highConstraintTerms.some(term => inputLower.includes(term))) {
    result.constraintLevel = 'high';
    result.contextClues.push('High budget constraint language detected');
    
    // If no explicit budget but high constraints, set a conservative default
    if (result.amount === undefined) {
      result.amount = 1000;
      result.confidence = 0.6;
      result.contextClues.push('Applied default budget for high constraints: R1000');
    }
  } else if (mediumConstraintTerms.some(term => inputLower.includes(term))) {
    result.constraintLevel = 'medium';
    result.contextClues.push('Medium budget constraint language detected');
    
    // Set a moderate default budget
    if (result.amount === undefined) {
      result.amount = 2000;
      result.confidence = 0.5;
      result.contextClues.push('Applied default budget for medium constraints: R2000');
    }
  } else if (lowConstraintTerms.some(term => inputLower.includes(term))) {
    result.constraintLevel = 'low';
    result.contextClues.push('Low budget constraint language detected');
    
    // Set a generous default budget
    if (result.amount === undefined) {
      result.amount = 4000;
      result.confidence = 0.5;
      result.contextClues.push('Applied default budget for low constraints: R4000');
    }
  } else if (result.amount === undefined) {
    // No explicit budget or constraint language
    result.constraintLevel = 'none';
    result.confidence = 0;
  }
  
  return result;
}

/**
 * Gets service affordability tiers based on budget amount
 */
export function getServiceAffordabilityTiers(budget: number | undefined): {
  affordable: ServiceCategory[];
  moderate: ServiceCategory[];
  expensive: ServiceCategory[];
} {
  // Default result with empty categories
  const result = {
    affordable: [] as ServiceCategory[],
    moderate: [] as ServiceCategory[],
    expensive: [] as ServiceCategory[]
  };
  
  // If no budget, return empty result
  if (!budget) {
    return result;
  }
  
  // Approximate costs per session
  const serviceCosts: Record<ServiceCategory, number> = {
    'family-medicine': 600,
    'physiotherapist': 700,
    'dietician': 550,
    'personal-trainer': 450,
    'coaching': 500,
    'psychology': 900,
    'nutrition-coaching': 450,
    'strength-coaching': 450,
    'biokineticist': 700,
    'psychiatry': 1200,
    'pain-management': 900,
    'podiatrist': 750,
    'general-practitioner': 600,
    'sport-physician': 1200,
    'orthopedic-surgeon': 2000,
    'gastroenterology': 1400,
    'massage-therapy': 500,
    'occupational-therapy': 700,
    'physical-therapy': 800,
    'chiropractor': 650,
    'nurse-practitioner': 600,
    'cardiology': 1400,
    'dermatology': 1000,
    'neurology': 1300,
    'endocrinology': 1200,
    'urology': 1100,
    'oncology': 1600,
    'rheumatology': 1000,
    'pediatrics': 900,
    'geriatrics': 950,
    'sports-medicine': 1100,
    'internal-medicine': 1000,
    'orthopedics': 1400,
    'neurosurgery': 2200,
    'infectious-disease': 1300,
    'plastic-surgery': 2100,
    'obstetrics-gynecology': 1100,
    'emergency-medicine': 1500,
    'anesthesiology': 1700,
    'radiology': 1200,
    'geriatric-medicine': 900,
    'run-coaches': 450,
    'all': 0
  };
  
  // Calculate how many sessions would be affordable
  Object.entries(serviceCosts).forEach(([service, cost]) => {
    const sessionsAffordable = Math.floor(budget / cost);
    
    if (sessionsAffordable >= 4) {
      // Can afford multiple sessions
      result.affordable.push(service as ServiceCategory);
    } else if (sessionsAffordable >= 2) {
      // Can afford a couple sessions
      result.moderate.push(service as ServiceCategory);
    } else {
      // Can afford one or no sessions
      result.expensive.push(service as ServiceCategory);
    }
  });
  
  return result;
}
