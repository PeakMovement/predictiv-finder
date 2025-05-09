
// Main exports
export * from './aiPlanGenerator';
export * from './symptomDetector';
export * from './symptomMappingsData';
export * from './planGenerator';
export * from './inputAnalyzer';
export * from './categoryMatcher'; // This ensures findAlternativeCategories is exported
export * from './budgetConfig';
export * from './planStructure';
export * from './detectors';

// Service helpers
export * from './locationFilter';
export * from './sessionCalculator';
export * from './serviceMappings';
export * from './professionalRecommender';
export * from './types';

// New enhanced modules
export * from './serviceMatching/advancedServiceMatcher';
export * from './budgetHandling/enhancedBudgetOptimizer';
export * from './specialHandling/comorbidityManager';
export * from './specialHandling/specialPopulationHandler';

// Only import FrequencyPreference from enhancedInputAnalyzer selectively to avoid duplicate exports
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
} from './enhancedInputAnalyzer';

// Export functions from enhancedInputAnalyzer
export {
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
};

// Explicitly export analyzeUserInput for components that need it
export { analyzeUserInput } from './inputAnalyzer';
