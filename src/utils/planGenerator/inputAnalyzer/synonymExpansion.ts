
import { ServiceCategory } from '../types';

// Expanded health terminology synonym database
const HEALTH_SYNONYMS: Record<string, string[]> = {
  // Pain-related terms
  'pain': ['discomfort', 'ache', 'soreness', 'hurt', 'agony', 'distress'],
  'chronic': ['persistent', 'ongoing', 'long-term', 'constant', 'recurring'],
  'acute': ['sudden', 'severe', 'intense', 'sharp'],
  
  // Body parts and conditions
  'back': ['spine', 'spinal', 'lumbar', 'thoracic', 'vertebrae'],
  'joint': ['articulation', 'hinge', 'cartilage', 'connection'],
  'muscle': ['muscular', 'tendon', 'soft tissue', 'strain'],
  'heart': ['cardiac', 'cardiovascular', 'chest', 'coronary'],
  'digestive': ['gut', 'stomach', 'intestinal', 'gastrointestinal', 'bowel'],
  'mental': ['psychological', 'emotional', 'cognitive', 'psychiatric', 'mood'],
  
  // Goals and outcomes
  'lose weight': ['weight loss', 'slimming', 'shed pounds', 'reduce body fat', 'get leaner'],
  'get fit': ['improve fitness', 'get in shape', 'increase stamina', 'build endurance'],
  'recovery': ['rehabilitation', 'recuperation', 'healing', 'bounce back'],
  'strength': ['stronger', 'muscle gain', 'build muscle', 'toning', 'resistance'],
  'mobility': ['flexibility', 'range of motion', 'movement', 'agility', 'dexterity'],
  
  // Lifestyle factors
  'stress': ['tension', 'anxiety', 'pressure', 'overwhelmed', 'burnout'],
  'sleep': ['insomnia', 'rest', 'fatigue', 'tired', 'exhaustion', 'energy levels'],
  'nutrition': ['diet', 'eating', 'food', 'meal plan', 'nourishment'],
  'exercise': ['workout', 'training', 'physical activity', 'fitness regime'],
  
  // Service types
  'doctor': ['physician', 'medical professional', 'GP', 'general practitioner', 'MD'],
  'physiotherapy': ['physical therapy', 'rehabilitation', 'movement therapy', 'PT'],
  'nutrition': ['dietetics', 'dietary', 'food planning', 'meal guidance'],
  'personal training': ['fitness coaching', 'exercise instruction', 'workout guidance'],
  'counseling': ['therapy', 'psychological support', 'mental health service']
};

/**
 * Expand input text by recognizing synonyms of health-related terms
 * @param input Original user input text
 * @returns Expanded text with additional recognized synonyms
 */
export function expandSynonyms(input: string): string {
  const inputLower = input.toLowerCase();
  let expandedTerms: string[] = [];
  
  // Check for each term and its synonyms in the input
  Object.entries(HEALTH_SYNONYMS).forEach(([term, synonyms]) => {
    // If the main term is present, no need to add synonyms
    if (inputLower.includes(term.toLowerCase())) {
      return;
    }
    
    // Check if any synonym is present
    const foundSynonym = synonyms.find(synonym => 
      inputLower.includes(synonym.toLowerCase())
    );
    
    if (foundSynonym) {
      expandedTerms.push(term);
    }
  });
  
  // If we found terms to expand, append them to the input
  if (expandedTerms.length > 0) {
    return `${input} (Also considering: ${expandedTerms.join(', ')})`;
  }
  
  return input;
}

/**
 * Detect sentiment and urgency level in user input
 * @param input User input text
 * @returns Sentiment analysis results
 */
