
import { SymptomMapping } from "./types";
import { ServiceCategory } from "../types";

export const PHYSICAL_SYMPTOMS: Record<string, SymptomMapping> = {
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
  "chronic fatigue": {
    primary: 'family-medicine',
    specialties: ['endocrinology'],
    secondary: ['coaching'],
    priority: 0.8,
    keywords: ['always tired', 'no energy', 'exhausted', 'fatigue', 'low energy', 'lethargic'],
  },
  "respiratory issues": {
    primary: 'internal-medicine',
    specialties: ['family-medicine'],
    priority: 0.85,
    keywords: ['breathing problems', 'coughing', 'shortness of breath', 'lung issues', 'respiratory condition'],
  },
  "general health": {
    primary: 'family-medicine',
    specialties: ['dietician'],
    secondary: ['personal-trainer'],
    priority: 0.5,
    keywords: ['checkup', 'wellness', 'health status', 'general wellbeing', 'overall health'],
  },
  "allergies": {
    primary: 'family-medicine',
    specialties: ['internal-medicine'],
    priority: 0.7,
    keywords: ['hay fever', 'allergic reaction', 'food allergy', 'sneezing', 'itchy eyes', 'sinus'],
  },
  "menopause": {
    primary: 'family-medicine',
    specialties: ['endocrinology'],
    secondary: ['dietician'],
    priority: 0.75,
    keywords: ['hot flashes', 'night sweats', 'hormone changes', 'menopausal', 'perimenopause'],
  }
};
