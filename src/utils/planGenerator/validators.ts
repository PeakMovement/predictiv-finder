
/**
 * Input validation utilities
 */
import { logger } from "@/utils/cache";

/**
 * Validates user input for health plan generation
 * @param userInput Raw text input from the user
 * @returns Validation result with success status and error message if applicable
 */
export function validateUserInput(userInput: string) {
  // Simple validation for now
  if (!userInput || userInput.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: "Please provide some information about your health needs."
    };
  }

  if (userInput.trim().length < 5) {
    return {
      isValid: false,
      errorMessage: "Please provide more details about your health needs."
    };
  }

  // Check for potential harmful or inappropriate content
  const lowerInput = userInput.toLowerCase();
  const blockedPhrases = [
    "suicide", "kill myself", "harm myself", "self harm",
    "die", "death", "murder", "illegal drugs"
  ];
  
  for (const phrase of blockedPhrases) {
    if (lowerInput.includes(phrase)) {
      logger.warn(`Potentially concerning content detected: "${phrase}"`);
      return {
        isValid: false,
        errorMessage: "This type of content cannot be processed. Please contact a healthcare provider directly."
      };
    }
  }

  return {
    isValid: true,
    errorMessage: ""
  };
}

/**
 * Validates if a budget value is reasonable
 * @param budget The budget amount to validate
 * @returns True if the budget is valid, false otherwise
 */
export function validateBudget(budget: number) {
  if (isNaN(budget) || budget <= 0) {
    return false;
  }
  
  // Set an upper limit to prevent unrealistic values
  if (budget > 100000) {
    return false;
  }
  
  return true;
}
