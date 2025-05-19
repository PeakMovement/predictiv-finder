
// Re-export everything from the new modular structure
// Import specific exported types to avoid ambiguity
import * as AIGenerator from './planGenerator/aiPlanGenerator';

// Re-export everything except SessionAllocation which we'll handle explicitly
export * from './planGenerator/planStructure';
export * from './planGenerator/professionalScoring';

// Export matchPractitionersToNeeds with explicit name to avoid ambiguity
import { matchPractitionersToNeeds as categoryMatchPractitionersToNeeds } from './planGenerator/categoryMatcher';
export { categoryMatchPractitionersToNeeds };

export * from './planGenerator/professionalRecommendation';
export * from './planGenerator/inputAnalyzer';

// Explicitly re-export the AIGenerator types and functions
export {
  generateAIHealthPlans,
  generateAIPlan,
  analyzeUserQuery,
  estimateComplexityLevel
} from './planGenerator/aiPlanGenerator';

// Export the SessionAllocation type explicitly 
import type { ServiceAllocation } from './planGenerator/types';
export type { ServiceAllocation as AIGeneratorSessionAllocation };

// Export findAlternativeCategories
export { findAlternativeCategories } from './planGenerator/multiProblemCoordination/alternativeCategories';
