
import { ServiceCategory } from "../types";
import { GOAL_SYNONYMS, MENTAL_HEALTH_SYNONYMS, FITNESS_SYNONYMS } from "../symptomMappings/synonymGroups";

interface GoalAnalysisResult {
  primaryGoal: string;
  secondaryGoals: string[];
  urgency: 'low' | 'medium' | 'high';
  severity: number;
  budgetContraints: {
    hasBudgetLimit: boolean;
    estimatedBudget?: number;
    isVeryBudgetSensitive: boolean;
  };
  timeConstraints: {
    hasTimeframe: boolean;
    preferredDuration?: string;
    isUrgent: boolean;
  };
  keywordAnalysis: {
    symptomMatches: string[];
    goalMatches: string[];
    serviceMatches: ServiceCategory[];
  };
}

/**
 * Enhanced goal analyzer that extracts comprehensive information from user input
 * Improves accuracy in detecting budget constraints and problem severity
 * 
 * @param userInput The raw text input from the user
 * @returns Detailed analysis of goals, budget, and health conditions
 */
export function analyzeGoalComprehensively(userInput: string): GoalAnalysisResult {
  console.log("Performing comprehensive goal analysis");
  const inputLower = userInput.toLowerCase();
  
  // Initialize result
  const result: GoalAnalysisResult = {
    primaryGoal: "",
    secondaryGoals: [],
    urgency: 'low',
    severity: 0.5,
    budgetContraints: {
      hasBudgetLimit: false,
      isVeryBudgetSensitive: false
    },
    timeConstraints: {
      hasTimeframe: false,
      isUrgent: false
    },
    keywordAnalysis: {
      symptomMatches: [],
      goalMatches: [],
      serviceMatches: []
    }
  };
  
  // BUDGET DETECTION - Significantly enhanced
  // Check for explicit budget mentions first
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i) ||
                         inputLower.match(/cost.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    const extractedBudget = parseInt(budgetMatches[1], 10);
    result.budgetContraints.hasBudgetLimit = true;
    result.budgetContraints.estimatedBudget = extractedBudget;
    console.log(`Detected explicit budget: R${extractedBudget}`);
    
    // Determine if user is very budget sensitive (budget mentioned < 1500)
    if (extractedBudget < 1500) {
      result.budgetContraints.isVeryBudgetSensitive = true;
      console.log("User appears very budget sensitive");
    }
  }
  
  // Look for implicit budget constraints
  const budgetSensitivityTerms = [
    'cheap', 'affordable', 'low cost', 'budget', 'expensive', 
    'save money', 'limited budget', 'tight budget', 'cost effective',
    'low price', 'reasonable price', "can't afford", 'too much money',
    'payment plan', 'installments', 'economic', 'financial constraints',
    'money is tight', 'on a budget', 'financially', 'cost conscious'
  ];
  
  const budgetSensitiveMatches = budgetSensitivityTerms.filter(term => 
    inputLower.includes(term)
  );
  
  if (budgetSensitiveMatches.length > 0) {
    result.budgetContraints.hasBudgetLimit = true;
    
    // If we haven't already detected a specific budget, estimate one based on context
    if (!result.budgetContraints.estimatedBudget) {
      // Set a reasonable default based on the sensitivity words detected
      if (budgetSensitiveMatches.some(m => 
          m.includes('tight') || m.includes("can't afford") || 
          m.includes('low') || m.includes('cheap'))) {
        result.budgetContraints.estimatedBudget = 1000;
        result.budgetContraints.isVeryBudgetSensitive = true;
        console.log("Detected high budget sensitivity, setting estimate to R1000");
      } else {
        result.budgetContraints.estimatedBudget = 2000;
        console.log("Detected moderate budget sensitivity, setting estimate to R2000");
      }
    }
    
    // Multiple budget terms indicate higher sensitivity
    if (budgetSensitiveMatches.length >= 2) {
      result.budgetContraints.isVeryBudgetSensitive = true;
      console.log("Multiple budget terms detected, marking as very budget sensitive");
    }
  }
  
  // GOAL EXTRACTION - With synonyms and context
  const extractedGoals = new Set<string>();
  
  // Check all goal synonyms for matches
  Object.entries(GOAL_SYNONYMS).forEach(([goalType, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      extractedGoals.add(goalType);
      result.keywordAnalysis.goalMatches.push(goalType);
    }
  });
  
  // Check mental health specific terms
  Object.entries(MENTAL_HEALTH_SYNONYMS).forEach(([condition, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      extractedGoals.add(`mental health: ${condition}`);
      result.keywordAnalysis.symptomMatches.push(condition);
    }
  });
  
  // Check fitness specific terms
  Object.entries(FITNESS_SYNONYMS).forEach(([fitnessType, synonyms]) => {
    if (synonyms.some(syn => inputLower.includes(syn))) {
      extractedGoals.add(`fitness: ${fitnessType}`);
      result.keywordAnalysis.goalMatches.push(fitnessType);
    }
  });
  
  // Special cases with high extraction confidence
  if (inputLower.includes('marathon') || 
      inputLower.includes('race') ||
      inputLower.includes('run')) {
    extractedGoals.add('run training');
    result.keywordAnalysis.goalMatches.push('run training');
  }
  
  if (inputLower.includes('injur') || 
      inputLower.includes('recover')) {
    extractedGoals.add('injury recovery');
    result.keywordAnalysis.symptomMatches.push('injury');
  }
  
  if (inputLower.includes('weight')) {
    if (inputLower.includes('lose') || inputLower.includes('loss')) {
      extractedGoals.add('weight loss');
      result.keywordAnalysis.goalMatches.push('weight loss');
    } else if (inputLower.includes('gain')) {
      extractedGoals.add('weight gain');
      result.keywordAnalysis.goalMatches.push('weight gain');
    }
  }
  
  // SEVERITY DETECTION - Looking for indicators of problem magnitude
  const severeTerms = ['severe', 'extreme', 'terrible', 'unbearable', 'worst', 'excruciating', 'can\'t'];
  const moderateTerms = ['moderate', 'significant', 'considerable', 'noticeable'];
  const mildTerms = ['mild', 'slight', 'minor', 'little'];
  
  if (severeTerms.some(term => inputLower.includes(term))) {
    result.severity = 0.9;
    console.log("Detected severe condition indicators");
  } else if (moderateTerms.some(term => inputLower.includes(term))) {
    result.severity = 0.6;
    console.log("Detected moderate condition indicators");
  } else if (mildTerms.some(term => inputLower.includes(term))) {
    result.severity = 0.3;
    console.log("Detected mild condition indicators");
  }
  
  // URGENCY DETECTION - Much more comprehensive
  const highUrgencyTerms = ['emergency', 'urgent', 'immediately', 'asap', 'right away', 'critical', 'severe pain'];
  const mediumUrgencyTerms = ['soon', 'quickly', 'getting worse', 'deteriorating', 'need help', 'concerning'];
  
  if (highUrgencyTerms.some(term => inputLower.includes(term))) {
    result.urgency = 'high';
    result.timeConstraints.isUrgent = true;
    console.log("Detected high urgency indicators");
  } else if (mediumUrgencyTerms.some(term => inputLower.includes(term))) {
    result.urgency = 'medium';
    console.log("Detected medium urgency indicators");
  }
  
  // TIME CONSTRAINT DETECTION
  const timeframeMatches = inputLower.match(/(\d+)\s*(day|week|month|year)s?/) || 
                           inputLower.match(/(a|one)\s*(day|week|month|year)/);
  
  if (timeframeMatches) {
    result.timeConstraints.hasTimeframe = true;
    result.timeConstraints.preferredDuration = timeframeMatches[0];
    console.log("Detected timeframe:", timeframeMatches[0]);
  }
  
  // Special event detection (often implies timeframe)
  const eventTerms = ['wedding', 'vacation', 'holiday', 'trip', 'competition', 'race', 'marathon'];
  if (eventTerms.some(term => inputLower.includes(term))) {
    result.timeConstraints.hasTimeframe = true;
    console.log("Detected special event - implied timeframe");
  }
  
  // Set primary and secondary goals
  const goalArray = Array.from(extractedGoals);
  if (goalArray.length > 0) {
    result.primaryGoal = goalArray[0];
    result.secondaryGoals = goalArray.slice(1);
  }
  
  console.log("Goal analysis complete:", result);
  return result;
}

