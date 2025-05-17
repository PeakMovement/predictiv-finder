
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Enhanced budget information extraction from user input
 * Detects budget constraints, payment preferences, and contextual clues
 */
export function extractBudgetInfo(
  userInput: string
): {
  amount: number | undefined;
  confidence: number;
  constraintLevel: "none" | "low" | "medium" | "high";
  contextClues: string[];
  preferredSetup?: 'once-off' | 'monthly' | 'package' | 'pay-as-you-go' | 'not-sure';
} {
  const inputLower = userInput.toLowerCase();
  const result = {
    amount: undefined as number | undefined,
    confidence: 0,
    constraintLevel: "none" as "none" | "low" | "medium" | "high",
    contextClues: [] as string[],
    preferredSetup: 'not-sure' as 'once-off' | 'monthly' | 'package' | 'pay-as-you-go' | 'not-sure'
  };
  
  // Look for explicit budget mentions with numbers
  const budgetMatches = inputLower.match(/budget(?:\s+is|\s+of)?\s+(\d[\d,\s]*)/);
  const affordMatches = inputLower.match(/(?:can |could |able to )afford\s+(\d[\d,\s]*)/);
  const spendMatches = inputLower.match(/(?:can |could |want to |willing to )spend\s+(\d[\d,\s]*)/);
  const costMatches = inputLower.match(/cost(?:\s+up to|\s+around)?\s+(\d[\d,\s]*)/);
  const limitMatches = inputLower.match(/limit(?:\s+is|\s+of)?\s+(\d[\d,\s]*)/);
  
  // Extract amount from first matching pattern
  const extractedAmount = 
    (budgetMatches && budgetMatches[1]) || 
    (affordMatches && affordMatches[1]) || 
    (spendMatches && spendMatches[1]) || 
    (costMatches && costMatches[1]) ||
    (limitMatches && limitMatches[1]);
  
  if (extractedAmount) {
    // Clean up and convert to number
    const cleanNumber = extractedAmount.replace(/[^\d]/g, '');
    result.amount = parseInt(cleanNumber, 10);
    result.confidence = 0.9;
    result.contextClues.push(`Explicit budget: ${result.amount}`);
  }
  
  // Determine payment preference
  if (inputLower.match(/\b(once-off|one-time|single)\b/)) {
    result.preferredSetup = 'once-off';
    result.contextClues.push("Prefers once-off payment");
  } else if (inputLower.match(/\b(monthly|per month|each month)\b/)) {
    result.preferredSetup = 'monthly';
    result.contextClues.push("Prefers monthly payment");
  } else if (inputLower.match(/\b(package|packages|bundle)\b/)) {
    result.preferredSetup = 'package';
    result.contextClues.push("Prefers package deals");
  } else if (inputLower.match(/\b(pay as (I|you) go|session by session)\b/)) {
    result.preferredSetup = 'pay-as-you-go';
    result.contextClues.push("Prefers pay-as-you-go");
  }
  
  // Detect budget constraint level
  const tightBudgetPhrases = [
    "tight budget", "limited budget", "low budget", "strict budget", 
    "not expensive", "affordable", "cheap", "cost-effective", "budget friendly"
  ];
  
  const flexibleBudgetPhrases = [
    "flexible budget", "not concerned about cost", "price is not an issue",
    "willing to pay", "worth the investment", "premium services"
  ];
  
  // Check for tight budget indicators
  const hasTightBudget = tightBudgetPhrases.some(phrase => inputLower.includes(phrase));
  if (hasTightBudget) {
    result.constraintLevel = "high";
    result.contextClues.push("Indicates tight budget constraints");
  }
  
  // Check for flexible budget indicators
  const hasFlexibleBudget = flexibleBudgetPhrases.some(phrase => inputLower.includes(phrase));
  if (hasFlexibleBudget) {
    result.constraintLevel = "low";
    result.contextClues.push("Indicates flexible budget");
  }
  
  // Default constraint level if we have an amount but no other indicators
  if (result.amount && result.constraintLevel === "none") {
    result.constraintLevel = "medium";
  }
  
  return result;
}

/**
 * Estimate service costs based on budget constraints
 */
export function estimateServiceCosts(
  services: ServiceCategory[],
  budget: number | undefined,
  preferredSetup: string = 'monthly'
): Record<ServiceCategory, number> {
  // If no budget specified, use default costs
  if (!budget) {
    const defaultCosts = createServiceCategoryRecord(0);
    services.forEach(service => {
      // Use standard costs from a pricing database
      defaultCosts[service] = 500; // Default cost per service
    });
    return defaultCosts;
  }
  
  // Calculate cost distribution based on budget
  const serviceCosts = createServiceCategoryRecord(0);
  
  // Different allocation strategies based on payment preference
  switch (preferredSetup) {
    case 'once-off':
      // Allocate the entire budget across services
      services.forEach(service => {
        serviceCosts[service] = Math.round(budget / services.length);
      });
      break;
      
    case 'monthly':
      // Allocate monthly budget across services with multiple sessions
      services.forEach(service => {
        // Assume 4 sessions per month for certain services
        const sessionsPerMonth = 
          service === 'personal-trainer' || 
          service === 'coaching' ? 4 : 2;
        
        serviceCosts[service] = Math.round(budget / (services.length * sessionsPerMonth));
      });
      break;
      
    case 'package':
      // Package deals typically offer small discounts
      services.forEach(service => {
        const baseServiceCost = 500; // Default service cost
        const discountFactor = 0.9; // 10% package discount
        serviceCosts[service] = Math.round(baseServiceCost * discountFactor);
      });
      break;
      
    default:
      // Default allocation - distribute budget evenly
      services.forEach(service => {
        serviceCosts[service] = Math.round(budget / services.length);
      });
  }
  
  return serviceCosts;
}

/**
 * Determine optimal session distribution based on budget
 */
export function optimizeSessionDistribution(
  budget: number,
  services: ServiceCategory[]
): Record<ServiceCategory, number> {
  const sessionAllocations = createServiceCategoryRecord(0);
  
  // Basic algorithm: prioritize core services with at least one session
  let remainingBudget = budget;
  
  // Ensure at least one session per service
  services.forEach(service => {
    const serviceCost = 500; // Default cost per session
    if (remainingBudget >= serviceCost) {
      sessionAllocations[service] = 1;
      remainingBudget -= serviceCost;
    }
  });
  
  // Distribute remaining budget starting with most important services
  // Here we use a simplified approach of allocating from first to last
  let index = 0;
  while (remainingBudget > 0 && index < services.length) {
    const service = services[index];
    const serviceCost = 500; // Default cost per session
    
    if (remainingBudget >= serviceCost) {
      sessionAllocations[service]++;
      remainingBudget -= serviceCost;
    } else {
      // Move to next service if we can't afford more sessions of current
      index++;
    }
  }
  
  return sessionAllocations;
}
