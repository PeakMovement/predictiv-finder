
export const MENTAL_HEALTH_SYNONYMS = {
  'anxiety': ['worried', 'anxious', 'stress', 'panic', 'nervousness', 'fear', 'tension', 'apprehension'],
  'depression': ['sad', 'hopeless', 'depressed', 'melancholy', 'down', 'blue', 'unhappy', 'gloomy', 'despondent'],
  'sleep': ['insomnia', 'sleepless', 'rest', 'tired', 'exhaustion', 'fatigue', 'drowsy', 'lethargy'],
  'focus': ['concentration', 'attention', 'distracted', 'adhd', 'forgetful', 'memory'],
  'stress': ['tension', 'pressure', 'strain', 'burden', 'overwhelmed', 'burnout', 'overworked']
};

export const DIGESTIVE_SYNONYMS = {
  'stomach': ['digestive', 'gut', 'abdomen', 'belly', 'intestines', 'digestive system', 'gastro'],
  'nausea': ['sick', 'queasy', 'vomit', 'throw up', 'upset stomach'],
  'constipation': ['blocked', 'irregular', 'bowel issues', 'can\'t go', 'hard stool'],
  'diarrhea': ['loose stool', 'frequent bowel', 'watery stool', 'upset stomach'],
  'bloating': ['gas', 'distended', 'swollen', 'full', 'gassy', 'inflated']
};

export const FITNESS_SYNONYMS = {
  'weight loss': ['lose weight', 'slim down', 'get thinner', 'drop kilos', 'shed pounds', 'reduce weight'],
  'muscle gain': ['build muscle', 'get stronger', 'bulk up', 'increase strength', 'tone up', 'definition'],
  'cardio': ['aerobic', 'endurance', 'stamina', 'heart rate', 'running', 'cycling'],
  'strength': ['resistance', 'weights', 'lifting', 'strong', 'power', 'muscle', 'toning']
};

export const GOAL_SYNONYMS = {
  'weight': ['lose weight', 'slimmer', 'thinner', 'fat loss', 'leaner', 'tone up', 'trim down'],
  'fitness': ['fit', 'active', 'exercise', 'workout', 'training', 'conditioning', 'strength'],
  'race': ['run', 'marathon', 'half-marathon', '5k', '10k', 'competition', 'event', 'triathlon'],
  'performance': ['improve', 'better', 'faster', 'stronger', 'enhance', 'excel', 'progress'],
  'health': ['wellness', 'wellbeing', 'healthier', 'lifestyle', 'vitality', 'condition', 'vigor']
};

// Combined map for easier access
export const ALL_SYNONYMS = {
  ...MENTAL_HEALTH_SYNONYMS,
  ...DIGESTIVE_SYNONYMS,
  ...FITNESS_SYNONYMS,
  ...GOAL_SYNONYMS
};

/**
 * Expands user input with relevant synonyms to improve detection accuracy
 * @param input Original user input text
 * @returns Expanded text with relevant synonym terms added
 */
export const expandSynonyms = (input: string): string => {
  // If input is empty or not a string, return as is
  if (!input || typeof input !== 'string') {
    return input;
  }
  
  const inputLower = input.toLowerCase();
  let expandedInput = input;
  
  // Track already added terms to avoid duplicates
  const addedTerms = new Set<string>();
  
  // Go through all synonym categories
  Object.entries(ALL_SYNONYMS).forEach(([keyword, synonyms]) => {
    // Check if the input contains this keyword or any of its synonyms
    const hasMatch = synonyms.some(synonym => inputLower.includes(synonym.toLowerCase()));
    
    if (hasMatch) {
      // Add all synonyms to the expanded input that aren't already in the input
      synonyms.forEach(synonym => {
        if (!inputLower.includes(synonym.toLowerCase()) && !addedTerms.has(synonym.toLowerCase())) {
          // Add the term with a space to ensure it's a separate word
          expandedInput += ` ${synonym}`;
          addedTerms.add(synonym.toLowerCase());
        }
      });
    }
  });
  
  return expandedInput;
};
