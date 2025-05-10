// Import necessary types
import { ServiceCategory } from "../types";

/**
 * Error types for plan generation process
 */
export enum PlanGenerationErrorType {
  UNEXPECTED = "unexpected",
  SYMPTOM_DETECTION = "symptom-detection",
  SERVICE_MATCHING = "service-matching",
  BUDGET_CALCULATION = "budget-calculation",
  PLAN_CREATION = "plan-creation",
  INPUT_VALIDATION = "input-validation",
  EXTERNAL_SERVICE = "external-service",
}

/**
 * Enhanced error class for plan generation with user-friendly messages
 */
export class PlanGenerationError extends Error {
  readonly type: PlanGenerationErrorType;
  readonly userMessage: string;
  readonly context?: Record<string, any>;
  readonly suggestions?: string[];

  constructor(
    message: string,
    type: PlanGenerationErrorType,
    userMessage: string,
    context?: Record<string, any>,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'PlanGenerationError';
    this.type = type;
    this.userMessage = userMessage;
    this.context = context;
    this.suggestions = suggestions;
  }
}

/**
 * Safe operation wrapper for handling errors in plan generation process
 * @param operation Function to execute safely
 * @param errorType Type of error if operation fails
 * @param operationName Name of the operation for error reporting
 * @returns Result of the operation
 */
export function safePlanOperation<T>(
  operation: () => T,
  errorType: PlanGenerationErrorType,
  operationName: string
): T {
  try {
    return operation();
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    
    // If it's already a PlanGenerationError, rethrow it
    if (error instanceof PlanGenerationError) {
      throw error;
    }
    
    // Otherwise, wrap it in a PlanGenerationError
    const message = error instanceof Error ? error.message : String(error);
    throw new PlanGenerationError(
      `Error in ${operationName}: ${message}`,
      errorType,
      `We encountered a problem while analyzing your health needs. Please try being more specific about your symptoms or goals.`,
      { originalError: message }
    );
  }
}
