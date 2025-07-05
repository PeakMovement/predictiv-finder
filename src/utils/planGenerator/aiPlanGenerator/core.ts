
import { generateAIHealthPlans } from "./planBuilder";
import { analyzeUserQuery } from "./userAnalysis";
import { UserCriteria, AIHealthPlan } from '@/types';

export function generateAIPlan(query: string, criteria?: Partial<UserCriteria>): AIHealthPlan[] {
  // Analyze the user's query to understand their needs
  const userAnalysis = analyzeUserQuery(query);
  
  // Combine with any provided criteria
  const combinedCriteria = {
    ...userAnalysis,
    ...criteria
  };
  
  // Estimate the complexity level of the user's needs
  const complexityLevel = estimateComplexityLevel(combinedCriteria);
  
  // Generate and return multiple AI health plans based on the analysis
  return generateAIHealthPlans(combinedCriteria, complexityLevel);
}

// Local complexity estimation function to avoid duplicate exports
function estimateComplexityLevel(criteria: any): number {
  let complexityScore = 0.5; // Start with medium complexity
  
  // Check for medical conditions
  if (criteria.conditions && criteria.conditions.length > 0) {
    complexityScore += Math.min(0.3, criteria.conditions.length * 0.1);
  }
  
  // Budget constraints reduce complexity (fewer options)
  if (criteria.budget && criteria.budget.monthly) {
    if (criteria.budget.monthly < 1000) {
      complexityScore -= 0.1;
    } else if (criteria.budget.monthly > 5000) {
      complexityScore += 0.1;
    }
  }
  
  // Multiple categories increase complexity
  if (criteria.categories && criteria.categories.length > 2) {
    complexityScore += 0.1;
  }
  
  // Remote preference slightly reduces complexity
  if (criteria.preferOnline) {
    complexityScore -= 0.05;
  }
  
  // Ensure the score stays within 0-1 range
  return Math.max(0, Math.min(1, complexityScore));
}

// Re-export the main functions for easy access
export * from './userAnalysis';
export * from './planBuilder';
