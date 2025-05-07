
import { ServiceCategory } from "../types";

/**
 * Calculate the ideal number of sessions based on condition severity and professional type
 * 
 * @param category Professional service category
 * @param conditionSeverity Severity of the condition (0-1)
 * @returns Recommended number of sessions
 */
export function calculateIdealSessions(category: ServiceCategory, conditionSeverity: number): number {
  let idealSessions = 1; // Default
  
  if (conditionSeverity > 0.7) {
    // High severity conditions need more sessions
    if (['physiotherapist', 'personal-trainer', 'psychiatry'].includes(category)) {
      idealSessions = 4;
    } else if (['dietician', 'family-medicine', 'coaching'].includes(category)) {
      idealSessions = 2;
    } else {
      idealSessions = 3;
    }
  } else if (conditionSeverity > 0.4) {
    // Medium severity
    if (['physiotherapist', 'personal-trainer'].includes(category)) {
      idealSessions = 3;
    } else {
      idealSessions = 2;
    }
  } else {
    // Low severity
    if (['personal-trainer', 'coaching'].includes(category)) {
      idealSessions = 2;
    } else {
      idealSessions = 1;
    }
  }
  
  return idealSessions;
}
