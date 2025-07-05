
import { UserCriteria } from '@/types';
import { enhancedAnalyzeUserInput } from '../enhancedInputAnalyzer';
import { detectComprehensiveSymptoms } from '../detectors/comprehensiveSymptomDetector';
import { detectBudgetConstraints, applyBudgetAwareSelection } from '../detectors/budgetDetector';
import { matchPractitionersToNeeds } from '../professionalRecommendation/matcher';
import { ServiceCategory } from '../types';

/**
 * Comprehensive user query analysis that leverages all existing enhanced analyzers
 * 
 * @param query The user's input query
 * @returns Extracted user criteria for plan generation with comprehensive analysis
 */
export function analyzeUserQuery(query: string): Partial<UserCriteria> & {
  detectedSymptoms: string[];
  severityScores: Record<string, number>;
  suggestedServices: string[];
  budgetOptimized: boolean;
  complexityLevel: number;
} {
  console.log("Running comprehensive user query analysis:", query);
  
  // Use the enhanced input analyzer that connects all existing tools
  const enhancedAnalysis = enhancedAnalyzeUserInput(query);
  
  // Use the comprehensive symptom detector
  const symptomAnalysis = detectComprehensiveSymptoms(query);
  
  // Extract budget information using existing budget detector
  const inputLower = query.toLowerCase();
  const contraindications: any[] = [];
  const detectedBudget = detectBudgetConstraints(inputLower, contraindications);
  
  // Build comprehensive criteria object
  const criteria: Partial<UserCriteria> & {
    detectedSymptoms: string[];
    severityScores: Record<string, number>;
    suggestedServices: string[];
    budgetOptimized: boolean;
    complexityLevel: number;
  } = {
    detectedSymptoms: symptomAnalysis.symptoms,
    severityScores: symptomAnalysis.priorities,
    suggestedServices: enhancedAnalysis.suggestedCategories,
    budgetOptimized: false,
    complexityLevel: enhancedAnalysis.complexity
  };
  
  // Extract goal from enhanced analysis
  if (enhancedAnalysis.primaryIssue) {
    criteria.goal = enhancedAnalysis.primaryIssue;
  }
  
  // Extract budget information
  if (enhancedAnalysis.budget) {
    criteria.budget = {
      monthly: enhancedAnalysis.budget,
      preferredSetup: "monthly",
      flexibleBudget: enhancedAnalysis.isBudgetConstrained
    };
  } else if (detectedBudget) {
    criteria.budget = {
      monthly: detectedBudget,
      preferredSetup: "monthly", 
      flexibleBudget: true
    };
  }
  
  // Extract location information
  if (enhancedAnalysis.location) {
    criteria.location = enhancedAnalysis.location;
  }
  
  // Extract service categories using existing matching system - with proper type casting
  if (enhancedAnalysis.suggestedCategories && enhancedAnalysis.suggestedCategories.length > 0) {
    // Cast to ServiceCategory[] to ensure type safety
    criteria.categories = enhancedAnalysis.suggestedCategories.map(category => 
      category as ServiceCategory
    );
    
    // Apply budget optimization if budget constrained
    if (criteria.budget?.monthly && enhancedAnalysis.isBudgetConstrained) {
      const budgetOptimized = applyBudgetAwareSelection(
        criteria.budget.monthly,
        enhancedAnalysis.suggestedCategories as any[]
      );
      criteria.categories = budgetOptimized.prioritizedServices.map(service => 
        service as ServiceCategory
      );
      criteria.budgetOptimized = true;
    }
  }
  
  // Extract medical conditions from comprehensive analysis
  if (enhancedAnalysis.medicalConditions && enhancedAnalysis.medicalConditions.length > 0) {
    // Store medical conditions for reference
    (criteria as any).medicalConditions = enhancedAnalysis.medicalConditions;
  }
  
  console.log("Comprehensive analysis result:", criteria);
  return criteria;
}

/**
 * Estimate complexity level based on comprehensive analysis
 */
export function estimateComplexityLevel(query: string): number {
  const analysis = enhancedAnalyzeUserInput(query);
  return analysis.complexity;
}
