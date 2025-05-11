
export * from './planGenerationError';
export * from './inputValidation';
export * from './serviceErrors';

// Function to check if an error is a PlanGenerationError
export function isPlanGenerationError(error: any): boolean {
  return error && error.name === 'PlanGenerationError';
}
