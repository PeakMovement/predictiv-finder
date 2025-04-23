
import { ServiceConfigurationByBudget, ServiceCategory } from "./types";

export const CONDITION_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['personal-trainer', 'dietician', 'coaching'],
  'fitness goals': ['personal-trainer', 'coaching', 'dietician'],
  'hypertension': ['cardiology', 'dietician', 'personal-trainer'],
  'diabetes': ['endocrinology', 'dietician', 'personal-trainer'],
  'asthma': ['internal-medicine', 'personal-trainer', 'dietician'],
  'ankle sprain': ['physiotherapist', 'personal-trainer', 'biokineticist'],
  'shoulder strain': ['physiotherapist', 'personal-trainer', 'biokineticist'],
  'chronic fatigue': ['endocrinology', 'dietician', 'personal-trainer'],
  'stomach issues': ['gastroenterology', 'family-medicine', 'dietician'],
  'digestive problems': ['gastroenterology', 'family-medicine', 'dietician'],
  'knee pain': ['physiotherapist', 'personal-trainer', 'biokineticist'],
  'back pain': ['physiotherapist', 'personal-trainer', 'biokineticist'],
  'mental health': ['psychiatry', 'coaching'],
  'anxiety': ['psychiatry', 'coaching'],
  'depression': ['psychiatry', 'coaching'],
  'stress': ['psychiatry', 'coaching'],
  'respiratory issues': ['internal-medicine', 'family-medicine'],
  'joint pain': ['physiotherapist', 'biokineticist', 'orthopedics']
};

export const SERVICE_CONFIGS_BY_BUDGET: ServiceConfigurationByBudget = {
  'low': {
    allocations: [
      { type: 'personal-trainer', percentage: 50, priority: 1, minSessions: 1 },
      { type: 'dietician', percentage: 40, priority: 2, minSessions: 1 },
      { type: 'coaching', percentage: 30, priority: 3 },
      { type: 'family-medicine', percentage: 25, priority: 4 },
      { type: 'gastroenterology', percentage: 25, priority: 4 }
    ],
    requiresDoctor: false,
    preferHighEnd: false
  },
  'medium': {
    allocations: [
      { type: 'personal-trainer', percentage: 40, priority: 1, minSessions: 2 },
      { type: 'dietician', percentage: 30, priority: 2, minSessions: 1 },
      { type: 'coaching', percentage: 25, priority: 3 },
      { type: 'gastroenterology', percentage: 20, priority: 4 },
      { type: 'family-medicine', percentage: 20, priority: 4 },
      { type: 'physiotherapist', percentage: 25, priority: 3 }
    ],
    requiresDoctor: false,
    preferHighEnd: true
  },
  'high': {
    allocations: [
      { type: 'personal-trainer', percentage: 35, priority: 1, minSessions: 4 },
      { type: 'dietician', percentage: 25, priority: 2, minSessions: 2 },
      { type: 'coaching', percentage: 20, priority: 3 },
      { type: 'gastroenterology', percentage: 15, priority: 4 },
      { type: 'family-medicine', percentage: 15, priority: 4 },
      { type: 'physiotherapist', percentage: 10, priority: 3 }
    ],
    requiresDoctor: false,
    preferHighEnd: true
  }
};
