
/**
 * Custom error class for health plan generation
 */
export class PlanGenerationError extends Error {
  public userMessage: string;
  public errorType: PlanGenerationErrorType;
  public context?: any;
  public suggestions?: string[];

  constructor(
    message: string,
    errorType: PlanGenerationErrorType,
    userMessage?: string,
    context?: any,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'PlanGenerationError';
    this.errorType = errorType;
    this.userMessage = userMessage || message;
    this.context = context;
    this.suggestions = suggestions;
  }
}

/**
 * Types of errors that can occur during plan generation
 */
export enum PlanGenerationErrorType {
  SYMPTOM_DETECTION = 'symptom_detection',
  SERVICE_MATCHING = 'service_matching',
  BUDGET_ALLOCATION = 'budget_allocation',
  PLAN_CREATION = 'plan_creation',
  INPUT_VALIDATION = 'input_validation',
  UNEXPECTED = 'unexpected'
}

/**
 * Wrapper function to safely execute plan generation operations
 * and provide consistent error handling
 */
export async function safePlanOperation<T>(
  operation: () => T | Promise<T>,
  errorType: PlanGenerationErrorType,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const userMessage = `Error during ${operationName}: ${message}`;
    
    throw new PlanGenerationError(
      `${operationName} failed: ${message}`,
      errorType,
      userMessage,
      { originalError: error }
    );
  }
}

/**
 * Validates user input for health plan generation
 */
export function validateHealthPlanInput(input: string): void {
  if (!input || input.trim().length < 5) {
    throw new PlanGenerationError(
      "Input is too short",
      PlanGenerationErrorType.INPUT_VALIDATION,
      "Please provide more details about your health needs or goals.",
      { input },
      [
        "Tell us about any symptoms you're experiencing",
        "Describe your health goals",
        "Mention any specific conditions you're managing"
      ]
    );
  }
  
  if (input.trim().length > 2000) {
    throw new PlanGenerationError(
      "Input is too long",
      PlanGenerationErrorType.INPUT_VALIDATION,
      "Your input is too detailed. Please provide a more concise description.",
      { inputLength: input.trim().length }
    );
  }
}
