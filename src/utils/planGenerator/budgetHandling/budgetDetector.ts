
import { ServiceCategory } from "../types";

/**
 * Enhanced budget constraint detection with improved patterns
 */
export const detectBudgetConstraints = (
  inputLower: string,
  contraindications: ServiceCategory[]
): { budget: number | null; isStrict: boolean } => {
  // Enhanced budget detection with better regex patterns
  const budgetMatch = inputLower.match(/r\s*(\d{1,6})/i) || 
                     inputLower.match(/budget[^0-9]*(\d{1,6})/i) ||
                     inputLower.match(/afford[^0-9]*(\d{1,6})/i) ||
                     inputLower.match(/spend[^0-9]*(\d{1,6})/i) ||
                     inputLower.match(/max[^0-9]*(\d{1,6})/i) ||
                     inputLower.match(/maximum[^0-9]*(\d{1,6})/i) ||
                     inputLower.match(/not more than[^0-9]*(\d{1,6})/i);
  
  // Determine if the budget constraint is strict
  const strictBudgetPhrases = [
    "can't spend more", "cannot spend more", "maximum", "max", 
    "tight budget", "strict budget", "only", "just", "limited to"
  ];
  
  const isStrict = strictBudgetPhrases.some(phrase => inputLower.includes(phrase));
  
  if (budgetMatch && budgetMatch[1]) {
    const budget = parseInt(budgetMatch[1], 10);
    console.log(`*** DETECTED SPECIFIC BUDGET: R${budget} (Strict: ${isStrict}) ***`);
    
    handleLowBudgetConstraints(budget, contraindications);
    
    return { budget, isStrict };
  }
  
  // Check for mentions of budget constraints without specific numbers
  const budgetConstraintTerms = [
    'tight budget', 'limited budget', 'cheap', 'affordable', 
    'low cost', "can't afford", 'budget constraint', 'expensive',
    'low price', 'reasonable price'
  ];
  
  const hasBudgetConstraint = budgetConstraintTerms.some(term => inputLower.includes(term));
  if (hasBudgetConstraint) {
    // Set default modest budget based on constraint language
    return { budget: 1000, isStrict: isStrict };
  }
  
  return { budget: null, isStrict: false };
};

/**
 * Handle constraints for low budgets
 */
function handleLowBudgetConstraints(budget: number, contraindications: ServiceCategory[]): void {
  if (budget < 1000) {
    // For very low budgets, avoid expensive specialists
    const expensiveSpecialists: ServiceCategory[] = [
      'cardiology', 'neurology', 'gastroenterology', 'orthopedics', 
      'psychiatry', 'neurosurgery', 'oncology'
    ];
    
    expensiveSpecialists.forEach(specialist => {
      if (!contraindications.includes(specialist)) {
        contraindications.push(specialist);
        console.log(`Added ${specialist} to contraindications due to tight budget of R${budget}`);
      }
    });
    
    // For extremely tight budgets under R600, contraindicate everything except family medicine
    if (budget < 600) {
      const allSpecialists: ServiceCategory[] = [
        'dietician', 'personal-trainer', 'physiotherapist', 'coaching',
        'biokineticist', 'endocrinology', 'cardiology', 'neurology', 
        'gastroenterology', 'orthopedics', 'psychiatry'
      ];
      
      allSpecialists.forEach(specialist => {
        if (specialist !== 'family-medicine' && !contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to extremely tight budget of R${budget}`);
        }
      });
    }
  }
}

/**
 * Parse monthly budget information from input
 */
export const parseMonthlyBudget = (inputLower: string): { 
  monthlyAmount: number | null; 
  totalAmount: number | null;
  timeframe: number | null;
} => {
  let monthlyAmount = null;
  let totalAmount = null;
  let timeframe = null;
  
  // Check for monthly budget specification
  const monthlyMatch = inputLower.match(/r\s*(\d{1,6})(?:\s*\/|\s+per)\s*month/i) || 
                       inputLower.match(/(\d{1,6})\s*(?:rand|zar)(?:\s*\/|\s+per)\s*month/i);
                       
  if (monthlyMatch && monthlyMatch[1]) {
    monthlyAmount = parseInt(monthlyMatch[1], 10);
    console.log(`Detected monthly budget: R${monthlyAmount}/month`);
  }
  
  // Check for total budget with timeframe
  const timeframeMatch = inputLower.match(/(\d+)\s*(?:week|month)/i);
  if (timeframeMatch) {
    const value = parseInt(timeframeMatch[1], 10);
    const unit = timeframeMatch[0].toLowerCase().includes('week') ? 'week' : 'month';
    
    timeframe = unit === 'week' ? value : value * 4; // Convert to weeks for consistency
    console.log(`Detected timeframe: ${value} ${unit}s (${timeframe} weeks)`);
    
    // Look for total budget
    const budgetMatch = detectBudgetConstraints(inputLower, []);
    if (budgetMatch.budget) {
      totalAmount = budgetMatch.budget;
      
      // If we have a total budget and timeframe but no monthly amount, calculate it
      if (!monthlyAmount && timeframe) {
        const weeks = timeframe;
        const months = weeks / 4;
        monthlyAmount = Math.round(totalAmount / months);
        console.log(`Calculated monthly budget: R${monthlyAmount}/month from total R${totalAmount} over ${timeframe} weeks`);
      }
    }
  }
  
  // If we have just a budget but no specification, assume it's monthly
  if (!monthlyAmount && !totalAmount) {
    const budgetMatch = detectBudgetConstraints(inputLower, []);
    if (budgetMatch.budget) {
      monthlyAmount = budgetMatch.budget;
      console.log(`Assuming budget is monthly: R${monthlyAmount}/month`);
    }
  }
  
  return { monthlyAmount, totalAmount, timeframe };
};
