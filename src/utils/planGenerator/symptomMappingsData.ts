
import { ServiceCategory } from "./types";
import { SymptomMapping } from "./symptomTypes";

export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  "weight loss": {
    primary: 'dietician',
    specialties: ['personal-trainer'],
    secondary: ['coaching'],
    priority: 0.9,
    keywords: ['lose weight', 'losing weight', 'shed kilos', 'burn fat', 'get thinner', 'slimming'],
    context: ['diet', 'exercise', 'health', 'lifestyle']
  },
  "fitness goals": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['get fit', 'build muscle', 'tone', 'fitness', 'strength', 'workout', 'exercise regime'],
  },
  "hypertension": {
    primary: 'family-medicine',
    specialties: ['cardiology'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['high blood pressure', 'blood pressure', 'bp', 'hypertensive'],
  },
  "diabetes": {
    primary: 'endocrinology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['blood sugar', 'glucose', 'insulin', 'sugar levels', 'diabetic'],
  },
  "asthma": {
    primary: 'internal-medicine',
    specialties: ['family-medicine'],
    priority: 0.8,
    keywords: ['breathing issues', 'shortness of breath', 'wheezing', 'inhaler', 'breathlessness'],
  },
  "ankle sprain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['twisted ankle', 'ankle injury', 'rolled ankle', 'ankle pain', 'sprained ankle'],
  },
  "shoulder strain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['hurt shoulder', 'injured shoulder', 'shoulder pain', 'rotator cuff', 'shoulder mobility'],
  },
  "chronic fatigue": {
    primary: 'family-medicine',
    specialties: ['endocrinology'],
    secondary: ['coaching'],
    priority: 0.8,
    keywords: ['always tired', 'no energy', 'exhausted', 'fatigue', 'low energy', 'lethargic'],
  },
  "stomach issues": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['digestive problems', 'abdominal pain', 'stomach pain', 'gut issues', 'indigestion', 'bloating'],
    contraindications: ['biokineticist', 'personal-trainer']
  },
  "stomach pain": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.9,
    keywords: ['abdominal pain', 'belly pain', 'stomach ache', 'gut pain', 'gastric pain'],
    contraindications: ['biokineticist', 'personal-trainer']
  },
  "digestive problems": {
    primary: 'gastroenterology',
    specialties: ['family-medicine'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['digestion', 'bowel issues', 'IBS', 'constipation', 'diarrhea', 'acid reflux', 'heartburn', 'GERD'],
    contraindications: ['biokineticist', 'personal-trainer']
  },
  "knee pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['sore knee', 'knee injury', 'runner\'s knee', 'ACL', 'knee pain', 'knee joint pain'],
  },
  "back pain": {
    primary: 'physiotherapist',
    specialties: ['biokineticist', 'orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.9,
    keywords: ['lower back', 'back injury', 'sciatica', 'back ache', 'lumbar pain', 'spinal pain'],
  },
  "mental health": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['anxiety', 'depression', 'stress', 'mood', 'mental wellbeing', 'psychological health'],
    contraindications: ['gastroenterology', 'orthopedics']
  },
  "anxiety": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.85,
    keywords: ['anxious', 'worry', 'panic', 'overthinking', 'nervousness', 'anxiousness'],
    contraindications: ['gastroenterology', 'orthopedics']
  },
  "depression": {
    primary: 'psychiatry',
    specialties: ['coaching'],
    priority: 0.9,
    keywords: ['low mood', 'sad', 'unmotivated', 'despair', 'hopeless', 'depressed', 'melancholy'],
    contraindications: ['gastroenterology', 'orthopedics']
  },
  "stress": {
    primary: 'coaching',
    specialties: ['psychiatry'],
    priority: 0.75,
    keywords: ['overwhelmed', 'burnout', 'tension', 'pressure', 'mental pressure', 'stressed out'],
  },
  "respiratory issues": {
    primary: 'internal-medicine',
    specialties: ['family-medicine'],
    priority: 0.85,
    keywords: ['breathing problems', 'coughing', 'shortness of breath', 'lung issues', 'respiratory condition'],
  },
  "joint pain": {
    primary: 'physiotherapist',
    specialties: ['orthopedics'],
    secondary: ['biokineticist'],
    priority: 0.8,
    keywords: ['arthritis', 'joint stiffness', 'joint inflammation', 'sore joints', 'painful joints'],
  },
  "nutrition": {
    primary: 'dietician',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['diet', 'eating', 'food', 'nutrients', 'meal plan', 'nutrition plan', 'eating habits'],
  },
  "strength": {
    primary: 'personal-trainer',
    specialties: ['biokineticist'],
    priority: 0.75,
    keywords: ['stronger', 'build muscle', 'resistance training', 'weights', 'strength training', 'lifting'],
  },
  "cardio": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    priority: 0.7,
    keywords: ['running', 'jogging', 'stamina', 'endurance', 'cardiovascular', 'aerobic fitness'],
  },
  "general health": {
    primary: 'family-medicine',
    specialties: ['dietician'],
    secondary: ['personal-trainer'],
    priority: 0.5,
    keywords: ['checkup', 'wellness', 'health status', 'general wellbeing', 'overall health'],
  },
  "race preparation": {
    primary: 'coaching',
    specialties: ['personal-trainer'],
    secondary: ['dietician'],
    priority: 0.85,
    keywords: ['run training', 'race prep', 'marathon training', 'half marathon', 'running event', 'race day'],
  },
  "event preparation": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    secondary: ['dietician'],
    priority: 0.8,
    keywords: ['competition prep', 'event training', 'preparing for event', 'sports event', 'competition training'],
  },
  "pain": {
    primary: 'physiotherapist',
    specialties: ['family-medicine'],
    secondary: ['pain-management'],
    priority: 0.7,
    keywords: ['ache', 'hurt', 'sore', 'discomfort', 'painful', 'aching'],
  },
  "fitness": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['toning', 'shape', 'workout', 'exercise', 'gym', 'physical fitness', 'get in shape'],
  },
  "sleep issues": {
    primary: 'family-medicine',
    specialties: ['psychiatry'],
    secondary: ['coaching'],
    priority: 0.75,
    keywords: ['insomnia', 'trouble sleeping', 'sleep apnea', 'can\'t sleep', 'poor sleep', 'sleep quality'],
  },
  "headaches": {
    primary: 'family-medicine',
    specialties: ['neurology'],
    priority: 0.8,
    keywords: ['migraines', 'head pain', 'tension headache', 'cluster headache', 'headache'],
  },
  "menopause": {
    primary: 'family-medicine',
    specialties: ['endocrinology'],
    secondary: ['dietician'],
    priority: 0.75,
    keywords: ['hot flashes', 'night sweats', 'hormone changes', 'menopausal', 'perimenopause'],
  },
  "sports injury": {
    primary: 'physiotherapist',
    specialties: ['orthopedics'],
    secondary: ['personal-trainer'],
    priority: 0.85,
    keywords: ['athletic injury', 'sports trauma', 'training injury', 'muscle tear', 'strained muscle'],
  },
  "allergies": {
    primary: 'family-medicine',
    specialties: ['internal-medicine'],
    priority: 0.7,
    keywords: ['hay fever', 'allergic reaction', 'food allergy', 'sneezing', 'itchy eyes', 'sinus'],
  }
};
