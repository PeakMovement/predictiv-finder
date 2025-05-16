// Re-export types from the main index.d.ts file
export * from './index.d';

// Export common project-specific types
export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: Array<{
    type: string;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: any[];
    frequency?: string;
  }>;
  totalCost: number;
  planType: string;
  timeFrame: string;
  
  // Optional enhanced properties
  expectedOutcomes?: Array<{
    milestone: string;
    timeframe: string;
    description: string;
  }>;
  
  rationales?: Array<{
    service: string;
    rationale: string;
    evidenceLevel: "high" | "medium" | "low";
  }>;
  
  progressTimeline?: Array<{
    week: number;
    milestone: string;
    focus: string;
  }>;
  
  alternativeOptions?: Array<{
    originalService: string;
    alternatives: string[];
    reason: string;
  }>;
}

export type ServiceCategory = 
  | 'family-medicine'
  | 'physiotherapist'
  | 'dietician'
  | 'personal-trainer'
  | 'biokineticist'
  | 'psychiatry'
  | 'orthopedics'
  | 'gastroenterology'
  | 'neurology'
  | 'cardiology'
  | 'dermatology'
  | 'rheumatology'
  | 'coaching'
  | 'nutrition-coaching'
  | 'strength-coaching'
  | 'run-coaches'
  | 'pain-management';

export interface UserCriteria {
  conditions?: string[];
  goal?: string;
  secondaryGoals?: string[];
  budget?: {
    monthly: number;
    preferredSetup: 'monthly' | 'pay-as-you-go' | 'package';
    flexibleBudget: boolean;
  };
  categories?: ServiceCategory[];
  location?: string;
  preferOnline?: boolean;
  preferredGender?: 'male' | 'female' | 'no-preference';
  isUrgent?: boolean;
  priorities?: Record<string, number>;
  availabilityConstraints?: string[];
}
