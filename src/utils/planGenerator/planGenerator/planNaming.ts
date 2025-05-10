
import { PlanContext } from '@/utils/planGenerator/types';

/**
 * Generate a descriptive plan name based on the plan context
 */
export function generatePlanName(context: PlanContext): string {
  // Check if context has a condition property otherwise use default
  if (!context) return "Custom Health Plan";
  
  // If primary condition is directly accessible
  if (context.condition) {
    const condition = context.condition;
    
    if (typeof condition === 'string') {
      // Handle when condition is a simple string
      return `${condition.charAt(0).toUpperCase() + condition.slice(1)} Health Plan`;
    } else if (condition && typeof condition === 'object' && 'name' in condition) {
      // Handle when condition is an object with a name property
      const conditionName = condition.name;
      return `${conditionName} Health Plan`;
    }
  }
  
  // Handle medical conditions array if available
  if (context.medicalConditions && context.medicalConditions.length > 0) {
    const primaryCondition = context.medicalConditions[0];
    return `${primaryCondition.charAt(0).toUpperCase() + primaryCondition.slice(1)} Health Plan`;
  }
  
  // Fallback to a generic name
  return "Custom Health Plan";
}

/**
 * Generate a descriptive plan description based on the plan context
 */
export function generatePlanDescription(context: PlanContext): string {
  const baseDescription = "A personalized health plan tailored to your specific needs";
  
  if (!context) return baseDescription;
  
  // Check for condition in multiple places
  let conditionName = '';
  
  if (context.condition) {
    conditionName = typeof context.condition === 'string' 
      ? context.condition
      : (context.condition?.name || '');
  } else if (context.medicalConditions && context.medicalConditions.length > 0) {
    conditionName = context.medicalConditions[0];
  }
  
  if (conditionName) {
    return `${baseDescription} focusing on ${conditionName.toLowerCase()}.`;
  }
  
  // If goal is available but no condition
  if (context.goal) {
    return `${baseDescription} designed to help you achieve your ${context.goal.toLowerCase()} goals.`;
  }
  
  return baseDescription;
}
