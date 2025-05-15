
import { analyzeUserInput } from '../inputAnalyzer';
import { enhancedAnalyzeUserInput, checkCoMorbidities } from '../enhancedInputAnalyzer';
import { calculateComplexityScore } from './complexity';
import { isComplexCase } from '../professionalScoring';
import { AnalyzedInput } from '../enhancedTypes';

/**
 * Analyzes user input to extract key information for plan generation
 * 
 * @param userQuery User input text
 * @returns Analysis results with extracted information
 */
export function analyzeUserForPlanning(userQuery: string) {
  console.log("Analyzing user input:", userQuery);
  
  // Use enhanced analysis to extract detailed information from user input
  const rawAnalysis = enhancedAnalyzeUserInput(userQuery);
  
  // Ensure all required properties are present in the analysis object
  const analysis: AnalyzedInput = {
    ...rawAnalysis,
    preferences: rawAnalysis.preferences || {},
    userType: rawAnalysis.userType || 'general',
    contextualFactors: rawAnalysis.contextualFactors || [],
    timeAvailability: rawAnalysis.timeAvailability || 4,
    severity: rawAnalysis.severity || {},
    medicalConditions: rawAnalysis.medicalConditions || [],
    suggestedCategories: rawAnalysis.suggestedCategories || [],
  };
  
  console.log("Enhanced analysis complete:", {
    medicalConditions: analysis.medicalConditions,
    suggestedCategories: analysis.suggestedCategories,
    budget: analysis.budget,
    primaryIssue: analysis.primaryIssue,
  });
  
  // Calculate complexity score based on conditions, goals, and complexity indicators
  const specificGoals = Array.isArray(analysis.specificGoals) 
    ? analysis.specificGoals 
    : (analysis.specificGoals ? [analysis.specificGoals] : []);
  
  const complexityScore = calculateComplexityScore(
    analysis.medicalConditions,
    specificGoals,
    userQuery,
    analysis.servicePriorities ? analysis.servicePriorities : {}
  );
  
  console.log("Calculated complexity score:", complexityScore);
  
  // Determine if this is a complex case requiring multiple professionals
  const needsMultidisciplinary = isComplexCase(
    analysis.medicalConditions, 
    specificGoals,
    userQuery
  );
  
  console.log("Needs multidisciplinary approach:", needsMultidisciplinary);
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  const coMorbidityServices = checkCoMorbidities(analysis.medicalConditions);
  
  return {
    analysis,
    complexityScore,
    needsMultidisciplinary,
    coMorbidityServices
  };
}
