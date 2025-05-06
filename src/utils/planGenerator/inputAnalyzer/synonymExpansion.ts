
// Mental health related synonyms
export const MENTAL_HEALTH_SYNONYMS: Record<string, string[]> = {
  'anxiety': ['anxiety', 'anxious', 'worry', 'worried', 'panic', 'stress', 'stressed', 'nervous', 'tension', 'fear'],
  'depression': ['depression', 'depressed', 'sad', 'sadness', 'unhappy', 'despair', 'melancholy', 'down', 'blue', 'hopeless'],
  'mental health': ['mental health', 'mental wellbeing', 'psychological', 'emotional health', 'emotional wellbeing', 'therapy']
};

// Fitness related synonyms
export const FITNESS_SYNONYMS: Record<string, string[]> = {
  'weight loss': ['weight loss', 'lose weight', 'slim down', 'get lean', 'drop pounds', 'shed kilos', 'slimming'],
  'muscle': ['muscle', 'strength', 'build muscle', 'tone', 'toning', 'definition', 'bulk up', 'hypertrophy'],
  'cardio': ['cardio', 'cardiovascular', 'endurance', 'stamina', 'aerobic', 'run', 'running', 'jog', 'jogging'],
  'race': ['race', 'marathon', 'half-marathon', '5k', '10k', 'competition', 'event', 'run', 'running event', 'triathlon'],
  'fitness': ['fitness', 'exercise', 'workout', 'training', 'gym', 'physical activity', 'active']
};

// Digestive health related synonyms
export const DIGESTIVE_SYNONYMS: Record<string, string[]> = {
  'stomach': ['stomach', 'abdominal', 'tummy', 'belly', 'gut', 'intestinal', 'digestive', 'gastrointestinal', 'gi'],
  'pain': ['pain', 'ache', 'cramps', 'discomfort', 'upset', 'bloating', 'gas', 'nausea', 'indigestion'],
  'ibs': ['ibs', 'irritable bowel', 'irritable bowel syndrome', 'bowel issues', 'bowel problems']
};

// Goal related synonyms
export const GOAL_SYNONYMS: Record<string, string[]> = {
  'weight loss': ['weight loss', 'lose weight', 'slim down', 'get lean', 'drop pounds', 'shed kilos', 'lose fat'],
  'strength': ['strength', 'stronger', 'build muscle', 'gain muscle', 'muscle gain', 'bulk up', 'power'],
  'endurance': ['endurance', 'stamina', 'longer', 'last longer', 'cardiovascular', 'cardio', 'aerobic'],
  'rehabilitation': ['rehabilitation', 'rehab', 'recover', 'recovery', 'healing', 'get better', 'fix', 'repair'],
  'race': ['race', 'competition', 'event', 'marathon', 'half-marathon', '5k', '10k', 'triathlon', 'run'],
  'performance': ['performance', 'improve', 'better', 'excel', 'enhance', 'optimize', 'maximize']
};

// Re-export all synonyms
export const ALL_SYNONYMS = {
  ...MENTAL_HEALTH_SYNONYMS,
  ...FITNESS_SYNONYMS,
  ...DIGESTIVE_SYNONYMS,
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
