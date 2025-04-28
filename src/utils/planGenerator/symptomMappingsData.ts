
import { ServiceCategory } from "./types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  secondary?: ServiceCategory[];
  priority: number;
  keywords?: string[];
  context?: string[];
  contraindications?: ServiceCategory[];
}

export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  "weight loss": {
    primary: 'dietician',
    specialties: ['personal-trainer'],
    secondary: ['coaching'],
    priority: 0.9,
    keywords: ['lose weight', 'losing weight', 'shed kilos', 'burn fat'],
  },
  "fitness goals": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['get fit', 'build muscle', 'tone', 'fitness', 'strength'],
  },
  "hypertension": {
    primary: 'family-medicine',
    specialties: ['cardiology'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['high blood pressure', 'blood pressure'],
  },
  "diabetes": {
    primary: 'endocrinology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['blood sugar', 'glucose', 'insulin'],
  },
  "asthma": {
    primary: 'internal-medicine',
    specialties: ['family-medicine'],
    priority: 0.8,
    keywords: ['breathing issues', 'shortness of breath', 'wheezing'],
  },
  "ankle sprain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['twisted ankle', 'ankle injury'],
  },
  "shoulder strain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['hurt shoulder', 'injured shoulder', 'shoulder pain', 'rotator cuff'],
  },
  "chronic fatigue": {
    primary: 'family-medicine',
    specialties: ['endocrinology'],
    secondary: ['coaching'],
    priority: 0.8,
    keywords: ['always tired', 'no energy', 'exhausted'],
  },
  // Updated for stomach issues with appropriate specialists
  "stomach issues": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['digestive problems', 'abdominal pain', 'stomach pain', 'gut issues', 'indigestion'],
    contraindications: ['biokineticist', 'personal-trainer'] // Added contraindications
  },
  // Separate entry for stomach pain specifically
  "stomach pain": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.9, // Higher priority for specific pain
    keywords: ['abdominal pain', 'belly pain', 'stomach ache'],
    contraindications: ['biokineticist', 'personal-trainer'] // Added contraindications
  },
  "digestive problems": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['digestion', 'bowel issues', 'IBS', 'constipation', 'diarrhea'],
    contraindications: ['biokineticist', 'personal-trainer'] // Added contraindications
  },
  "knee pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['sore knee', 'knee injury', 'runner\'s knee', 'ACL'],
  },
  "back pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.9,
    keywords: ['lower back', 'back injury', 'sciatica', 'back ache', 'lumbar pain'],
  },
  "mental health": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['anxiety', 'depression', 'stress', 'mood', 'mental wellbeing'],
  },
  "anxiety": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.85,
    keywords: ['anxious', 'worry', 'panic', 'overthinking'],
  },
  "depression": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.9,
    keywords: ['low mood', 'sad', 'unmotivated', 'despair'],
  },
  "stress": {
    primary: 'coaching',
    specialties: ['psychiatry'],
    priority: 0.75,
    keywords: ['overwhelmed', 'burnout', 'tension'],
  },
  "respiratory issues": {
    primary: 'internal-medicine',
    specialties: ['family-medicine'],
    priority: 0.85,
    keywords: ['breathing problems', 'coughing', 'shortness of breath'],
  },
  "joint pain": {
    primary: 'physiotherapist',
    specialties: ['orthopedics'],
    secondary: ['biokineticist'],
    priority: 0.8,
    keywords: ['arthritis', 'joint stiffness', 'joint inflammation'],
  },
  "nutrition": {
    primary: 'dietician',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['diet', 'eating', 'food', 'nutrients', 'meal plan'],
  },
  "strength": {
    primary: 'personal-trainer',
    specialties: ['biokineticist'],
    priority: 0.75,
    keywords: ['stronger', 'build muscle', 'resistance training'],
  },
  "cardio": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    priority: 0.7,
    keywords: ['running', 'jogging', 'stamina', 'endurance'],
  },
  "general health": {
    primary: 'family-medicine',
    specialties: ['dietician'],
    secondary: ['personal-trainer'],
    priority: 0.5,
    keywords: ['checkup', 'wellness', 'health status'],
  },
  "race preparation": {
    primary: 'coaching',
    specialties: ['personal-trainer'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['run training', 'race prep', 'marathon training'],
  },
  "event preparation": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['competition prep', 'event training', 'preparing for event'],
  },
  "pain": {
    primary: 'physiotherapist',
    specialties: ['family-medicine'],
    secondary: ['pain-management'],
    priority: 0.7,
    keywords: ['ache', 'hurt', 'sore', 'discomfort'],
  },
  "fitness": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['toning', 'shape', 'workout', 'exercise'],
  }
};
