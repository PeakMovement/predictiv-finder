
import { logger } from "@/utils/logger";

/**
 * Enhanced input validation result with detailed feedback
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  suggestions?: string[];
  validatedValue?: string;
  qualityScore?: number; // 0-100 quality score
  improvementAreas?: {
    area: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

/**
 * Validates and analyzes a string input with enhanced feedback
 * 
 * @param input The string to validate
 * @param minLength Minimum required length (default: 5)
 * @param maxLength Maximum allowed length (default: 2000)
 * @returns Detailed validation result with suggestions
 */
export function validateStringInput(
  input: string,
  minLength: number = 5,
  maxLength: number = 2000
): ValidationResult {
  // Trim input for consistent validation
  const trimmedInput = input ? input.trim() : '';
  
  // Check for empty input
  if (!trimmedInput) {
    return {
      isValid: false,
      errorMessage: "Please provide some information to continue.",
      qualityScore: 0,
      improvementAreas: [{
        area: 'content',
        description: 'No input provided',
        severity: 'high'
      }]
    };
  }
  
  // Check for minimum length
  if (trimmedInput.length < minLength) {
    return {
      isValid: false,
      errorMessage: `Please provide at least ${minLength} characters.`,
      qualityScore: Math.min(30, Math.floor((trimmedInput.length / minLength) * 30)),
      improvementAreas: [{
        area: 'length',
        description: 'Input is too short',
        severity: 'high'
      }]
    };
  }
  
  // Check for maximum length
  if (trimmedInput.length > maxLength) {
    return {
      isValid: false,
      errorMessage: `Input is too long. Please limit to ${maxLength} characters.`,
      warningMessage: "Your input exceeds the maximum length.",
      qualityScore: 40,
      validatedValue: trimmedInput.substring(0, maxLength),
      improvementAreas: [{
        area: 'length',
        description: 'Input is too long',
        severity: 'medium'
      }]
    };
  }
  
  // Analyze input quality and provide improvement suggestions
  const improvementAreas: ValidationResult['improvementAreas'] = [];
  const suggestions: string[] = [];
  let qualityScore = 70; // Base score for valid inputs
  
  // Check for descriptiveness (word count)
  const wordCount = trimmedInput.split(/\s+/).length;
  if (wordCount < 5) {
    improvementAreas.push({
      area: 'descriptiveness',
      description: 'Not enough detail provided',
      severity: 'medium'
    });
    suggestions.push("Add more details to help us understand your needs better.");
    qualityScore -= 15;
  }
  
  // Check for specificity keywords
  const specificityKeywords = ['specific', 'exactly', 'precisely', 'particularly', 'especially'];
  const hasSpecificity = specificityKeywords.some(keyword => 
    trimmedInput.toLowerCase().includes(keyword)
  );
  
  if (!hasSpecificity && trimmedInput.length < 100) {
    improvementAreas.push({
      area: 'specificity',
      description: 'Input lacks specificity',
      severity: 'low'
    });
    suggestions.push("Be more specific about your needs or requirements.");
    qualityScore -= 10;
  }
  
  // Check for health-specific information (for health inputs)
  const healthKeywords = ['pain', 'discomfort', 'symptoms', 'condition', 'diagnosis', 'treatment'];
  const hasHealthInfo = healthKeywords.some(keyword => 
    trimmedInput.toLowerCase().includes(keyword)
  );
  
  if (!hasHealthInfo) {
    improvementAreas.push({
      area: 'health-context',
      description: 'Missing health-specific information',
      severity: 'medium'
    });
    suggestions.push("Include details about your symptoms, condition, or health goals.");
    qualityScore -= 15;
  }
  
  // Log validation results
  logger.debug('Input validation result:', {
    inputLength: trimmedInput.length,
    wordCount,
    qualityScore,
    improvementAreas: improvementAreas.map(area => area.area)
  });
  
  // Return validation result
  return {
    isValid: true, // Base validation passes
    validatedValue: trimmedInput,
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    warningMessage: suggestions.length > 0 ? "Your input could be improved" : undefined,
    suggestions,
    improvementAreas
  };
}

/**
 * Specialized validator for health query inputs
 * @param input Health query to validate
 * @returns Detailed validation result with health-specific feedback
 */
export function validateHealthQueryInput(input: string): ValidationResult {
  // First, do basic validation
  const baseValidation = validateStringInput(input, 10, 3000);
  
  // If not valid, return base validation result
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  const trimmedInput = input.trim().toLowerCase();
  const suggestions: string[] = [];
  const improvementAreas: ValidationResult['improvementAreas'] = [];
  let qualityScore = baseValidation.qualityScore || 70;
  
  // Check for timeframe information
  if (!trimmedInput.match(/\b(day|week|month|year|since|ago|for\s+\d+)\b/)) {
    improvementAreas.push({
      area: 'timeframe',
      description: 'Missing timeframe information',
      severity: 'medium'
    });
    suggestions.push("Include information about how long you've experienced these issues or your desired timeframe for results.");
    qualityScore -= 10;
  }
  
  // Check for severity indicators
  if (!trimmedInput.match(/\b(mild|moderate|severe|intense|slight|bad|worse|better)\b/)) {
    improvementAreas.push({
      area: 'severity',
      description: 'Missing severity information',
      severity: 'medium'
    });
    suggestions.push("Describe the severity of your symptoms or condition.");
    qualityScore -= 10;
  }
  
  // Check for budget information
  if (!trimmedInput.match(/\b(budget|cost|afford|expense|r\d+|rand|zar|\$)\b/i)) {
    improvementAreas.push({
      area: 'budget',
      description: 'Missing budget information',
      severity: 'low'
    });
    suggestions.push("Mentioning your budget will help tailor recommendations to your financial situation.");
    qualityScore -= 10;
  }
  
  // Check for goals
  if (!trimmedInput.match(/\b(goal|aim|want|hope|improve|better|recover|heal|objective|target)\b/)) {
    improvementAreas.push({
      area: 'goals',
      description: 'Missing goals or desired outcomes',
      severity: 'high'
    });
    suggestions.push("Clearly state what you want to achieve or your health goals.");
    qualityScore -= 15;
  }
  
  return {
    ...baseValidation,
    suggestions: [...(baseValidation.suggestions || []), ...suggestions],
    improvementAreas: [...(baseValidation.improvementAreas || []), ...improvementAreas],
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    warningMessage: suggestions.length > 0 ? "Your health query could be improved" : undefined
  };
}
