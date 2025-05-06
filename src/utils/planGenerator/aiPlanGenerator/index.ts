
// Re-export the main function from the core file
export { generateCustomAIPlans } from './core';

// Re-export utility functions for backward compatibility
export {
  calculateComplexityScore,
  hasKneePainAndRacePreparation,
  handleSpecialCases
} from './complexity';

// Re-export mock data utilities
export {
  getMockPractitioners,
  getProfessionalName,
  getBaseCostForCategory,
  getMockTagsForCategory
} from './mockData';
