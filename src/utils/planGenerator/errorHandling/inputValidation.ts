
import { PlanGenerationError, PlanGenerationErrorType } from "./planGenerationError";

/**
 * Validates user input for health plan generation
 * @param query User input query string
 * @throws PlanGenerationError if validation fails
 */
export function validateHealthPlanInput(query: string): void {
  if (!query || typeof query !== "string") {
    throw new PlanGenerationError(
      "Invalid input: Input must be a non-empty string",
      PlanGenerationErrorType.INPUT_VALIDATION,
      "Please enter your health needs to generate a plan."
    );
  }
  
  if (query.trim().length < 5) {
    throw new PlanGenerationError(
      "Input too short: Please provide more details",
      PlanGenerationErrorType.INPUT_VALIDATION,
      "Please provide more details about your health needs.",
      { inputLength: query.trim().length },
      [
        "Describe your symptoms or health goals",
        "Mention any specific conditions you're experiencing",
        "Include your fitness goals and timeframe",
        "Specify your budget constraints if any"
      ]
    );
  }
  
  // Check for potential non-health related queries
  const nonHealthKeywords = [
    'weather', 'stock', 'news', 'political', 'game', 'movie', 'covid', 
    'election', 'bitcoin', 'crypto', 'sports'
  ];
  
  const queryLower = query.toLowerCase();
  const matchedKeywords = nonHealthKeywords.filter(keyword => queryLower.includes(keyword));
  
  if (matchedKeywords.length > 0 && !queryLower.includes('health') && !queryLower.includes('pain') && 
      !queryLower.includes('doctor') && !queryLower.includes('diet')) {
    throw new PlanGenerationError(
      `Input may not be health-related: Contains keywords [${matchedKeywords.join(', ')}]`,
      PlanGenerationErrorType.INPUT_VALIDATION,
      "Your query doesn't appear to be health-related. Please describe your health needs or goals.",
      { matchedKeywords },
      ["Focus on your health symptoms or fitness goals", "Describe what you want to achieve with your health"]
    );
  }
}

/**
 * Validates budget input
 */
export function validateBudgetInput(budget: any): number | undefined {
  if (budget === undefined || budget === null) {
    return undefined;
  }
  
  // Try to convert to number if it's a string
  const numBudget = typeof budget === 'string' ? parseFloat(budget) : budget;
  
  if (isNaN(numBudget) || typeof numBudget !== 'number') {
    throw new PlanGenerationError(
      "Invalid budget: Must be a number",
      PlanGenerationErrorType.BUDGET_CALCULATION,
      "Please provide a valid budget amount."
    );
  }
  
  if (numBudget < 0) {
    throw new PlanGenerationError(
      "Invalid budget: Cannot be negative",
      PlanGenerationErrorType.BUDGET_CALCULATION,
      "Budget amount cannot be negative."
    );
  }
  
  if (numBudget > 1000000) {
    throw new PlanGenerationError(
      "Invalid budget: Exceeds maximum allowed",
      PlanGenerationErrorType.BUDGET_CALCULATION,
      "The budget amount is unusually high. Please enter a more reasonable amount."
    );
  }
  
  return numBudget;
}

/**
 * Exports all input validation functions
 */
export const InputValidation = {
  validateHealthPlanInput,
  validateBudgetInput
};

export default InputValidation;
