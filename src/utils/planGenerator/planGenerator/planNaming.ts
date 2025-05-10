
import { PlanContext } from '@/utils/planGenerator/types';

/**
 * Generate a descriptive plan name based on the plan context
 */
export function generatePlanName(context: PlanContext): string {
  // Check if context has a condition property otherwise use default
  if (!context) return "Custom Health Plan";
  
  // If primary condition is directly accessible
  if (context.medicalConditions && context.medicalConditions.length > 0) {
    const condition = context.medicalConditions[0];
    return `${condition.charAt(0).toUpperCase() + condition.slice(1)} Health Plan`;
  }
  
  // Handle goal if available
  if (context.goal) {
    return `${context.goal.charAt(0).toUpperCase() + context.goal.slice(1)} Plan`;
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
  
  // Check for medical conditions
  if (context.medicalConditions && context.medicalConditions.length > 0) {
    const condition = context.medicalConditions[0];
    return `${baseDescription} focusing on ${condition.toLowerCase()}.`;
  }
  
  // If goal is available but no condition
  if (context.goal) {
    return `${baseDescription} designed to help you achieve your ${context.goal.toLowerCase()} goals.`;
  }
  
  return baseDescription;
}
