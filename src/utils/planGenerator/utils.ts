
/**
 * Utility functions for plan generation
 */
import { ServiceCategory } from "./types";

/**
 * Determines ideal timing for sessions based on service category
 * @param category Service category
 * @returns Recommended timing (e.g., weekly, monthly)
 */
export function determineIdealTiming(category: ServiceCategory): string {
  // Different service categories have different ideal frequencies
  switch (category) {
    case 'physiotherapist':
    case 'personal-trainer':
    case 'biokineticist':
      return 'weekly';
      
    case 'dietician':
    case 'coaching':
    case 'psychology':
      return 'bi-weekly';
      
    case 'psychiatry':
    case 'general-practitioner':
    case 'medical-specialist':
      return 'monthly';
      
    default:
      return 'as needed';
  }
}

/**
 * Generates recommendation notes based on service categories
 * @param categories Array of service categories
 * @returns Array of recommendation notes
 */
export function generateRecommendationNotes(categories: ServiceCategory[]): string[] {
  const notes: string[] = [];
  
  // Add general notes
  if (categories.length > 1) {
    notes.push('Consider starting with the highest priority service first');
    notes.push('Schedule an initial consultation with each professional to establish a treatment plan');
  }
  
  // Add category-specific notes
  if (categories.includes('physiotherapist')) {
    notes.push('For physiotherapy, continue home exercises between sessions for best results');
  }
  
  if (categories.includes('personal-trainer')) {
    notes.push('Personal training works best with 2-3 sessions per week');
  }
  
  if (categories.includes('dietician')) {
    notes.push('Dietician sessions are most effective when combined with detailed food journaling');
  }
  
  if (categories.includes('psychology')) {
    notes.push('Psychology sessions typically require regular attendance for effectiveness');
  }
  
  return notes;
}

/**
 * Generates preferred traits for practitioners based on service category
 * @param category Service category
 * @returns Array of preferred traits
 */
export function generatePreferredTraits(category: ServiceCategory): string[] {
  switch (category) {
    case 'physiotherapist':
      return ['Experience with your specific condition', 'Additional certifications in specialized techniques', 'Empathetic approach'];
      
    case 'personal-trainer':
      return ['Specialization in your goals (weight loss, strength, etc.)', 'Certification from recognized organization', 'Experience with your age group'];
      
    case 'dietician':
      return ['Experience with your dietary needs', 'Practical meal planning approach', 'Supportive communication style'];
      
    case 'psychology':
      return ['Training in appropriate therapeutic approach', 'Good rapport', 'Experience with your specific concerns'];
      
    default:
      return ['Experience with your condition', 'Good communication skills', 'Collaborative approach'];
  }
}
