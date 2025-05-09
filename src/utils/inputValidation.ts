
import { ServiceCategory } from "./planGenerator/types";

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
): { isValid: boolean; errorMessage?: string; improvementSuggestions?: string[] } {
  if (!input) {
    return { 
      isValid: false, 
      errorMessage: "Input is required.",
      improvementSuggestions: [
        "Please provide some information about your health needs."
      ]
    };
  }
  
  const trimmedInput = input.trim();
  
  if (trimmedInput.length < minLength) {
    return { 
      isValid: false, 
      errorMessage: `Please provide at least ${minLength} character${minLength > 1 ? 's' : ''}. More detailed information helps us provide better results.`,
      improvementSuggestions: [
        "Describe any symptoms or health concerns you're experiencing",
        "Mention your health goals or outcomes you hope to achieve",
        "Include any relevant timeframes for your health journey"
      ]
    };
  }
  
  if (trimmedInput.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Your input exceeds the maximum length of ${maxLength} characters. Please shorten your text.`,
      improvementSuggestions: [
        "Focus on your primary health concerns",
        "Be concise about your main goals",
        "Summarize your situation more briefly"
      ]
    };
  }
  
  // Provide content-related suggestions
  const lowerInput = trimmedInput.toLowerCase();
  const improvementSuggestions: string[] = [];
  
  if (!lowerInput.includes('budget') && !lowerInput.match(/r\s*\d+/i)) {
    improvementSuggestions.push("Consider adding your budget (e.g., 'my budget is R2000')");
  }
  
  if (!lowerInput.includes('week') && !lowerInput.includes('month') && !lowerInput.includes('year')) {
    improvementSuggestions.push("Consider specifying your timeframe (e.g., '8 weeks', '3 months')");
  }
  
  // Check if health information is potentially non-health related
  const healthTerms = [
    'pain', 'injury', 'health', 'fitness', 'diet', 'weight', 'therapy', 
    'training', 'doctor', 'exercise', 'medical', 'condition', 'treatment'
  ];
  
  const containsHealthTerms = healthTerms.some(term => lowerInput.includes(term));
  
  if (!containsHealthTerms && trimmedInput.length < 50) {
    improvementSuggestions.push("Make sure to include health-specific information for better results");
  }
  
  return { 
    isValid: true,
    improvementSuggestions: improvementSuggestions.length > 0 ? improvementSuggestions : undefined
  };
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
): { isValid: boolean; errorMessage?: string; suggestedValue?: number } {
  if (input === undefined || input === null) {
    return { 
      isValid: false, 
      errorMessage: `${fieldName} is required.`,
      suggestedValue: min !== undefined ? min : (max !== undefined ? max / 2 : 0)
    };
  }
  
  if (isNaN(input)) {
    return { 
      isValid: false, 
      errorMessage: `${fieldName} must be a valid number.`,
      suggestedValue: min !== undefined ? min : (max !== undefined ? max / 2 : 0)
    };
  }
  
  if (min !== undefined && input < min) {
    return { 
      isValid: false, 
      errorMessage: `${fieldName} must be at least ${min}.`,
      suggestedValue: min
    };
  }
  
  if (max !== undefined && input > max) {
    return { 
      isValid: false, 
      errorMessage: `${fieldName} must not exceed ${max}.`,
      suggestedValue: max
    };
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
): { isValid: boolean; errorMessage?: string; suggestions?: T[] } {
  if (!input) {
    return { 
      isValid: false, 
      errorMessage: "Selection is required." 
    };
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
export function validateEmail(email: string): { isValid: boolean; errorMessage?: string; suggestions?: string[] } {
  if (!email || email.trim() === '') {
    return { isValid: false, errorMessage: "Email address is required." };
  }
  
  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    const suggestions: string[] = [];
    
    // Check for common errors and suggest fixes
    if (!email.includes('@')) {
      suggestions.push(`${email}@gmail.com`);
      suggestions.push(`${email}@outlook.com`);
    } else {
      const parts = email.split('@');
      if (parts.length === 2) {
        const domain = parts[1];
        if (!domain.includes('.')) {
          suggestions.push(`${parts[0]}@${domain}.com`);
        } else if (domain === 'gmail.con') {
          suggestions.push(`${parts[0]}@gmail.com`);
        } else if (domain === 'yahoo.con') {
          suggestions.push(`${parts[0]}@yahoo.com`);
        }
      }
    }
    
    return { 
      isValid: false, 
      errorMessage: "Please enter a valid email address.", 
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
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
export function validatePhone(phone: string): { isValid: boolean; errorMessage?: string; formattedValue?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: false, errorMessage: "Phone number is required." };
  }
  
  // Remove common phone number formatting characters
  const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it's a reasonable length for a phone number (international or local)
  if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
    return { 
      isValid: false, 
      errorMessage: "Please enter a valid phone number with 7-15 digits." 
    };
  }
  
  // Ensure it only contains digits and possibly a leading +
  if (!/^\+?\d+$/.test(cleanedPhone)) {
    return { 
      isValid: false, 
      errorMessage: "Phone number can only contain digits and an optional + prefix." 
    };
  }
  
  // Format the phone number nicely
  let formattedValue = cleanedPhone;
  if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('+')) {
    // Format as: XXX-XXX-XXXX
    formattedValue = `${cleanedPhone.substring(0, 3)}-${cleanedPhone.substring(3, 6)}-${cleanedPhone.substring(6)}`;
  } else if (cleanedPhone.startsWith('+') && cleanedPhone.length > 10) {
    // International format
    const countryCode = cleanedPhone.substring(0, cleanedPhone.length - 9);
    const restOfNumber = cleanedPhone.substring(cleanedPhone.length - 9);
    formattedValue = `${countryCode} ${restOfNumber.substring(0, 3)} ${restOfNumber.substring(3, 6)} ${restOfNumber.substring(6)}`;
  }
  
  return { isValid: true, formattedValue };
}

/**
 * Validates health plan input with content-specific checks
 */
export function validateHealthPlanInput(
  input: string
): { 
  isValid: boolean; 
  errorMessage?: string; 
  suggestions?: string[]; 
  missingElements?: {
    budget?: boolean;
    timeframe?: boolean;
    symptoms?: boolean;
    goals?: boolean;
    personalInfo?: boolean;
  }
} {
  const baseValidation = validateStringInput(input, 10);
  
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  const lowerInput = input.toLowerCase();
  const suggestions: string[] = [];
  const missingElements = {} as any;
  
  // Check for budget information
  if (!lowerInput.includes('budget') && !lowerInput.match(/r\s*\d+/i) && !lowerInput.includes('afford')) {
    suggestions.push("Add your monthly budget (e.g., 'My budget is R2000 per month')");
    missingElements.budget = true;
  }
  
  // Check for timeframe information
  if (!lowerInput.includes('week') && !lowerInput.includes('month') && !lowerInput.includes('year') &&
      !lowerInput.includes('day') && !lowerInput.includes('time')) {
    suggestions.push("Specify your timeframe (e.g., '8-week program' or '3 months')");
    missingElements.timeframe = true;
  }
  
  // Check for symptom information
  const symptomTerms = [
    'pain', 'injury', 'discomfort', 'ache', 'sore', 'stiff', 'hurt',
    'sprain', 'strain', 'broken', 'fracture', 'swollen', 'swelling'
  ];
  
  const hasSymptoms = symptomTerms.some(term => lowerInput.includes(term));
  if (!hasSymptoms) {
    missingElements.symptoms = true;
  }
  
  // Check for goal information
  const goalTerms = [
    'goal', 'aim', 'want to', 'looking to', 'hoping to', 'achieve',
    'improve', 'increase', 'decrease', 'reduce', 'strengthen', 'plan'
  ];
  
  const hasGoals = goalTerms.some(term => lowerInput.includes(term));
  if (!hasGoals) {
    suggestions.push("Include your specific health goals (e.g., 'I want to improve my mobility')");
    missingElements.goals = true;
  }
  
  // Check for personal context
  const personalTerms = [
    'i am', "i'm", 'my', 'me', 'mine', 'age', 'year old',
    'male', 'female', 'lifestyle', 'work', 'job', 'hobby'
  ];
  
  const hasPersonalContext = personalTerms.some(term => lowerInput.includes(term));
  if (!hasPersonalContext) {
    suggestions.push("Add some personal context (e.g., age, activity level, lifestyle factors)");
    missingElements.personalInfo = true;
  }
  
  // Check for potential non-health related queries
  const nonHealthKeywords = [
    'weather', 'stock', 'news', 'political', 'game', 'movie', 
    'election', 'bitcoin', 'crypto', 'sports'
  ];
  
  const nonHealthMatches = nonHealthKeywords.filter(keyword => lowerInput.includes(keyword));
  if (nonHealthMatches.length > 0 && !hasSymptoms && !hasGoals) {
    return {
      isValid: false,
      errorMessage: "Your query doesn't appear to be health-related. Please describe your health needs or concerns.",
      suggestions: ["Focus on describing your health concerns, symptoms, or wellness goals"]
    };
  }
  
  return { 
    isValid: true, 
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    missingElements: Object.keys(missingElements).length > 0 ? missingElements : undefined
  };
}

/**
 * Provides fallback service categories when specific services aren't available
 */
export function getFallbackServices(
  unavailableServices: ServiceCategory[],
  userConditions: string[]
): { alternatives: Record<ServiceCategory, ServiceCategory[]>; explanation: string } {
  // Initialize the alternatives record with empty arrays for all service categories
  const alternatives = Object.values(ServiceCategory).reduce((acc, category) => {
    acc[category as ServiceCategory] = [];
    return acc;
  }, {} as Record<ServiceCategory, ServiceCategory[]>);
  
  let explanation = "Some of your preferred services may not be available. Here are alternatives:";
  
  // Define fallback mapping
  const fallbackMap: Record<string, ServiceCategory[]> = {
    'physiotherapist': ['biokineticist', 'personal-trainer'],
    'biokineticist': ['physiotherapist', 'personal-trainer'],
    'personal-trainer': ['biokineticist', 'coaching'],
    'dietician': ['coaching', 'nutrition-coach'],
    'nutritionist': ['dietician', 'coaching'] as ServiceCategory[],
    'coaching': ['personal-trainer', 'psychology'],
    'psychology': ['psychiatry', 'coaching'],
    'psychiatry': ['psychology', 'coaching'],
    'pain-management': ['physiotherapist', 'biokineticist'],
    'occupational-therapy': ['physiotherapist', 'coaching'],
    'family-medicine': ['general-practitioner', 'nurse-practitioner'],
    'orthopedics': ['orthopedic-surgeon', 'physiotherapist'],
    'cardiology': ['internal-medicine', 'sports-medicine'],
    'internal-medicine': ['family-medicine', 'general-practitioner'],
    'gastroenterology': ['dietician', 'internal-medicine'],
    'neurology': ['psychiatry', 'pain-management'],
    'sports-medicine': ['sport-physician', 'personal-trainer'],
    'geriatrics': ['geriatric-medicine', 'family-medicine'],
    'podiatrist': ['orthopedics', 'physical-therapy'],
    'general-practitioner': ['family-medicine', 'internal-medicine'],
    'sport-physician': ['sports-medicine', 'orthopedics'],
    'orthopedic-surgeon': ['orthopedics', 'sport-physician'],
    'massage-therapy': ['physical-therapy', 'chiropractor'],
    'nutrition-coach': ['dietician', 'personal-trainer'],
    'physical-therapy': ['physiotherapist', 'biokineticist'],
    'chiropractor': ['physical-therapy', 'orthopedics'],
    'nurse-practitioner': ['general-practitioner', 'family-medicine'],
    'dermatology': ['general-practitioner'],
    'endocrinology': ['internal-medicine', 'dietician'],
    'urology': ['internal-medicine', 'general-practitioner'],
    'oncology': ['internal-medicine', 'psychiatry'],
    'rheumatology': ['internal-medicine', 'orthopedics'],
    'pediatrics': ['family-medicine', 'general-practitioner'],
    'neurosurgery': ['neurology', 'orthopedic-surgeon'],
    'infectious-disease': ['internal-medicine', 'general-practitioner'],
    'plastic-surgery': ['general-practitioner', 'dermatology'],
    'obstetrics-gynecology': ['general-practitioner', 'family-medicine'],
    'emergency-medicine': ['general-practitioner', 'family-medicine'],
    'anesthesiology': ['pain-management', 'general-practitioner'],
    'radiology': ['general-practitioner', 'orthopedics'],
    'geriatric-medicine': ['geriatrics', 'general-practitioner'],
    'all': ['general-practitioner', 'family-medicine']
  };
  
  // Generate alternatives for each unavailable service
  unavailableServices.forEach(service => {
    if (fallbackMap[service]) {
      alternatives[service] = fallbackMap[service].filter(alt => 
        !unavailableServices.includes(alt)
      );
    } 
    // Add basic fallback for any service not explicitly in our map
    else if (!alternatives[service] || alternatives[service].length === 0) {
      alternatives[service] = ['family-medicine', 'general-practitioner'];
    }
    
    // If all regular alternatives are unavailable, default to general-practitioner
    if (alternatives[service].length === 0) {
      alternatives[service] = ['general-practitioner'];
    }
  });
  
  return { alternatives, explanation };
}
