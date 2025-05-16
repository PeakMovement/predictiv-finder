
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
  'exercise': ['workout', 'training', 'physical activity', 'fitness regime']
};

// Export synonym dictionaries for use in specialized detectors
export const MENTAL_HEALTH_SYNONYMS: Record<string, string[]> = {
  'anxiety': ['anxious', 'nervous', 'worry', 'panic', 'stress', 'fear'],
  'depression': ['depressed', 'sad', 'low mood', 'melancholy', 'despair'],
  'stress': ['overwhelmed', 'burnout', 'pressure', 'tension', 'strain'],
  'trauma': ['ptsd', 'traumatic event', 'psychological trauma']
};

export const FITNESS_SYNONYMS: Record<string, string[]> = {
  'strength': ['stronger', 'build muscle', 'resistance training', 'weight lifting'],
  'cardio': ['aerobic', 'endurance', 'stamina', 'running', 'cycling'],
  'flexibility': ['stretching', 'mobility', 'range of motion', 'yoga']
};

export const DIGESTIVE_SYNONYMS: Record<string, string[]> = {
  'stomach': ['gastric', 'digestive', 'abdominal', 'gut'],
  'ibs': ['irritable bowel', 'bowel issues', 'gut health'],
  'bloating': ['gas', 'distension', 'swollen abdomen']
};

export const GOAL_SYNONYMS: Record<string, string[]> = {
  'weight loss': ['lose weight', 'slim down', 'reduce body fat', 'get leaner'],
  'muscle gain': ['build muscle', 'get stronger', 'bulk up', 'strength gain'],
  'recovery': ['heal', 'rehabilitate', 'get better', 'bounce back']
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
    painLevel: undefined as 'mild' | 'moderate' | 'severe' | undefined,
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
