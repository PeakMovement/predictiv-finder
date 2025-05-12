
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

/**
 * Function to check if an error is a PlanGenerationError
 * @param error Any error object to check
 */
export function isPlanGenerationError(error: any): boolean {
  return error && error.name === 'PlanGenerationError';
}
