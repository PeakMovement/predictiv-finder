
// Re-export everything from the new modular structure
export * from './planGenerator/aiPlanGenerator';
export * from './planGenerator/planStructure';
export * from './planGenerator/professionalScoring';
// Export matchPractitionersToNeeds with explicit name to avoid ambiguity
import { matchPractitionersToNeeds as categoryMatchPractitionersToNeeds } from './planGenerator/categoryMatcher';
export { categoryMatchPractitionersToNeeds };
export * from './planGenerator/professionalRecommendation';
export * from './planGenerator/inputAnalyzer';
