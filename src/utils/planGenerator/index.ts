
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

// Only import FrequencyPreference from enhancedInputAnalyzer selectively to avoid duplicate exports
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
} from './enhancedInputAnalyzer';

export {
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
};
