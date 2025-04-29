
// Map common symptoms/goals to relevant health conditions
export const SYMPTOM_TO_CONDITION: Record<string, string[]> = {
  'weight': ['weight loss'],
  'diet': ['weight loss'],
  'nutrition': ['weight loss'],
  'lose weight': ['weight loss'],
  'kg': ['weight loss'],
  'tone': ['fitness goals'],
  'toning': ['fitness goals'],
  'train': ['fitness goals'],
  'training': ['fitness goals'],
  'workout': ['fitness goals'],
  'exercise': ['fitness goals'],
  'fitness': ['fitness goals'],
  'blood pressure': ['hypertension'],
  'high blood pressure': ['hypertension'],
  'pressure': ['hypertension'],
  'sugar': ['diabetes'],
  'diabetes': ['diabetes'],
  'glucose': ['diabetes'],
  'breathing': ['asthma'],
  'breathe': ['asthma'],
  'inhaler': ['asthma'],
  'ankle': ['ankle sprain'],
  'sprain': ['ankle sprain'],
  'shoulder': ['shoulder strain'],
  'strain': ['shoulder strain'],
  'tired': ['chronic fatigue'],
  'fatigue': ['chronic fatigue'],
  'exhausted': ['chronic fatigue'],
  'stomach': ['stomach issues'],
  'digestive': ['stomach issues'],
  'gut': ['stomach issues'],
  'stomach pain': ['stomach issues'],
  "doesn't feel good": ['stomach issues'],
  'nausea': ['stomach issues'],
  'vomiting': ['stomach issues'],
  'diarrhea': ['stomach issues'],
  'constipation': ['stomach issues'],
  'bloating': ['stomach issues'],
  'indigestion': ['stomach issues'],
  'knee': ['knee pain'],
  'back': ['back pain'],
  'spine': ['back pain'],
  'stress': ['mental health'],
  'anxiety': ['mental health', 'anxiety'],
  'depression': ['mental health', 'depression'],
  'mental': ['mental health'],
  'sleep': ['sleep issues'],
  'insomnia': ['sleep issues'],
  'headache': ['headaches'],
  'migraine': ['headaches'],
  'joint': ['joint pain'],
  'arthritis': ['joint pain'],
  'inflammation': ['joint pain'],
  'skin': ['skin issues'],
  'rash': ['skin issues'],
  'acne': ['skin issues'],
  'eczema': ['skin issues'],
  'wedding': ['fitness goals', 'weight loss']
};

export const findMedicalConditionsFromSymptoms = (inputLower: string): string[] => {
  const conditions = new Set<string>();
  
  Object.entries(SYMPTOM_TO_CONDITION).forEach(([symptom, relatedConditions]) => {
    if (inputLower.includes(symptom)) {
      relatedConditions.forEach(condition => {
        conditions.add(condition);
        console.log("Found condition from symptom:", condition, "from", symptom);
      });
    }
  });
  
  return Array.from(conditions);
};
