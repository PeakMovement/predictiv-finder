
import { ServiceConfigurationByBudget, ServiceCategory } from "./types";

export const CONDITION_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['dietician', 'personal-trainer', 'coaching'],
  'hypertension': ['cardiology', 'dietician', 'personal-trainer'],
  'diabetes': ['endocrinology', 'dietician', 'personal-trainer'],
  'asthma': ['internal-medicine', 'personal-trainer', 'dietician'],
  'ankle sprain': ['physiotherapist', 'personal-trainer'],
  'shoulder strain': ['physiotherapist', 'personal-trainer'],
  'chronic fatigue': ['endocrinology', 'dietician', 'personal-trainer'],
  'stomach issues': ['gastroenterology', 'family-medicine', 'dietician'],
  'knee pain': ['physiotherapist', 'personal-trainer'],
  'back pain': ['physiotherapist', 'personal-trainer']
};

export const SERVICE_CONFIGS_BY_BUDGET: ServiceConfigurationByBudget = {
  'low': {
    allocations: [
      { type: 'family-medicine', percentage: 50, priority: 1, minSessions: 1 },
      { type: 'gastroenterology', percentage: 50, priority: 1, minSessions: 1 },
      { type: 'dietician', percentage: 40, priority: 2 },
      { type: 'personal-trainer', percentage: 30, priority: 3 }
    ],
    requiresDoctor: true,
    preferHighEnd: false
  },
  'medium': {
    allocations: [
      { type: 'gastroenterology', percentage: 40, priority: 1, minSessions: 1 },
      { type: 'family-medicine', percentage: 30, priority: 1, minSessions: 1 },
      { type: 'dietician', percentage: 30, priority: 2, minSessions: 1 },
      { type: 'personal-trainer', percentage: 25, priority: 3 },
      { type: 'physiotherapist', percentage: 25, priority: 3 }
    ],
    requiresDoctor: true,
    preferHighEnd: true
  },
  'high': {
    allocations: [
      { type: 'gastroenterology', percentage: 35, priority: 1, minSessions: 1 },
      { type: 'family-medicine', percentage: 25, priority: 1, minSessions: 1 },
      { type: 'dietician', percentage: 20, priority: 2, minSessions: 1 },
      { type: 'personal-trainer', percentage: 10, priority: 3 },
      { type: 'physiotherapist', percentage: 10, priority: 3 }
    ],
    requiresDoctor: true,
    preferHighEnd: true
  }
};
