
import { PlanContext } from '@/utils/planGenerator/types';

/**
 * Generate a descriptive plan name based on the plan context
 */
export function generatePlanName(context: PlanContext): string {
  const condition = context.primaryCondition || '';
  
  if (typeof condition === 'string') {
    // Handle when condition is a simple string
    return `${condition.charAt(0).toUpperCase() + condition.slice(1)} Health Plan`;
  } else if (condition && typeof condition === 'object' && 'name' in condition) {
    // Handle when condition is an object with a name property
    const conditionName = condition.name;
    return `${conditionName} Health Plan`;
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
  
  const conditionName = typeof context.primaryCondition === 'string' 
    ? context.primaryCondition
    : (context.primaryCondition?.name || '');
  
  if (conditionName) {
    return `${baseDescription} focusing on ${conditionName.toLowerCase()}.`;
  }
  
  return baseDescription;
}
