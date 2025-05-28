
// Import types and classes from planGenerationError module
import { PlanGenerationError, PlanGenerationErrorType, safePlanOperation } from './planGenerationError';

// Re-export everything from sub-modules, but handle duplicates carefully
export * from './planGenerationError';
export * from './serviceErrors';

// Only export validateHealthPlanInput from inputValidation to avoid conflicts
export { validateHealthPlanInput, detectLowQualityInput } from './inputValidation';

/**
 * Type guard to check if an error is a PlanGenerationError
 */
export function isPlanGenerationError(error: any): error is PlanGenerationError {
  return error instanceof PlanGenerationError || 
         (error && typeof error === 'object' && error.name === 'PlanGenerationError');
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: any): string {
  if (isPlanGenerationError(error)) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}

/**
 * Get error type from any error
 */
export function getErrorType(error: any): PlanGenerationErrorType {
  if (isPlanGenerationError(error)) {
    return error.type;
  }
  
  return PlanGenerationErrorType.UNEXPECTED;
}
