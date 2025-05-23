
// Re-export all error handling utilities from this file for clean imports
export * from './planGenerationError';

/**
 * Helper function to check if an error is a PlanGenerationError
 */
export function isPlanGenerationError(error: any): boolean {
  return error && error.name === 'PlanGenerationError';
}