/**
 * Maps common symptoms to relevant health professionals
 * @param symptom Detected symptom
 * @returns Recommended service categories
 */
export function mapSymptomToServices(symptom: string): ServiceCategory[] {
  // Map of symptoms to appropriate service categories
  const symptomServiceMap: Record<string, ServiceCategory[]> = {
    // Pain conditions
    'back pain': ['physiotherapist', 'chiropractor', 'pain-management', 'orthopedics'],
    'neck pain': ['physiotherapist', 'chiropractor', 'pain-management'],
    'joint pain': ['physiotherapist', 'orthopedics', 'rheumatology'],
    'knee pain': ['physiotherapist', 'orthopedics', 'sports-medicine'],
    'headache': ['family-medicine', 'neurology', 'pain-management'],
    'migraine': ['neurology', 'family-medicine'],
    
    // Mental health
    'anxiety': ['psychiatry', 'psychology', 'coaching'],
    'depression': ['psychiatry', 'psychology'],
    'stress': ['psychology', 'coaching', 'psychiatry'],
    'burnout': ['psychology', 'coaching', 'psychiatry'],
    
    // Fitness goals
    'weight loss': ['dietician', 'personal-trainer', 'nutrition-coaching'],
    'muscle gain': ['personal-trainer', 'dietician', 'strength-coaching'],
    'endurance': ['personal-trainer', 'coaching', 'run-coaches'],
    'running': ['run-coaches', 'personal-trainer', 'sports-medicine'],
    
    // Injuries
    'injury': ['physiotherapist', 'sports-medicine', 'orthopedics'],
    'sprain': ['physiotherapist', 'orthopedics'],
    'strain': ['physiotherapist', 'sports-medicine'],
    'fracture': ['orthopedics', 'physiotherapist'],
    
    // Digestive issues
    'stomach': ['gastroenterology', 'dietician', 'family-medicine'],
    'digestive': ['gastroenterology', 'dietician'],
    'ibs': ['gastroenterology', 'dietician'],
    'acid reflux': ['gastroenterology', 'family-medicine'],
    
    // Cardiac
    'heart': ['cardiology', 'family-medicine'],
    'blood pressure': ['cardiology', 'family-medicine'],
    'cholesterol': ['cardiology', 'dietician'],
    
    // General
    'fatigue': ['family-medicine', 'endocrinology'],
    'tired': ['family-medicine', 'endocrinology'],
    'dizzy': ['family-medicine', 'neurology'],
    'general health': ['family-medicine']
  };
  
  return symptomServiceMap[symptom.toLowerCase()] || ['family-medicine'];
}
