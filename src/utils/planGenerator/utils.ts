
import { ServiceCategory } from "./types";
import { createServiceCategoryRecord } from "./helpers/serviceRecordInitializer";

/**
 * Determine ideal timing for health services based on type and severity
 * @param category The service category
 * @param severity How severe the condition is (0-1)
 * @returns Ideal timing pattern (e.g. "weekly", "bi-weekly")
 */
export function determineIdealTiming(category: ServiceCategory, severity: number): string {
  if (severity > 0.7) {
    // High severity
    switch(category) {
      case 'physiotherapist':
      case 'personal-trainer':
        return "twice weekly";
      case 'psychiatry':
      case 'psychology':
        return "weekly";
      default:
        return "weekly";
    }
  } else if (severity > 0.4) {
    // Medium severity
    switch(category) {
      case 'personal-trainer':
        return "weekly";
      case 'physiotherapist':
        return "weekly"; 
      case 'psychiatry':
      case 'psychology':
        return "bi-weekly";
      default:
        return "bi-weekly";
    }
  } else {
    // Low severity
    switch(category) {
      case 'personal-trainer':
        return "weekly";
      default:
        return "monthly";
    }
  }
}

/**
 * Generate notes about professional recommendations
 * @param categories Service categories
 * @param conditions Health conditions
 * @returns Array of notes explaining the recommendations
 */
export function generateRecommendationNotes(categories: ServiceCategory[], conditions?: string[]): string[] {
  const notes: string[] = [];
  
  // Notes based on service combinations
  if (categories.includes('physiotherapist') && categories.includes('personal-trainer')) {
    notes.push("The combination of physiotherapy and personal training can help address both recovery and prevention.");
  }
  
  if (categories.includes('dietician') && categories.includes('personal-trainer')) {
    notes.push("Combining nutrition advice with exercise can maximize your health outcomes.");
  }
  
  if (categories.includes('psychology') && categories.includes('psychiatry')) {
    notes.push("Working with both a psychologist and psychiatrist provides a comprehensive mental health approach.");
  }
  
  // Add condition-specific notes
  if (conditions) {
    if (conditions.some(c => c.toLowerCase().includes('pain'))) {
      notes.push("Pain management may benefit from a multi-disciplinary approach.");
    }
    
    if (conditions.some(c => c.toLowerCase().includes('stress') || c.toLowerCase().includes('anxiety'))) {
      notes.push("Regular sessions can help develop effective coping strategies for stress and anxiety.");
    }
  }
  
  return notes;
}

/**
 * Generate preferred traits for professionals based on user needs
 * @param category Service category
 * @param condition Health condition
 * @returns Object with preferred traits
 */
export function generatePreferredTraits(category: ServiceCategory, condition?: string): Record<string, string> {
  const traits: Record<string, string> = {};
  
  // Generic traits by professional category
  switch(category) {
    case 'physiotherapist':
      traits.specialty = condition?.toLowerCase().includes('sport') ? 
        "sports injuries" : "rehabilitation";
      break;
    case 'personal-trainer':
      traits.approach = condition?.toLowerCase().includes('injury') ? 
        "corrective exercise" : "functional training";
      break;
    case 'dietician':
      traits.specialty = condition?.toLowerCase().includes('weight') ? 
        "weight management" : "clinical nutrition";
      break;
    case 'psychology':
    case 'psychiatry':
      traits.approach = condition?.toLowerCase().includes('trauma') ? 
        "trauma-informed" : "evidence-based";
      break;
  }
  
  return traits;
}
