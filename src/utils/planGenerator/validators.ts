
/**
 * Input validation utilities for the plan generator system
 */

export interface InputValidationResult {
  isValid: boolean;
  errorMessage: string;
}

/**
 * Validates user input for plan generation
 * @param input User input string
 * @returns Validation result with error message if invalid
 */
export function validateUserInput(input: string): InputValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      errorMessage: 'Input must be a non-empty string'
    };
  }
  
  if (input.trim().length < 3) {
    return {
      isValid: false,
      errorMessage: 'Input must contain at least 3 characters'
    };
  }
  
  // Check for potential harmful content
  const problematicPatterns = [
    /^[<>{}\[\]\\\/]+$/,     // Just special characters
    /script\s*:/i,           // script: injection
    /on\w+\s*=/i,            // event handlers
  ];
  
  for (const pattern of problematicPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        errorMessage: 'Input contains potentially unsafe content'
      };
    }
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Validates that a budget value is reasonable
 * @param budget Budget amount
 * @returns Validation result
 */
export function validateBudget(budget: number): InputValidationResult {
  if (typeof budget !== 'number') {
    return {
      isValid: false,
      errorMessage: 'Budget must be a number'
    };
  }
  
  if (budget <= 0) {
    return {
      isValid: false,
      errorMessage: 'Budget must be greater than zero'
    };
  }
  
  if (budget > 1000000) {
    return {
      isValid: false,
      errorMessage: 'Budget seems unreasonably high'
    };
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Validates service categories
 * @param categories List of service categories
 * @returns Validation result
 */
export function validateServiceCategories(categories: string[]): InputValidationResult {
  if (!Array.isArray(categories)) {
    return {
      isValid: false,
      errorMessage: 'Categories must be provided as an array'
    };
  }
  
  if (categories.length === 0) {
    return {
      isValid: false,
      errorMessage: 'At least one service category is required'
    };
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
}
