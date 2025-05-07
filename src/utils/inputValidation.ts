
/**
 * Utility functions for validating user inputs throughout the application
 */

/**
 * Validates if a string is non-empty and within allowed length
 * Provides clear, user-friendly error messages
 * 
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
      errorMessage: `Please provide at least ${minLength} character${minLength > 1 ? 's' : ''}. More detailed information helps us provide better results.` 
    };
  }
  
  if (trimmedInput.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Your input exceeds the maximum length of ${maxLength} characters. Please shorten your text.` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates a numeric input with clear error messages
 * 
 * @param input Number to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param fieldName Optional field name for more specific error messages
 * @returns Object with validation result and error message if any
 */
export function validateNumericInput(
  input: number | undefined,
  min?: number,
  max?: number,
  fieldName: string = "Value"
): { isValid: boolean; errorMessage?: string } {
  if (input === undefined || input === null) {
    return { isValid: false, errorMessage: `${fieldName} is required.` };
  }
  
  if (isNaN(input)) {
    return { isValid: false, errorMessage: `${fieldName} must be a valid number.` };
  }
  
  if (min !== undefined && input < min) {
    return { isValid: false, errorMessage: `${fieldName} must be at least ${min}.` };
  }
  
  if (max !== undefined && input > max) {
    return { isValid: false, errorMessage: `${fieldName} must not exceed ${max}.` };
  }
  
  return { isValid: true };
}

/**
 * Validates an array input with improved error messages
 * 
 * @param input Array to validate
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @param itemName Optional name of items for more specific error messages
 * @returns Object with validation result and error message if any
 */
export function validateArrayInput<T>(
  input: T[] | undefined,
  minLength: number = 0,
  maxLength?: number,
  itemName: string = "item"
): { isValid: boolean; errorMessage?: string } {
  if (!input) {
    return { isValid: false, errorMessage: "Selection is required." };
  }
  
  if (input.length < minLength) {
    return { 
      isValid: false, 
      errorMessage: `Please select at least ${minLength} ${minLength !== 1 ? itemName + 's' : itemName}.` 
    };
  }
  
  if (maxLength !== undefined && input.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Selection limited to ${maxLength} ${maxLength !== 1 ? itemName + 's' : itemName}. Please remove some selections.` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates email format
 * 
 * @param email Email string to validate
 * @returns Object with validation result and error message if any
 */
export function validateEmail(email: string): { isValid: boolean; errorMessage?: string } {
  if (!email || email.trim() === '') {
    return { isValid: false, errorMessage: "Email address is required." };
  }
  
  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, errorMessage: "Please enter a valid email address." };
  }
  
  return { isValid: true };
}

/**
 * Validates phone number format
 * Supports various formats with or without country codes
 * 
 * @param phone Phone number string to validate
 * @returns Object with validation result and error message if any
 */
export function validatePhone(phone: string): { isValid: boolean; errorMessage?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: false, errorMessage: "Phone number is required." };
  }
  
  // Remove common phone number formatting characters
  const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's a reasonable length for a phone number (international or local)
  if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
    return { isValid: false, errorMessage: "Please enter a valid phone number." };
  }
  
  // Ensure it only contains digits and possibly a leading +
  if (!/^\+?\d+$/.test(cleanedPhone)) {
    return { isValid: false, errorMessage: "Phone number can only contain digits and an optional + prefix." };
  }
  
  return { isValid: true };
}
