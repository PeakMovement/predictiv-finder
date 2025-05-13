
/**
 * Input validation functions for professional recommendations
 */

import { logger } from "@/utils/cache";

/**
 * Validates the user input for professional recommendation generation
 * @param userInput Text input from the user
 * @returns Object with validation result and error message if any
 */
export function validateUserInput(userInput: string): { isValid: boolean; errorMessage?: string } {
  if (!userInput || userInput.trim() === '') {
    return { isValid: false, errorMessage: "Please provide some information about your health needs." };
  }
  
  if (userInput.length < 10) {
    return { isValid: false, errorMessage: "Please provide more details for better recommendations." };
  }
  
  if (userInput.length > 2000) {
    return { isValid: false, errorMessage: "Input exceeds maximum length (2000 characters)." };
  }
  
  return { isValid: true };
}
