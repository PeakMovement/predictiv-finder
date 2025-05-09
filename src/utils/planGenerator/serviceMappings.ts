
import { ServiceCategory, ServiceConfigurationByBudget } from "./types";

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
  'knee pain': ['physiotherapist', 'orthopedics', 'biokineticist'],
  'back pain': ['physiotherapist', 'orthopedics', 'biokineticist'],
  'mental health': ['psychiatry', 'coaching'],
  'anxiety': ['psychiatry', 'coaching'],
  'depression': ['psychiatry', 'coaching'],
  'stress': ['psychiatry', 'coaching'],
  'respiratory issues': ['internal-medicine', 'family-medicine'],
  'joint pain': ['physiotherapist', 'biokineticist', 'orthopedics'],
  // New conditions
  'vegan diet': ['dietician', 'coaching'],
  'vegetarian diet': ['dietician', 'coaching'],
  'student': ['personal-trainer', 'coaching'],
  'professional': ['personal-trainer', 'coaching'],
  'busy schedule': ['personal-trainer', 'coaching'],
  'wedding preparation': ['personal-trainer', 'dietician', 'coaching']
};

// Co-morbidity mappings - conditions that when occurring together need additional services
export const CO_MORBIDITY_MAPPINGS: Record<string, {conditions: string[], additionalServices: ServiceCategory[]}> = {
  'cardiometabolic': {
    conditions: ['diabetes', 'hypertension'],
    additionalServices: ['cardiology', 'endocrinology']
  },
  'psychosomatic': {
    conditions: ['back pain', 'stress'],
    additionalServices: ['psychiatry', 'physiotherapist']
  },
  'metabolic syndrome': {
    conditions: ['weight loss', 'hypertension', 'diabetes'],
    additionalServices: ['endocrinology', 'cardiology', 'dietician']
  }
};

export const SERVICE_CONFIGS_BY_BUDGET: ServiceConfigurationByBudget = {
  'low': {
    allocations: [
      { type: 'personal-trainer', percentage: 50, priority: 1, minSessions: 1, maxSessions: 4 },
      { type: 'dietician', percentage: 40, priority: 2, minSessions: 1, maxSessions: 2 },
      { type: 'coaching', percentage: 30, priority: 3, maxSessions: 2 },
      { type: 'family-medicine', percentage: 25, priority: 4, maxSessions: 1 },
      { type: 'gastroenterology', percentage: 25, priority: 4, maxSessions: 1 },
      { type: 'physiotherapist', percentage: 35, priority: 2, minSessions: 1, maxSessions: 3 },
      { type: 'psychiatry', percentage: 30, priority: 3, maxSessions: 2 },
      { type: 'cardiology', percentage: 25, priority: 4, maxSessions: 1 },
      { type: 'endocrinology', percentage: 25, priority: 4, maxSessions: 1 }
    ],
    requiresDoctor: false,
    preferHighEnd: false
  },
  'medium': {
    allocations: [
      { type: 'personal-trainer', percentage: 40, priority: 1, minSessions: 2, maxSessions: 6 },
      { type: 'dietician', percentage: 30, priority: 2, minSessions: 1, maxSessions: 3 },
      { type: 'coaching', percentage: 25, priority: 3, minSessions: 1, maxSessions: 3 },
      { type: 'gastroenterology', percentage: 20, priority: 4, maxSessions: 2 },
      { type: 'family-medicine', percentage: 20, priority: 4, maxSessions: 2 },
      { type: 'physiotherapist', percentage: 25, priority: 3, minSessions: 1, maxSessions: 4 },
      { type: 'psychiatry', percentage: 25, priority: 3, minSessions: 1, maxSessions: 3 },
      { type: 'cardiology', percentage: 20, priority: 4, maxSessions: 2 },
      { type: 'endocrinology', percentage: 20, priority: 4, maxSessions: 2 }
    ],
    requiresDoctor: false,
    preferHighEnd: true
  },
  'high': {
    allocations: [
      { type: 'personal-trainer', percentage: 35, priority: 1, minSessions: 4, maxSessions: 8 },
      { type: 'dietician', percentage: 25, priority: 2, minSessions: 2, maxSessions: 4 },
      { type: 'coaching', percentage: 20, priority: 3, minSessions: 1, maxSessions: 4 },
      { type: 'gastroenterology', percentage: 15, priority: 4, minSessions: 1, maxSessions: 3 },
      { type: 'family-medicine', percentage: 15, priority: 4, minSessions: 1, maxSessions: 3 },
      { type: 'physiotherapist', percentage: 20, priority: 3, minSessions: 2, maxSessions: 6 },
      { type: 'psychiatry', percentage: 20, priority: 3, minSessions: 1, maxSessions: 4 },
      { type: 'cardiology', percentage: 15, priority: 4, minSessions: 1, maxSessions: 3 },
      { type: 'endocrinology', percentage: 15, priority: 4, minSessions: 1, maxSessions: 3 }
    ],
    requiresDoctor: false,
    preferHighEnd: true
  }
};

