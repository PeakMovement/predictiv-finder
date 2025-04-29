
import { SymptomMapping } from "./types";
import { ServiceCategory } from "../types";

export const MENTAL_HEALTH_SYMPTOMS: Record<string, SymptomMapping> = {
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
  "sleep issues": {
    primary: 'family-medicine',
    specialties: ['psychiatry'],
    secondary: ['coaching'],
    priority: 0.75,
    keywords: ['insomnia', 'trouble sleeping', 'sleep apnea', 'can\'t sleep', 'poor sleep', 'sleep quality'],
  }
};
