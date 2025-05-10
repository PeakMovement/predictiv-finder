
// Import but don't re-export directly to avoid ambiguity
import { PlanGenerationError as PlanGenError, PlanGenerationErrorType as PlanGenErrorType, safePlanOperation as safeOperation } from './planGenerationError';
import { validateHealthPlanInput as validateInput } from './inputValidation';
import * as serviceErrors from './serviceErrors';

// Re-export with different names to avoid ambiguity
export const PlanGenerationError = PlanGenError;
export const PlanGenerationErrorType = PlanGenErrorType;
export const safePlanOperation = safeOperation; 
export const validateHealthPlanInput = validateInput;

// Export service errors
export * from './serviceErrors';

// Provide a convenience function for checking if an error is a PlanGenerationError
export function isPlanGenerationError(error: any): error is typeof PlanGenError {
  return error && error.name === 'PlanGenerationError';
}
