
// Re-export error handling types and functions
export { 
  PlanGenerationError, 
  PlanGenerationErrorType,
  safePlanOperation 
} from './planGenerationError';

export { 
  validateHealthPlanInput 
} from './inputValidation';

export * from './serviceErrors';

// Function to check if an error is a PlanGenerationError
export function isPlanGenerationError(error: any): boolean {
  return error && error.name === 'PlanGenerationError';
}
