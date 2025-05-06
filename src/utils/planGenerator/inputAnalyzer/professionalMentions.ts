
import { ServiceCategory } from '@/types';

// Define the interface for professional service mention results
export interface ProfessionalServiceMention {
  serviceCategory: ServiceCategory;
  confidence: number;
}

/**
 * Detect mentions of health professionals in user input
 * @param input User's input text
 * @returns Array of detected professional service mentions
 */
export function detectProfessionalMentions(input: string): ProfessionalServiceMention[] {
  const inputLower = input.toLowerCase();
  const results: ProfessionalServiceMention[] = [];
  
  // Map of professional terms to service categories
  const professionalTerms: Record<string, ServiceCategory> = {
    'personal trainer': 'personal-trainer',
    'trainer': 'personal-trainer',
    'coach': 'coaching',
    'dietitian': 'dietician',
    'dietician': 'dietician',
    'nutritionist': 'dietician',
    'physiotherapist': 'physiotherapist',
    'physio': 'physiotherapist',
    'physical therapist': 'physiotherapist',
    'biokinetist': 'biokineticist',
    'biokineticist': 'biokineticist',
    'doctor': 'family-medicine',
    'gp': 'family-medicine',
    'physician': 'family-medicine',
    'medical doctor': 'family-medicine',
    'psychiatrist': 'psychiatry',
    'psychologist': 'psychiatry',
    'counselor': 'psychiatry',
    'therapist': 'psychiatry',
    'cardiologist': 'cardiology',
    'heart doctor': 'cardiology',
    'gastroenterologist': 'gastroenterology',
    'stomach doctor': 'gastroenterology',
    'endocrinologist': 'endocrinology',
    'hormone specialist': 'endocrinology',
    'orthopedist': 'orthopedics',
    'orthopedic': 'orthopedics',
    'bone doctor': 'orthopedics',
    'dermatologist': 'dermatology',
    'skin doctor': 'dermatology',
    'neurologist': 'neurology',
    'nerve doctor': 'neurology',
    'brain doctor': 'neurology',
    'pain specialist': 'pain-management',
    'pain doctor': 'pain-management'
  };
  
  // Check for each professional term in the input
  for (const [term, category] of Object.entries(professionalTerms)) {
    if (inputLower.includes(term)) {
      // Basic confidence calculation based on exact match
      const confidence = inputLower.includes(`need ${term}`) || 
                         inputLower.includes(`want ${term}`) ||
                         inputLower.includes(`see ${term}`) ? 0.9 : 0.7;
      
      results.push({ serviceCategory: category, confidence });
      console.log(`Detected professional mention: ${term} -> ${category} (confidence: ${confidence})`);
    }
  }
  
  return results;
}
