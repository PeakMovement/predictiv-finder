
export const MENTAL_HEALTH_SYNONYMS = {
  'anxiety': ['worried', 'anxious', 'stress', 'panic', 'nervousness', 'fear', 'tension', 'apprehension', 
    'uneasy', 'jittery', 'on edge', 'restless', 'troubled', 'distressed', 'concerned', 'fretful'],
  'depression': ['sad', 'hopeless', 'depressed', 'melancholy', 'down', 'blue', 'unhappy', 'gloomy', 'despondent',
    'miserable', 'low', 'melancholic', 'dejected', 'dispirited', 'disheartened', 'downcast', 'somber'],
  'sleep': ['insomnia', 'sleepless', 'rest', 'tired', 'exhaustion', 'fatigue', 'drowsy', 'lethargy',
    'restless', 'disturbed sleep', 'sleep apnea', 'narcolepsy', 'sleep cycle', 'deep sleep', 'wake up'],
  'focus': ['concentration', 'attention', 'distracted', 'adhd', 'forgetful', 'memory',
    'mindfulness', 'distractible', 'absent-minded', 'scattered', 'disorganized', 'foggy'],
  'stress': ['tension', 'pressure', 'strain', 'burden', 'overwhelmed', 'burnout', 'overworked',
    'stressful', 'stressed out', 'frazzled', 'taxed', 'hassled', 'worn out', 'stretched thin']
};

export const DIGESTIVE_SYNONYMS = {
  'stomach': ['digestive', 'gut', 'abdomen', 'belly', 'intestines', 'digestive system', 'gastro', 
    'gastrointestinal', 'tummy', 'digestive tract', 'abdominal', 'alimentary', 'visceral'],
  'nausea': ['sick', 'queasy', 'vomit', 'throw up', 'upset stomach', 
    'nauseated', 'sick to stomach', 'heave', 'retch', 'gag', 'motion sickness'],
  'constipation': ['blocked', 'irregular', 'bowel issues', 'can\'t go', 'hard stool',
    'difficult bowel movement', 'impacted', 'backed up', 'infrequent bowel movement'],
  'diarrhea': ['loose stool', 'frequent bowel', 'watery stool', 'upset stomach',
    'runs', 'frequent bathroom', 'loose bowels', 'liquid stool'],
  'bloating': ['gas', 'distended', 'swollen', 'full', 'gassy', 'inflated',
    'puffy', 'swelling', 'abdominal distension', 'tightness', 'uncomfortable fullness', 'balloon']
};

export const FITNESS_SYNONYMS = {
  'weight loss': ['lose weight', 'slim down', 'get thinner', 'drop kilos', 'shed pounds', 'reduce weight',
    'slimming', 'fat loss', 'weight reduction', 'get leaner', 'burn fat', 'trim down', 'lose kilos'],
  'muscle gain': ['build muscle', 'get stronger', 'bulk up', 'increase strength', 'tone up', 'definition',
    'hypertrophy', 'bodybuilding', 'muscle building', 'strength gains', 'put on muscle', 'muscular'],
  'cardio': ['aerobic', 'endurance', 'stamina', 'heart rate', 'running', 'cycling',
    'cardiovascular', 'aerobics', 'cardio fitness', 'heart health', 'conditioning', 'endurance training'],
  'strength': ['resistance', 'weights', 'lifting', 'strong', 'power', 'muscle', 'toning',
    'weightlifting', 'resistance training', 'powerlifting', 'strength training', 'muscular power'],
  'recovery': ['healing', 'rest', 'rehabilitation', 'restore', 'recuperate', 'bounce back', 
    'repair', 'mending', 'comeback', 'convalescence', 'getting better', 'rejuvenation']
};

export const GOAL_SYNONYMS = {
  'weight': ['lose weight', 'slimmer', 'thinner', 'fat loss', 'leaner', 'tone up', 'trim down',
    'slender', 'weight reduction', 'lose kilos', 'diet', 'slim', 'weight management'],
  'fitness': ['fit', 'active', 'exercise', 'workout', 'training', 'conditioning', 'strength',
    'in shape', 'athletic', 'physically fit', 'working out', 'fitness routine', 'fitness level'],
  'race': ['run', 'marathon', 'half-marathon', '5k', '10k', 'competition', 'event', 'triathlon',
    'race day', 'finish line', 'track meet', 'running event', 'cross country', 'fun run', 'ultra'],
  'performance': ['improve', 'better', 'faster', 'stronger', 'enhance', 'excel', 'progress',
    'personal best', 'PR', 'achievement', 'advancement', 'improvement', 'gains', 'optimization'],
  'health': ['wellness', 'wellbeing', 'healthier', 'lifestyle', 'vitality', 'condition', 'vigor',
    'medical', 'health status', 'physical health', 'general health', 'preventive', 'health maintenance']
};

