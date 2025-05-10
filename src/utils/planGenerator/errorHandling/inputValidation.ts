
/**
 * Validates user input for health plan generation
 * @param input User input text
 * @returns True if input is valid, throws error otherwise
 */
export function validateHealthPlanInput(input: string): boolean {
  if (!input || input.trim() === '') {
    throw new Error('Please provide some information about your health needs.');
  }
  
  if (input.length < 10) {
    throw new Error('Please provide more information about your health concerns.');
  }
  
  if (input.length > 3000) {
    throw new Error('Input exceeds maximum character limit. Please summarize your health needs.');
  }
  
  return true;
}

/**
 * Detects problematic input that may lead to inaccurate recommendations
 * @param input User input text
 * @returns Object containing validation results and improvement suggestions
 */
export function detectLowQualityInput(input: string): {
  isLowQuality: boolean;
  suggestions: string[];
  ambiguousTerms: string[];
} {
  const inputLower = input.toLowerCase();
  const suggestions: string[] = [];
  const ambiguousTerms: string[] = [];
  
  // Check for vague symptoms
  const vagueTerms = ['pain', 'hurt', 'ache', 'bad', 'not good', 'issue', 'problem'];
  const vagueDetected = vagueTerms.filter(term => inputLower.includes(term));
  
  if (vagueDetected.length > 0) {
    suggestions.push('Be specific about where you experience pain or discomfort');
    ambiguousTerms.push(...vagueDetected);
  }
  
  // Check for missing timeframe information
  if (!inputLower.match(/\b(day|week|month|year|since|ago|for\s+\d+)\b/)) {
    suggestions.push('Include information about how long you\'ve experienced these issues');
  }
  
  // Check for missing severity indicators
  if (!inputLower.match(/\b(mild|moderate|severe|intense|slight|bad|worse|better)\b/)) {
    suggestions.push('Describe the severity of your symptoms');
  }
  
  // Check for missing context
  if (!inputLower.match(/\b(work|job|activity|exercise|sport|hobby|daily|routine)\b/)) {
    suggestions.push('Mention how your symptoms affect your daily activities');
  }
  
  // Check for missing goals or desired outcomes
  if (!inputLower.match(/\b(want|need|goal|aim|hope|improve|better|recover|heal)\b/)) {
    suggestions.push('Include your health goals or what you want to achieve');
  }
  
  return {
    isLowQuality: suggestions.length > 2,
    suggestions,
    ambiguousTerms
  };
}
