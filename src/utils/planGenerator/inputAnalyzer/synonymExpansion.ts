
// A comprehensive mapping of terms to their synonyms for better detection
export type SynonymMap = Record<string, string[]>;

export const PAIN_SYNONYMS: SynonymMap = {
  'pain': ['ache', 'hurt', 'sore', 'discomfort', 'aching', 'hurting', 'painful', 'tender', 'stiff'],
  'injury': ['strain', 'sprain', 'pull', 'tear', 'damage', 'hurt', 'trauma', 'wound'],
  'recover': ['heal', 'recuperate', 'get better', 'rehab', 'rehabilitation', 'fix', 'repair', 'treat', 'therapy', 'treatment'],
  'fatigue': ['tired', 'exhausted', 'drained', 'weary', 'worn out', 'low energy', 'exhaustion', 'lethargy', 'sluggish']
};

export const FITNESS_SYNONYMS: SynonymMap = {
  'exercise': ['workout', 'training', 'train', 'fitness', 'activity', 'move', 'movement', 'active', 'exercising', 'physical activity'],
  'lose weight': ['weight loss', 'slim down', 'shed pounds', 'drop weight', 'get leaner', 'trim down', 'reduce weight', 'drop kg', 'lose kg'],
  'build muscle': ['gain muscle', 'get stronger', 'tone up', 'build strength', 'gain strength', 'bulk up', 'muscular development', 'toning', 'hypertrophy'],
  'endurance': ['stamina', 'cardio', 'cardiovascular', 'aerobic', 'fitness', 'conditioning', 'running capacity', 'endure']
};

export const MENTAL_HEALTH_SYNONYMS: SynonymMap = {
  'anxiety': ['anxious', 'worry', 'stressed', 'nervous', 'on edge', 'uneasy', 'tense', 'panic', 'apprehension', 'fear'],
  'depression': ['depressed', 'sad', 'down', 'low', 'unhappy', 'blue', 'melancholy', 'despondent', 'hopeless', 'gloomy'],
  'stress': ['pressure', 'tension', 'strain', 'overwhelmed', 'burnout', 'distress', 'worried', 'anxious'],
  'sleep': ['insomnia', 'rest', 'sleepless', 'tired', 'fatigue', 'can\'t sleep', 'trouble sleeping', 'sleep issues', 'poor sleep']
};

export const URGENCY_SYNONYMS: SynonymMap = {
  'urgent': ['immediately', 'right away', 'asap', 'as soon as possible', 'emergency', 'critical', 'now', 'fast', 'quickly', 'urgent care'],
  'soon': ['shortly', 'next week', 'in a few days', 'coming up', 'approaching', 'without delay', 'imminent'],
  'long term': ['chronic', 'ongoing', 'persistent', 'continuous', 'recurring', 'long-standing', 'prolonged', 'extended', 'lasting']
};

export const GOAL_SYNONYMS: SynonymMap = {
  'improve': ['enhance', 'better', 'boost', 'increase', 'progress', 'develop', 'advance', 'grow', 'elevate'],
  'prevent': ['avoid', 'stop', 'reduce risk', 'protect against', 'keep from', 'deter', 'avert', 'inhibit', 'precaution'],
  'manage': ['control', 'handle', 'regulate', 'supervise', 'coordinate', 'maintain', 'deal with', 'cope with'],
  'race': ['marathon', 'running event', 'competition', '5k', '10k', 'half marathon', 'triathlon', 'athletic event', 'run', 'racing']
};

export const DIGESTIVE_SYNONYMS: SynonymMap = {
  'stomach': ['gut', 'digestive', 'tummy', 'belly', 'abdomen', 'abdominal', 'intestinal', 'bowel', 'gastrointestinal', 'gi'],
  'nausea': ['sick feeling', 'queasy', 'upset stomach', 'feel like vomiting', 'queasiness'],
  'bloating': ['swollen', 'distended', 'gassy', 'full', 'swelling', 'puffiness', 'inflated', 'distension', 'gas']
};

// Compile all synonym mappings into a single object for easy access
export const ALL_SYNONYMS: SynonymMap = {
  ...PAIN_SYNONYMS,
  ...FITNESS_SYNONYMS,
  ...MENTAL_HEALTH_SYNONYMS,
  ...URGENCY_SYNONYMS,
  ...GOAL_SYNONYMS,
  ...DIGESTIVE_SYNONYMS
};

/**
 * Expands input text by checking for synonyms and adding them to the search space
 * This helps catch terms that might be expressed in different ways
 */
export function expandSynonyms(inputText: string): string {
  let expandedInput = inputText.toLowerCase();
  
  // Check original input for each primary term in our synonym maps
  Object.entries(ALL_SYNONYMS).forEach(([primaryTerm, synonyms]) => {
    // If the primary term is in the input, we don't need to expand it
    if (expandedInput.includes(primaryTerm.toLowerCase())) {
      return;
    }
    
    // Check if any synonyms appear in the input
    const foundSynonym = synonyms.some(synonym => 
      expandedInput.includes(synonym.toLowerCase())
    );
    
    // If a synonym was found, add the primary term to the expanded input
    if (foundSynonym) {
      expandedInput += ` (${primaryTerm})`;
      console.log(`Expanded synonym: found "${primaryTerm}" through synonyms`);
    }
  });
  
  return expandedInput;
}