export const PAIN_SYNONYMS = {
  'back pain': ['lower back', 'spine pain', 'backache', 'back problems', 'lumbar pain', 'back issues', 
    'spinal pain', 'back injury', 'back discomfort', 'dorsalgia', 'sciatica', 'herniated disc'],
  'joint pain': ['arthritis', 'arthritic', 'joint ache', 'joint stiffness', 'inflammation', 'rheumatic',
    'joint discomfort', 'sore joints', 'painful joints', 'osteoarthritis', 'rheumatism'],
  'headache': ['migraine', 'head pain', 'tension headache', 'cluster headache', 'sinus headache',
    'throbbing', 'head pressure', 'pounding head', 'chronic headache', 'head discomfort'],
  'knee pain': ['knee injury', 'runner\'s knee', 'knee ache', 'knee problems', 'patella pain',
    'knee issues', 'knee discomfort', 'sore knee', 'patellofemoral', 'knee arthritis', 'ACL']
};

export const URGENCY_SENTIMENT_TERMS = {
  'high_urgency': ['immediately', 'urgent', 'emergency', 'critical', 'asap', 'right away', 'severe',
    'terrible', 'unbearable', 'excruciating', 'desperate', 'extremely', 'very urgent', 'now', 'serious'],
  'moderate_urgency': ['soon', 'important', 'concerning', 'notable', 'significant', 'moderate', 'fairly',
    'quite', 'bothering', 'uncomfortable', 'disruptive', 'need help', 'problematic'],
  'low_urgency': ['sometime', 'eventually', 'when possible', 'gradually', 'slowly', 'mild', 'slight',
    'minor', 'hardly', 'occasionally', 'infrequent', 'rare', 'manageable']
};

// Combined map for easier access
export const ALL_SYNONYMS = {
  ...MENTAL_HEALTH_SYNONYMS,
  ...DIGESTIVE_SYNONYMS,
  ...FITNESS_SYNONYMS,
  ...GOAL_SYNONYMS,
  ...PAIN_SYNONYMS
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

/**
 * Analyzes the sentiment and urgency of user input
 * @param input User's input text
 * @returns Analysis with urgency level and sentiment scores
 */
export const analyzeSentiment = (input: string): {
  urgencyLevel: 'high' | 'moderate' | 'low';
  urgencyScore: number;
  sentimentScores: {
    pain: number;
    distress: number;
    frustration: number;
  }
} => {
  const inputLower = input.toLowerCase();
  let urgencyScore = 0;
  let painScore = 0;
  let distressScore = 0;
  let frustrationScore = 0;
  
  // Check for urgency terms
  URGENCY_SENTIMENT_TERMS.high_urgency.forEach(term => {
    if (inputLower.includes(term)) {
      urgencyScore += 0.2;
    }
  });
  
  URGENCY_SENTIMENT_TERMS.moderate_urgency.forEach(term => {
    if (inputLower.includes(term)) {
      urgencyScore += 0.1;
    }
  });
  
  URGENCY_SENTIMENT_TERMS.low_urgency.forEach(term => {
    if (inputLower.includes(term)) {
      urgencyScore -= 0.1;
    }
  });
  
  // Cap the urgency score between 0 and 1
  urgencyScore = Math.max(0, Math.min(1, urgencyScore));
  
  // Calculate pain score based on pain-related terms
  Object.values(PAIN_SYNONYMS).flat().forEach(term => {
    if (inputLower.includes(term.toLowerCase())) {
      painScore += 0.1;
    }
  });
  
  // Check for intensity modifiers near pain terms
  const intensityModifiers = ['severe', 'extreme', 'intense', 'bad', 'worst', 'terrible', 'unbearable'];
  intensityModifiers.forEach(modifier => {
    Object.keys(PAIN_SYNONYMS).forEach(painType => {
      const pattern = new RegExp(`${modifier}\\s+(?:\\w+\\s+){0,2}${painType}`, 'i');
      if (pattern.test(inputLower)) {
        painScore += 0.2;
        urgencyScore += 0.1;
      }
    });
  });
  
  // Check for emotional distress terms
  const distressTerms = ['worried', 'anxiety', 'depressed', 'scared', 'afraid', 'nervous', 'upset', 'distressed'];
  distressTerms.forEach(term => {
    if (inputLower.includes(term)) {
      distressScore += 0.1;
    }
  });
  
  // Check for frustration terms
  const frustrationTerms = ['frustrated', 'annoyed', 'tried everything', 'nothing works', 'fed up', 'at wit\'s end'];
  frustrationTerms.forEach(term => {
    if (inputLower.includes(term)) {
      frustrationScore += 0.15;
    }
  });
  
  // Cap scores between 0 and 1
  painScore = Math.min(1, painScore);
  distressScore = Math.min(1, distressScore);
  frustrationScore = Math.min(1, frustrationScore);
  
  // Determine urgency level based on score
  let urgencyLevel: 'high' | 'moderate' | 'low';
  if (urgencyScore >= 0.6) {
    urgencyLevel = 'high';
  } else if (urgencyScore >= 0.3) {
    urgencyLevel = 'moderate';
  } else {
    urgencyLevel = 'low';
  }
  
  return {
    urgencyLevel,
    urgencyScore,
    sentimentScores: {
      pain: painScore,
      distress: distressScore,
      frustration: frustrationScore
    }
  };
};
