
export type ServiceCategory =
  | 'physiotherapist'
  | 'biokineticist'
  | 'dietician'
  | 'personal-trainer'
  | 'pain-management'
  | 'coaching'
  | 'psychology'
  | 'psychiatry'
  | 'podiatrist'
  | 'general-practitioner'
  | 'sport-physician'
  | 'orthopedic-surgeon'
  | 'family-medicine'
  | 'gastroenterology'
  | 'massage-therapy'
  | 'nutrition-coach'
  | 'occupational-therapy'
  | 'physical-therapy'
  | 'chiropractor'
  | 'nurse-practitioner';

export interface BaseCosts {
  [key: string]: number;
}

export const BASELINE_COSTS: Record<ServiceCategory, number> = {
  'physiotherapist': 850,
  'biokineticist': 700,
  'dietician': 650,
  'personal-trainer': 550,
  'pain-management': 900,
  'coaching': 600,
  'psychology': 1200,
  'psychiatry': 1500,
  'podiatrist': 750,
  'general-practitioner': 800,
  'sport-physician': 1200,
  'orthopedic-surgeon': 2000,
  'family-medicine': 750,
  'gastroenterology': 1400,
  'massage-therapy': 500,
  'nutrition-coach': 550,
  'occupational-therapy': 700,
  'physical-therapy': 800,
  'chiropractor': 650,
  'nurse-practitioner': 600,
};

export interface OptimizedService {
  type: ServiceCategory;
  sessions: number;
  cost: number;
  frequency: string;
  costPerSession: number;
  totalCost: number;
}
