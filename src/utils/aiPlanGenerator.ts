
// Re-export everything from the CSV-based optimization approach only
export * from './planGenerator/aiPlanGenerator/index';

// Re-export the SessionAllocation type explicitly 
import type { ServiceAllocation } from './planGenerator/types';
export type { ServiceAllocation as AIGeneratorSessionAllocation };

// Create the missing findAlternativeCategories function
import { ServiceCategory } from './planGenerator/types';

export function findAlternativeCategories(selectedCategories: ServiceCategory[]): ServiceCategory[] {
  const allCategories: ServiceCategory[] = [
    'physiotherapist',
    'biokineticist',
    'dietician',
    'general-practitioner',
    'sports-medicine-doctor',
    'massage-therapy',
    'strength-coach',
    'running-coach',
    'nutrition-coach'
  ];
  
  // Return categories not already selected
  const alternatives = allCategories.filter(cat => !selectedCategories.includes(cat));
  
  // Return up to 3 alternatives
  return alternatives.slice(0, 3);
}
