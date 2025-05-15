
import { generateAIHealthPlans } from "./planBuilder";
import { analyzeUserQuery } from "./userAnalysis";
import { estimateComplexityLevel } from "./complexity";
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

// Re-export the main functions for easy access
export * from './userAnalysis';
export * from './planBuilder';
export * from './complexity';
