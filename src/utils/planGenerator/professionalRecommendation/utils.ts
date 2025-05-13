
/**
 * Utility functions for professional recommendations
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";

/**
 * Determines ideal timing for the recommended service
 */
export function determineIdealTiming(serviceType: ServiceCategory, severity: number): string {
  // Service-specific timing patterns
  const timingPatterns: Record<string, string[]> = {
    'physiotherapist': ['Weekly sessions for 1-2 months', 'Twice weekly sessions for 3-4 weeks, then weekly'],
    'biokineticist': ['Weekly sessions for 2 months', 'Initial assessment followed by bi-weekly sessions'],
    'dietician': ['Initial consultation with monthly follow-ups', 'Consultation every 2-3 weeks for 3 months'],
    'personal-trainer': ['2-3 sessions per week for 2 months', 'Weekly sessions for 3 months'],
    'psychology': ['Weekly sessions for 1-2 months', 'Initial assessment with bi-weekly follow-ups']
  };
  
  // Get applicable patterns for this service
  const patterns = timingPatterns[serviceType];
  
  // Default timing based on severity if no specific patterns available
  if (!patterns || patterns.length === 0) {
    if (severity > 0.7) {
      return 'Weekly sessions for 1-2 months';
    } else if (severity > 0.4) {
      return 'Bi-weekly sessions for 2 months';
    } else {
      return 'Monthly sessions for 3 months';
    }
  }
  
  // Choose pattern based on severity
  return severity > 0.5 ? patterns[0] : patterns[1];
}

/**
 * Generates recommendation notes based on service and condition
 */
export function generateRecommendationNotes(
  serviceType: ServiceCategory,
  condition?: string,
  severity?: number,
  goals?: any[],
  hasBudgetConstraint?: boolean,
  sessionCost?: number
): string[] {
  const notes: string[] = [];
  
  // Add basic recommendation
  notes.push(`Working with a ${serviceType.replace('-', ' ')} is recommended for ${condition || 'your condition'}.`);
  
  // Add severity-based note if available
  if (severity !== undefined) {
    if (severity > 0.7) {
      notes.push(`This is a high priority recommendation given the severity of your symptoms.`);
    } else if (severity > 0.4) {
      notes.push(`Regular sessions will help manage your symptoms effectively.`);
    } else {
      notes.push(`Occasional sessions should be sufficient for your needs.`);
    }
  }
  
  // Add budget note if relevant
  if (hasBudgetConstraint && sessionCost) {
    notes.push(`Each session typically costs around R${sessionCost}, which fits within your budget constraints.`);
  }
  
  return notes;
}

/**
 * Generates list of preferred professional traits based on condition and goals
 */
export function generatePreferredTraits(condition: string, goals: any[]): string[] {
  // This is a simplified version - in practice would have more complex logic
  const traits: string[] = [];
  
  // Add condition-specific traits
  if (condition.includes('pain')) {
    traits.push('Experience with pain management');
  }
  
  if (condition.includes('sport') || condition.includes('athlete')) {
    traits.push('Sports specialization');
  }
  
  // Add generic useful traits
  traits.push('Good communication skills');
  traits.push('Evidence-based approach');
  
  return traits;
}
