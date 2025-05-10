
import { toast } from "@/hooks/use-toast";

/**
 * Error types for different phases of plan generation
 */
export enum PlanGenerationErrorType {
  INPUT_VALIDATION = 'input_validation',
  SYMPTOM_DETECTION = 'symptom_detection',
  SERVICE_MATCHING = 'service_matching',
  BUDGET_CALCULATION = 'budget_calculation',
  PLAN_CREATION = 'plan_creation',
  PRACTITIONER_MATCHING = 'practitioner_matching',
  UNEXPECTED = 'unexpected'
}

/**
 * Enhanced error class for plan generation with detailed information
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
    this.suggestions = suggestions || this.getDefaultSuggestions(type);
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PlanGenerationError);
    }
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
        return "We couldn't find suitable professionals for your needs. Please try adjusting your criteria.";
      default:
        return "An unexpected error occurred while generating your plan. Please try again.";
    }
  }
  
  /**
   * Get default suggestions based on error type
   */
  private getDefaultSuggestions(type: PlanGenerationErrorType): string[] {
    switch (type) {
      case PlanGenerationErrorType.INPUT_VALIDATION:
        return [
          "Describe your symptoms in more detail",
          "Mention any specific conditions you've been diagnosed with",
          "Include your fitness or health goals",
          "Specify your budget constraints"
        ];
      case PlanGenerationErrorType.SYMPTOM_DETECTION:
        return [
          "Be specific about where you're experiencing pain or discomfort",
          "Mention how long you've had these symptoms",
          "Describe any diagnosed conditions",
          "Explain how symptoms affect your daily activities"
        ];
      case PlanGenerationErrorType.SERVICE_MATCHING:
        return [
          "Try mentioning specific types of care you're interested in",
          "Describe your previous experiences with health professionals",
          "Mention any professional recommendations you've received",
          "Focus on describing your main health concern"
        ];
      case PlanGenerationErrorType.BUDGET_CALCULATION:
        return [
          "Specify a monthly or total budget amount",
          "Indicate if your budget is flexible",
          "Mention if you have health insurance coverage",
          "Indicate your preferred payment frequency"
        ];
      default:
        return [
          "Try refreshing the page and submitting again",
          "Break your health needs into smaller, more focused requests",
          "Be specific about your main health concern",
          "Contact support if the problem persists"
        ];
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
