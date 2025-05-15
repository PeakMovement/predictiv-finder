
/**
 * Module for estimating health plan complexity levels
 */
import { UserCriteria } from '@/types';

/**
 * Estimates the complexity level of a user's health needs based on criteria
 * @param criteria User criteria including health conditions and goals
 * @returns Complexity level between 0-1 (0: simple, 1: complex)
 */
export function estimateComplexityLevel(criteria: Partial<UserCriteria>): number {
  // Default to medium complexity
  let complexity = 0.5;
  
  // Adjust based on medical conditions
  if (criteria.medicalConditions && criteria.medicalConditions.length > 0) {
    // More conditions generally mean more complex plans
    complexity += Math.min(criteria.medicalConditions.length * 0.1, 0.3);
    
    // Check for chronic or complex conditions
    const complexConditions = ['diabetes', 'hypertension', 'heart disease', 'autoimmune', 'cancer'];
    const hasComplexConditions = criteria.medicalConditions.some(condition =>
      complexConditions.some(complex => condition.toLowerCase().includes(complex))
    );
    
    if (hasComplexConditions) {
      complexity += 0.1;
    }
  }
  
  // Adjust based on budget constraints
  if (criteria.budget && criteria.budget.monthly < 1000) {
    // Limited budget requires more optimization
    complexity += 0.1;
  }
  
  // Adjust based on specific goals
  if (criteria.goal && ['performance', 'competition', 'recovery from injury'].includes(criteria.goal)) {
    complexity += 0.1;
  }
  
  // Cap at 1.0 maximum
  return Math.min(complexity, 1.0);
}
