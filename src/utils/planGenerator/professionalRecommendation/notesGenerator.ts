
import { ServiceCategory } from "../types";

/**
 * Generate recommendation notes based on professional type and user context
 * 
 * @param category Professional service category
 * @param primaryCondition Primary condition being addressed
 * @param conditionSeverity Severity of the condition (0-1)
 * @param goals User's health goals
 * @param hasBudgetConstraint Whether there's a budget constraint
 * @param sessionCost Cost per session
 * @returns Array of recommendation notes
 */
export function generateRecommendationNotes(
  category: ServiceCategory, 
  primaryCondition: string | undefined, 
  conditionSeverity: number, 
  goals: string[], 
  hasBudgetConstraint: boolean, 
  sessionCost: number
): string[] {
  const notes: string[] = [];
  
  if (primaryCondition) {
    notes.push(`Recommended for ${primaryCondition}`);
  }
  
  if (conditionSeverity > 0.7) {
    notes.push("High priority based on condition severity");
  }
  
  if (goals.includes('race') && ['personal-trainer', 'coaching', 'physiotherapist'].includes(category)) {
    notes.push("Will help with race preparation");
  }
  
  if (hasBudgetConstraint && sessionCost > 600) {
    notes.push("Consider fewer sessions to accommodate budget");
  }
  
  return notes;
}

/**
 * Generate professional traits based on condition and goals
 * 
 * @param primaryCondition Primary condition being addressed
 * @param goals User's health goals
 * @returns Array of preferred professional traits or undefined
 */
export function generatePreferredTraits(
  primaryCondition: string | undefined, 
  goals: string[]
): string[] | undefined {
  const preferredTraits: string[] = [];
  
  if (primaryCondition === 'knee pain') {
    preferredTraits.push('knee specialists', 'sports injuries');
  } else if (primaryCondition === 'back pain') {
    preferredTraits.push('spine specialists', 'posture correction');
  } else if (goals.includes('race')) {
    preferredTraits.push('running specialist', 'race preparation');
  } else if (primaryCondition === 'weight loss') {
    preferredTraits.push('weight management', 'body transformation');
  }
  
  return preferredTraits.length > 0 ? preferredTraits : undefined;
}
