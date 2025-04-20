import { ServiceConfigurationByBudget, ServiceCategory } from "./types";

export const CONDITION_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['dietician', 'personal-trainer', 'coaching'],
  'hypertension': ['cardiology', 'dietician', 'personal-trainer'],
  'diabetes': ['endocrinology', 'dietician', 'personal-trainer'],
  'asthma': ['internal-medicine', 'personal-trainer', 'dietician'],
  'ankle sprain': ['physiotherapist', 'personal-trainer'],
  'shoulder strain': ['physiotherapist', 'personal-trainer'],
  'chronic fatigue': ['endocrinology', 'dietician', 'personal-trainer'],
  'stomach issues': ['gastroenterology', 'dietician'],
  'knee pain': ['physiotherapist', 'personal-trainer'],
  'back pain': ['physiotherapist', 'personal-trainer']
};

export const SERVICE_CONFIGS_BY_BUDGET: ServiceConfigurationByBudget = {
  'low': {
    allocations: [
      { type: 'dietician', percentage: 50, priority: 1, minSessions: 1 },
      { type: 'personal-trainer', percentage: 50, priority: 2 }
    ],
    requiresDoctor: false,
    preferHighEnd: false
  },
  'medium': {
    allocations: [
      { type: 'dietician', percentage: 40, priority: 1, minSessions: 1 },
      { type: 'personal-trainer', percentage: 30, priority: 2 },
      { type: 'physiotherapist', percentage: 30, priority: 3 }
    ],
    requiresDoctor: true,
    preferHighEnd: true
  },
  'high': {
    allocations: [
      { type: 'dietician', percentage: 35, priority: 1, minSessions: 1 },
      { type: 'personal-trainer', percentage: 35, priority: 2 },
      { type: 'physiotherapist', percentage: 15, priority: 3 },
      { type: 'coaching', percentage: 15, priority: 4 }
    ],
    requiresDoctor: true,
    preferHighEnd: true
  }
};
