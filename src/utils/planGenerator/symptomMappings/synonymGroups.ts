
// Export synonym groups for specialized detectors

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
