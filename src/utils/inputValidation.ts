
/**
 * Utility functions for validating user inputs throughout the application
 */

/**
 * Validates if a string is non-empty and within allowed length
 * @param input String to validate
 * @param minLength Minimum allowed length (default: 1)
 * @param maxLength Maximum allowed length (default: 2000)
 * @returns Object with validation result and error message if any
 */
export function validateStringInput(
  input: string | undefined,
  minLength: number = 1,
  maxLength: number = 2000
): { isValid: boolean; errorMessage?: string } {
  if (!input) {
    return { isValid: false, errorMessage: "Input is required." };
  }
  
  const trimmedInput = input.trim();
  
  if (trimmedInput.length < minLength) {
    return { 
      isValid: false, 
      errorMessage: `Input must be at least ${minLength} character${minLength > 1 ? 's' : ''}.` 
    };
  }
  
  if (trimmedInput.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Input exceeds maximum length (${maxLength} characters).` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates a numeric input
 * @param input Number to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Object with validation result and error message if any
 */
export function validateNumericInput(
  input: number | undefined,
  min?: number,
  max?: number
): { isValid: boolean; errorMessage?: string } {
  if (input === undefined || input === null) {
    return { isValid: false, errorMessage: "Numeric input is required." };
  }
  
  if (isNaN(input)) {
    return { isValid: false, errorMessage: "Input must be a valid number." };
  }
  
  if (min !== undefined && input < min) {
    return { isValid: false, errorMessage: `Value must be at least ${min}.` };
  }
  
  if (max !== undefined && input > max) {
    return { isValid: false, errorMessage: `Value must not exceed ${max}.` };
  }
  
  return { isValid: true };
}

/**
 * Validates an array input
 * @param input Array to validate
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns Object with validation result and error message if any
 */
export function validateArrayInput<T>(
  input: T[] | undefined,
  minLength: number = 0,
  maxLength?: number
): { isValid: boolean; errorMessage?: string } {
  if (!input) {
    return { isValid: false, errorMessage: "Array input is required." };
  }
  
  if (input.length < minLength) {
    return { 
      isValid: false, 
      errorMessage: `At least ${minLength} item${minLength !== 1 ? 's' : ''} required.` 
    };
  }
  
  if (maxLength !== undefined && input.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Selection limited to ${maxLength} item${maxLength !== 1 ? 's' : ''}.` 
    };
  }
  
  return { isValid: true };
}
