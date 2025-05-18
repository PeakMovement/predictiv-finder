
/**
 * Input validation utilities for the plan generator system
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates user input to ensure it's suitable for processing
 * @param userInput User's text input
 * @returns Validation result object
 */
export function validateUserInput(userInput: string): ValidationResult {
  if (!userInput || userInput.trim().length < 3) {
    return {
      isValid: false,
      errorMessage: "Please provide more details about your health needs."
    };
  }
  
  if (userInput.trim().length > 5000) {
    return {
      isValid: false,
      errorMessage: "Your input is too long. Please keep your description under 5000 characters."
    };
  }
  
  return { isValid: true };
}
