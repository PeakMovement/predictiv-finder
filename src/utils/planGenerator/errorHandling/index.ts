
// Re-export all error handling components for easier imports
export * from './planGenerationError';
export * from './inputValidation';
export * from './serviceErrors';

// Provide a convenience function for checking if an error is a PlanGenerationError
import { PlanGenerationError } from './planGenerationError';

export function isPlanGenerationError(error: any): error is PlanGenerationError {
  return error && error.name === 'PlanGenerationError';
}
