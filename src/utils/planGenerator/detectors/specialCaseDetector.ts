
import { ServiceCategory } from "../types";
import { 
  MENTAL_HEALTH_SYNONYMS,
  FITNESS_SYNONYMS,
  DIGESTIVE_SYNONYMS,
  GOAL_SYNONYMS
} from "../symptomMappings/synonymGroups";

/**
 * Detects special health cases that require specific handling
 * @param userInput User's query text
 * @returns Special case metadata if detected, null otherwise
 */
export function detectSpecialCase(userInput: string): {
  type: 'emergency' | 'urgent' | 'chronic' | 'preventive' | 'complex';
  description: string;
  requiredServices: ServiceCategory[];
  urgencyLevel: number;
  budget?: { min: number; recommended: number };
} | null {
  const inputLower = userInput.toLowerCase();
  
  // Emergency case detection
  const emergencyPhrases = [
    'emergency', 'urgent', 'severe pain', 'accident', 
    'injured now', 'can\'t move', 'extreme pain'
  ];
  
  if (emergencyPhrases.some(phrase => inputLower.includes(phrase))) {
    return {
      type: 'emergency',
      description: 'Urgent medical attention required',
      requiredServices: ['emergency-medicine', 'family-medicine'],
      urgencyLevel: 0.9,
      budget: { min: 1500, recommended: 3000 }
    };
  }
  
  // Chronic condition detection
  const chronicPhrases = [
    'chronic', 'ongoing', 'years', 'long-term', 'persistent',
    'always have', 'since childhood', 'lifelong'
  ];
  
  if (chronicPhrases.some(phrase => inputLower.includes(phrase))) {
    const services: ServiceCategory[] = ['family-medicine'];
    
    // Add relevant specialists based on phrases
    if (inputLower.includes('pain') || inputLower.includes('ache')) {
      services.push('pain-management');
    }
    
    return {
      type: 'chronic',
      description: 'Long-term health management needed',
      requiredServices: services,
      urgencyLevel: 0.5,
      budget: { min: 2500, recommended: 4500 }
    };
  }
  
  // Preventive care detection
  const preventivePhrases = [
    'checkup', 'prevention', 'screening', 'wellness',
    'healthy', 'maintain', 'routine', 'yearly exam'
  ];
  
  if (preventivePhrases.some(phrase => inputLower.includes(phrase))) {
    return {
      type: 'preventive',
      description: 'Preventive health maintenance',
      requiredServices: ['family-medicine', 'dietician'],
      urgencyLevel: 0.2,
      budget: { min: 1000, recommended: 2500 }
    };
  }
  
  // Complex case detection (multiple conditions)
  const conditionPhrases = [
    'multiple conditions', 'several issues', 'complication',
    'as well as', 'also have', 'combined with', 'along with'
  ];
  
  if (conditionPhrases.some(phrase => inputLower.includes(phrase))) {
    return {
      type: 'complex',
      description: 'Multiple health concerns requiring coordinated care',
      requiredServices: ['family-medicine', 'internal-medicine'],
      urgencyLevel: 0.6,
      budget: { min: 3000, recommended: 5500 }
    };
  }
  
  // No special case detected
  return null;
}

/**
 * Detect whether elderly-specific care is needed
 * @param userInput User's query text
 * @returns Whether elderly care is indicated
 */
export function isElderlyCase(userInput: string): boolean {
  const inputLower = userInput.toLowerCase();
  
  const elderlyPhrases = [
    'elderly', 'senior', 'old age', 'retirement', 'geriatric',
    'nursing home', 'over 65', 'over 70', 'aging parent'
  ];
  
  return elderlyPhrases.some(phrase => inputLower.includes(phrase));
}