// Session cost ranges for different service types
export const SERVICE_PRICE_RANGES: Record<ServiceCategory, {affordable: number, highEnd: number}> = {
  'dietician': {affordable: 400, highEnd: 600},
  'personal-trainer': {affordable: 350, highEnd: 500},
  'physiotherapist': {affordable: 450, highEnd: 700},
  'coaching': {affordable: 400, highEnd: 550},
  'family-medicine': {affordable: 400, highEnd: 800},
  'biokineticist': {affordable: 450, highEnd: 650},
  'internal-medicine': {affordable: 650, highEnd: 900},
  'pediatrics': {affordable: 500, highEnd: 750},
  'cardiology': {affordable: 800, highEnd: 1200},
  'dermatology': {affordable: 600, highEnd: 900},
  'orthopedics': {affordable: 700, highEnd: 1000},
  'neurology': {affordable: 800, highEnd: 1200},
  'gastroenterology': {affordable: 600, highEnd: 1000},
  'obstetrics-gynecology': {affordable: 700, highEnd: 900},
  'emergency-medicine': {affordable: 1200, highEnd: 1500},
  'psychiatry': {affordable: 800, highEnd: 1000},
  'anesthesiology': {affordable: 1000, highEnd: 1300},
  'endocrinology': {affordable: 700, highEnd: 950},
  'urology': {affordable: 700, highEnd: 950},
  'oncology': {affordable: 900, highEnd: 1200},
  'neurosurgery': {affordable: 1500, highEnd: 2000},
  'infectious-disease': {affordable: 700, highEnd: 950},
  'radiology': {affordable: 600, highEnd: 800},
  'geriatric-medicine': {affordable: 600, highEnd: 850},
  'plastic-surgery': {affordable: 1200, highEnd: 1500},
  'rheumatology': {affordable: 700, highEnd: 900},
  'pain-management': {affordable: 600, highEnd: 800},
  'psychology': {affordable: 700, highEnd: 900},
  'podiatrist': {affordable: 500, highEnd: 700},
  'general-practitioner': {affordable: 400, highEnd: 700},
  'sport-physician': {affordable: 700, highEnd: 1000},
  'orthopedic-surgeon': {affordable: 1000, highEnd: 1800},
  'massage-therapy': {affordable: 350, highEnd: 600},
  'nutrition-coach': {affordable: 300, highEnd: 500},
  'occupational-therapy': {affordable: 500, highEnd: 750},
  'physical-therapy': {affordable: 500, highEnd: 800},
  'chiropractor': {affordable: 400, highEnd: 650},
  'nurse-practitioner': {affordable: 350, highEnd: 550},
  'sports-medicine': {affordable: 600, highEnd: 900},
  'geriatrics': {affordable: 550, highEnd: 800},
  'all': {affordable: 500, highEnd: 800}
};
