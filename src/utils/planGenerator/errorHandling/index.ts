

// Re-export everything from sub-modules
export * from './planGenerationError';
export * from './serviceErrors';

// Only export validateHealthPlanInput from inputValidation to avoid conflicts
export { validateHealthPlanInput, detectLowQualityInput } from './inputValidation';

/**
 * Type guard to check if an error is a PlanGenerationError
 */
export function isPlanGenerationError(error: any): error is import('./planGenerationError').PlanGenerationError {
  return error instanceof Error && error.name === 'PlanGenerationError';
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
export function getErrorType(error: any): import('./planGenerationError').PlanGenerationErrorType {
  if (isPlanGenerationError(error)) {
    return error.type;
  }
  
  return 'unexpected' as import('./planGenerationError').PlanGenerationErrorType;
}

