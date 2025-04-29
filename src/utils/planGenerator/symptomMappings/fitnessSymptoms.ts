
import { SymptomMapping } from "./types";
import { ServiceCategory } from "../types";

export const FITNESS_SYMPTOMS: Record<string, SymptomMapping> = {
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
  "fitness": {
    primary: 'personal-trainer',
    specialties: ['coaching'],
    priority: 0.8,
    keywords: ['toning', 'shape', 'workout', 'exercise', 'gym', 'physical fitness', 'get in shape'],
  }
};
