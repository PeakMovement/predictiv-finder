
import { UserCriteria } from '@/types';

/**
 * Estimates the complexity level of a health plan based on user criteria
 * @param criteria User's criteria for their health plan
 * @returns Complexity level from 0 (simple) to 1 (complex)
 */
export function estimateComplexityLevel(criteria: Partial<UserCriteria>): number {
  let complexityScore = 0.5; // Start with medium complexity
  
  // Check for medical conditions
  if (criteria.conditions && criteria.conditions.length > 0) {
    // More conditions = higher complexity
    complexityScore += Math.min(0.3, criteria.conditions.length * 0.1);
    
    // Check for specific complex conditions
    const complexConditions = ['chronic pain', 'diabetes', 'hypertension', 'obesity', 'cardiovascular'];
    const hasComplexCondition = criteria.conditions.some(condition => 
      complexConditions.some(cc => condition.toLowerCase().includes(cc.toLowerCase()))
    );
    
    if (hasComplexCondition) {
      complexityScore += 0.1;
    }
  }
  
  // Budget constraints reduce complexity (fewer options)
  if (criteria.budget && criteria.budget.monthly) {
    if (criteria.budget.monthly < 1000) {
      complexityScore -= 0.1;
    } else if (criteria.budget.monthly > 5000) {
      complexityScore += 0.1; // Higher budget allows more complex plans
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
