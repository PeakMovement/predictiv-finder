
import { SymptomMapping } from "./types";
import { ServiceCategory } from "../types";

export const DIGESTIVE_SYMPTOMS: Record<string, SymptomMapping> = {
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
  "nutrition": {
    primary: 'dietician',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['diet', 'eating', 'food', 'nutrients', 'meal plan', 'nutrition plan', 'eating habits'],
  }
};
