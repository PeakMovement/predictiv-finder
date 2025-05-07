
import { ServiceCategory } from "../types";

/**
 * Determine ideal timing for appointments based on condition severity and professional type
 * 
 * @param category Professional service category
 * @param conditionSeverity Severity of the condition (0-1)
 * @returns Timing recommendation as a string
 */
export function determineIdealTiming(category: ServiceCategory, conditionSeverity: number): string {
  if (conditionSeverity > 0.8) {
    return "Immediate (within 1 week)";
  } else if (conditionSeverity > 0.6) {
    return "Soon (1-2 weeks)";
  } else if (['cardiology', 'neurology', 'psychiatry', 'gastroenterology'].includes(category)) {
    return "Within 3-4 weeks";
  } else {
    return "Flexible (within 4-6 weeks)";
  }
}
