
import { ServiceCategory as AppServiceCategory, AIHealthPlan, Practitioner } from "@/types";

// Re-export the ServiceCategory from the app types
export type ServiceCategory = AppServiceCategory;

export interface BudgetTier {
  name: 'low' | 'medium' | 'high';
  range: {
    min: number;
    max: number;
  };
  maxSessions: number;
}

export interface ServiceAllocation {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
}

export interface PriceRange {
  affordable: number;
  highEnd: number;
}

export interface PlanContext {
  budget: number;
  location?: string;
  goal?: string;
  medicalConditions: string[];
  preferOnline?: boolean;
  budgetTier: BudgetTier;
  severity?: Record<string, number>;
  preferences?: Record<string, string>;
  specificGoals?: Record<string, any>;
  timeAvailability?: number;
  primaryIssue?: string;
  contextualFactors?: string[];
  contraindications?: ServiceCategory[];
  servicePriorities?: Record<ServiceCategory, number>;
  userType?: 'student' | 'working' | 'premium';
}

export interface ServiceConfigurationByBudget {
  [key: string]: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}

export interface FrequencyPreference {
  minFrequency: number; // sessions per week
  maxFrequency: number; // sessions per week
  totalSessions: number; // recommended total sessions
}

export interface ProfessionalServicePreference {
  [key: string]: FrequencyPreference;
}

export const DEFAULT_SERVICE_FREQUENCIES: Record<ServiceCategory, FrequencyPreference> = {
  'physiotherapist': { minFrequency: 1, maxFrequency: 2, totalSessions: 3 },
  'dietician': { minFrequency: 0.25, maxFrequency: 0.5, totalSessions: 2 }, // 1-2 sessions per month
  'personal-trainer': { minFrequency: 2, maxFrequency: 3, totalSessions: 8 },
  'coaching': { minFrequency: 1, maxFrequency: 1, totalSessions: 4 },
  'biokineticist': { minFrequency: 1, maxFrequency: 2, totalSessions: 3 },
  'family-medicine': { minFrequency: 0.25, maxFrequency: 0.5, totalSessions: 1 },
  'internal-medicine': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'cardiology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'dermatology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'orthopedics': { minFrequency: 0.25, maxFrequency: 0.5, totalSessions: 1 },
  'neurology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'gastroenterology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'obstetrics-gynecology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'emergency-medicine': { minFrequency: 0, maxFrequency: 0, totalSessions: 1 },
  'psychiatry': { minFrequency: 0.5, maxFrequency: 1, totalSessions: 3 },
  'anesthesiology': { minFrequency: 0, maxFrequency: 0, totalSessions: 1 },
  'endocrinology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'urology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'oncology': { minFrequency: 0.25, maxFrequency: 0.5, totalSessions: 2 },
  'neurosurgery': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'infectious-disease': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'radiology': { minFrequency: 0, maxFrequency: 0, totalSessions: 1 },
  'geriatric-medicine': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'plastic-surgery': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'rheumatology': { minFrequency: 0.25, maxFrequency: 0.25, totalSessions: 1 },
  'pain-management': { minFrequency: 0.5, maxFrequency: 1, totalSessions: 2 },
  'pediatrics': { minFrequency: 0.25, maxFrequency: 0.5, totalSessions: 1 }
};

// South African price ranges based on the image data
export const BASELINE_COSTS: Partial<Record<ServiceCategory, number>> = {
  'dietician': 500,
  'personal-trainer': 400,
  'physiotherapist': 600,
  'coaching': 400,
  'family-medicine': 500,
  'biokineticist': 600,
  'internal-medicine': 800,
  'pediatrics': 600,
  'cardiology': 900,
  'dermatology': 700,
  'orthopedics': 800,
  'neurology': 900,
  'gastroenterology': 700,
  'obstetrics-gynecology': 800,
  'emergency-medicine': 1500,
  'psychiatry': 900,
  'anesthesiology': 1200,
  'endocrinology': 800,
  'urology': 800,
  'oncology': 1000,
  'neurosurgery': 1800,
  'infectious-disease': 800,
  'radiology': 700,
  'geriatric-medicine': 700,
  'plastic-surgery': 1500,
  'rheumatology': 800,
  'pain-management': 700,
};

// Student discount percentages
export const STUDENT_DISCOUNT: Partial<Record<ServiceCategory, number>> = {
  'personal-trainer': 0.2, // 20% discount
  'dietician': 0.15,
  'coaching': 0.2,
  'physiotherapist': 0.1,
  'biokineticist': 0.1,
  'psychiatry': 0.1
};
