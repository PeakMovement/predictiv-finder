
import { analyzeUserInput } from '../planGenerator/inputAnalyzer';
import { analyzeUserHealth } from '../planGenerator/professionalRecommendation/analysis';
import { extractGoals } from '../planGenerator/professionalRecommendation/goalExtractor';

export interface LocalHealthExtractionResult {
  symptoms: string[];
  severity: string | null;
  goals: string[];
  suggestedCategories: string[];
  budget?: number;
  timeframe?: string;
  location?: string;
}

/**
 * Extract health-related data using local analysis functions
 * This leverages existing code in the codebase to extract information
 * without requiring an external API call
 */
export function extractHealthDataWithLocalModel(userInput: string): LocalHealthExtractionResult {
  // Use existing input analyzer to get basic information
  const basicAnalysis = analyzeUserInput(userInput);
  
  // Use the enhanced user health analyzer for more detailed information
  const healthAnalysis = analyzeUserHealth(userInput);
  
  // Extract specific goals
  const extractedGoals = extractGoals(userInput);
  
  // Map severity scores to a single severity level
  let severityLevel: string | null = null;
  if (healthAnalysis.severityScores) {
    const avgSeverity = Object.values(healthAnalysis.severityScores).reduce((sum, score) => sum + score, 0) / 
                        Object.values(healthAnalysis.severityScores).length;
    
    if (avgSeverity > 0.7) {
      severityLevel = 'severe';
    } else if (avgSeverity > 0.4) {
      severityLevel = 'moderate';
    } else if (avgSeverity > 0) {
      severityLevel = 'mild';
    }
  }
  
  // Extract timeframe information using regex
  let timeframe: string | undefined;
  const timeRegex = /(\d+)\s+(day|week|month|year)s?/gi;
  const timeMatches = [...userInput.matchAll(timeRegex)];
  if (timeMatches.length > 0) {
    timeframe = timeMatches[0][0];
  }
  
  return {
    symptoms: healthAnalysis.symptoms || [],
    severity: severityLevel,
    goals: extractedGoals.length > 0 ? extractedGoals : (healthAnalysis.goals || []),
    suggestedCategories: basicAnalysis.suggestedCategories || [],
    budget: basicAnalysis.budget,
    timeframe,
    location: basicAnalysis.location,
  };
}