export function analyzeSentiment(input: string): {
  urgencyLevel: 'low' | 'medium' | 'high';
  concernLevel: 'low' | 'medium' | 'high';
  painLevel?: 'mild' | 'moderate' | 'severe';
  emotionalState?: string[];
  confidenceLevel?: number;
} {
  const inputLower = input.toLowerCase();
  const result = {
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
    concernLevel: 'medium' as 'low' | 'medium' | 'high',
    emotionalState: [] as string[],
    confidenceLevel: 0.7
  };
  
  // Check for urgency indicators
  const urgencyPhrases = {
    high: ['urgent', 'emergency', 'immediate', 'asap', 'quickly', 'hurry', 'critical', 'serious', 'severe', 'right away'],
    low: ['sometime', 'when possible', 'no rush', 'not urgent', 'eventually', 'in the future']
  };
  
  // Check for concern level indicators
  const concernPhrases = {
    high: ['very worried', 'extremely', 'severely', 'significantly', 'greatly', 'really', 'terribly', 'deeply'],
    low: ['slightly', 'minor', 'a bit', 'somewhat', 'a little', 'not too', 'not very']
  };
  
  // Detect pain level
  const painPhrases = {
    severe: ['severe pain', 'extreme pain', 'unbearable', 'excruciating', 'worst pain', 'agonizing'],
    moderate: ['moderate pain', 'uncomfortable', 'significant pain', 'constant pain'],
    mild: ['mild pain', 'slight discomfort', 'occasional pain', 'minor ache']
  };
  
  // Detect emotional state
  const emotionPhrases = {
    frustrated: ['frustrated', 'annoyed', 'irritated'],
    anxious: ['anxious', 'nervous', 'worried', 'scared', 'afraid'],
    hopeful: ['hopeful', 'optimistic', 'looking forward'],
    discouraged: ['discouraged', 'disappointed', 'giving up', 'tried everything']
  };
  
  // Check urgency level
  if (urgencyPhrases.high.some(phrase => inputLower.includes(phrase))) {
    result.urgencyLevel = 'high';
    result.confidenceLevel += 0.1;
  } else if (urgencyPhrases.low.some(phrase => inputLower.includes(phrase))) {
    result.urgencyLevel = 'low';
    result.confidenceLevel += 0.1;
  }
  
  // Check concern level
  if (concernPhrases.high.some(phrase => inputLower.includes(phrase))) {
    result.concernLevel = 'high';
    result.confidenceLevel += 0.1;
  } else if (concernPhrases.low.some(phrase => inputLower.includes(phrase))) {
    result.concernLevel = 'low';
    result.confidenceLevel += 0.1;
  }
  
  // Check pain level
  if (painPhrases.severe.some(phrase => inputLower.includes(phrase))) {
    result.painLevel = 'severe';
    result.confidenceLevel += 0.1;
  } else if (painPhrases.moderate.some(phrase => inputLower.includes(phrase))) {
    result.painLevel = 'moderate';
    result.confidenceLevel += 0.1;
  } else if (painPhrases.mild.some(phrase => inputLower.includes(phrase))) {
    result.painLevel = 'mild';
    result.confidenceLevel += 0.1;
  }
  
  // Check emotional state
  Object.entries(emotionPhrases).forEach(([emotion, phrases]) => {
    if (phrases.some(phrase => inputLower.includes(phrase))) {
      result.emotionalState.push(emotion);
      result.confidenceLevel += 0.05;
    }
  });
  
  return result;
}

/**
 * Convert emotional state to health plan recommendations
 * @param emotions Array of detected emotional states
 * @returns Recommended service categories
 */
export function emotionToServiceMapping(emotions: string[]): ServiceCategory[] {
  const mapping: Record<string, ServiceCategory[]> = {
    anxious: ['psychology', 'psychiatry', 'coaching'],
    frustrated: ['coaching', 'psychology'],
    discouraged: ['psychology', 'coaching'],
    hopeful: ['personal-trainer', 'coaching']
  };
  
  const recommendations = new Set<ServiceCategory>();
  emotions.forEach(emotion => {
    const services = mapping[emotion] || [];
    services.forEach(service => recommendations.add(service));
  });
  
  return Array.from(recommendations);
}
