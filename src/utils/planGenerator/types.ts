
// Define the ServiceCategory type
export type ServiceCategory =
  | 'physiotherapist'
  | 'biokineticist'
  | 'dietician'
  | 'personal-trainer'
  | 'psychology'
  | 'coaching'
  | 'psychiatry'
  | 'general-practitioner'
  | 'family-medicine'
  | 'cardiology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'neurology'
  | 'orthopedic-surgeon'
  | 'rheumatology'
  | 'sports-medicine'
  | 'dermatology'
  | 'gynecology'
  | 'ophthalmology'
  | 'pain-management'
  | 'podiatrist'
  | 'occupational-therapy'
  | 'speech-therapy'
  | 'audiology'
  | 'nutrition-coaching'
  | 'chiropractor'
  | 'massage-therapy'
  | 'acupuncture'
  | 'yoga-instructor'
  | 'pilates-instructor'
  | 'tai-chi-instructor'
  | 'naturopathy'
  | 'homeopathy'
  | 'osteopathy'
  | 'pharmacy'
  | 'medical-specialist'
  | 'pediatrics'
  | 'geriatrics'
  | 'physical-therapy'
  | 'strength-coaching'
  | 'run-coaching';

// Define the ServiceAllocation interface
export interface ServiceAllocation {
  count: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  costPerSession?: number;
  totalCost?: number;
  sessions?: number;
}

// Define the ComorbidityGroup interface
export interface ComorbidityGroup {
  name: string;
  conditions: string[];
  recommendedServices: ServiceCategory[];
  specialConsiderations: string[];
}

// Define the SpecialPopulation interface
export interface SpecialPopulation {
  type: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic';
  ageRange?: [number, number]; // Min and max age
  recommendedServices: ServiceCategory[];
  contraindicatedServices?: ServiceCategory[];
  specializedProviders: ServiceCategory[];
}

// Define the UserPreference interface
export interface UserPreference {
  preferredServiceTypes?: ServiceCategory[];
  avoidServiceTypes?: ServiceCategory[];
  previouslyUsedServices?: Array<{
    serviceType: ServiceCategory;
    outcome: 'positive' | 'negative' | 'neutral';
    usageCount: number;
  }>;
  preferredSessionFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  budgetConstraint?: number;
}
