
import { toast } from "@/hooks/use-toast";

/**
 * Error types for plan generation
 */
export enum PlanGenerationErrorType {
  INPUT_VALIDATION = 'input_validation',
  SYMPTOM_DETECTION = 'symptom_detection',
  SERVICE_MATCHING = 'service_matching',
  BUDGET_CALCULATION = 'budget_calculation',
  PLAN_CREATION = 'plan_creation',
  PRACTITIONER_MATCHING = 'practitioner_matching',
  EXTERNAL_SERVICE = 'external_service', // Added missing error type
  UNEXPECTED = 'unexpected'
}

/**
 * Structured error for plan generation
 */
export class PlanGenerationError extends Error {
  type: PlanGenerationErrorType;
  userMessage: string;
  details?: any;
  suggestions?: string[];
  
  constructor(
    message: string, 
    type: PlanGenerationErrorType = PlanGenerationErrorType.UNEXPECTED,
    userMessage?: string,
    details?: any,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'PlanGenerationError';
    this.type = type;
    this.userMessage = userMessage || this.getFriendlyMessage(type);
    this.details = details;
    this.suggestions = suggestions;
  }
  
  /**
   * Get default user-friendly message based on error type
   */
  private getFriendlyMessage(type: PlanGenerationErrorType): string {
    switch (type) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return "Please provide more specific health information to generate a plan.";
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return "We couldn't clearly identify your health needs. Please be more specific about your symptoms.";
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return "We had trouble matching appropriate services to your needs. Please try describing your health goals differently.";
      case PlanGenerationErrorType.BUDGET_CALCULATION:
        return "There was an issue calculating costs for your plan. Please try specifying your budget more clearly.";
      case PlanGenerationErrorType.PLAN_CREATION:
        return "We encountered an issue creating your health plan. Please try again with different criteria.";
      case PlanGenerationErrorType.PRACTITIONER_MATCHING:
        return "We had trouble finding matching practitioners for your needs. Please try adjusting your criteria.";
      case PlanGenerationErrorType.EXTERNAL_SERVICE:
        return "There was a connection issue with an external service. Please try again later.";
      default:
        return "An unexpected error occurred while generating your plan. Please try again.";
    }
  }
  
  /**
   * Handle the error with appropriate logging and user feedback
   */
  handle() {
    // Log error details for debugging
    console.error(`[${this.type}] ${this.message}`, this.details || '');
    
    // Display user-friendly toast
    toast({
      title: "Health Plan Generation Error",
      description: this.userMessage,
      variant: "destructive",
    });
    
    // Return structured error response
    return {
      error: true,
      type: this.type,
      message: this.userMessage,
      suggestions: this.suggestions
    };
  }
}

/**
 * Type guard to check if an error is a PlanGenerationError
 */
export function isPlanGenerationError(error: any): error is PlanGenerationError {
  return error instanceof PlanGenerationError || 
         (error && typeof error === 'object' && error.name === 'PlanGenerationError');
}

/**
 * Safely executes a function with comprehensive error handling
 */
export async function safePlanOperation<T>(
  operation: () => Promise<T> | T,
  errorType: PlanGenerationErrorType,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Convert generic errors to our structured error format
    if (!(error instanceof PlanGenerationError)) {
      const message = error instanceof Error ? error.message : String(error);
      throw new PlanGenerationError(
        `${context ? `[${context}] ` : ''}${message}`,
        errorType
      );
    }
    throw error;
  }
}

/**
 * Validates user input for health plan generation
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
