
// Re-export everything from the new modular structure
export * from './professionalRecommendation';
export * from './budget';
export * from './goalExtractor';
export * from './enhancedGoalAnalyzer';
export * from './analysis';
export * from './enhancedMatcher';

// Explicitly re-export types to avoid ambiguity
export { 
  type ProfessionalRecommendationOptions,
  type CategoryRecommendation,
  type ProfessionalRecommendation,
  type BudgetAllocationItem,
  type ProfessionalRecommendationResult
} from './types';

// Re-export ScenarioResult from its original location only
