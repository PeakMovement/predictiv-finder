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

// Update price range structure to use min/max pattern consistently and include missing categories
export const SERVICE_PRICE_RANGES: Record<ServiceCategory, {min: number, max: number}> = {
  'dietician': {min: 400, max: 600},
  'personal-trainer': {min: 350, max: 500},
  'physiotherapist': {min: 450, max: 700},
  'coaching': {min: 400, max: 550},
  'family-medicine': {min: 400, max: 800},
  'biokineticist': {min: 450, max: 650},
  'internal-medicine': {min: 650, max: 900},
  'pediatrics': {min: 500, max: 750},
  'cardiology': {min: 800, max: 1200},
  'dermatology': {min: 600, max: 900},
  'orthopedics': {min: 700, max: 1000},
  'neurology': {min: 800, max: 1200},
  'gastroenterology': {min: 600, max: 1000},
  'obstetrics-gynecology': {min: 700, max: 900},
  'emergency-medicine': {min: 1200, max: 1500},
  'psychiatry': {min: 800, max: 1000},
  'anesthesiology': {min: 1000, max: 1300},
  'endocrinology': {min: 700, max: 950},
  'urology': {min: 700, max: 950},
  'oncology': {min: 900, max: 1200},
  'neurosurgery': {min: 1500, max: 2000},
  'infectious-disease': {min: 700, max: 950},
  'radiology': {min: 600, max: 800},
  'geriatric-medicine': {min: 600, max: 850},
  'plastic-surgery': {min: 1200, max: 1500},
  'rheumatology': {min: 700, max: 900},
  'pain-management': {min: 600, max: 800},
  'psychology': {min: 700, max: 900},
  'podiatrist': {min: 500, max: 700},
  'general-practitioner': {min: 400, max: 700},
  'sport-physician': {min: 700, max: 1000},
  'orthopedic-surgeon': {min: 1000, max: 1800},
  'massage-therapy': {min: 350, max: 600},
  'nutrition-coaching': {min: 300, max: 500},
  'occupational-therapy': {min: 500, max: 750},
  'physical-therapy': {min: 500, max: 800},
  'chiropractor': {min: 400, max: 650},
  'nurse-practitioner': {min: 350, max: 550},
  'sports-medicine': {min: 600, max: 900},
  'geriatrics': {min: 550, max: 800},
  'strength-coaching': {min: 500, max: 700},
  'run-coaching': {min: 500, max: 700},
  'all': {min: 500, max: 800}
};
