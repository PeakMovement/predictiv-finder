
// Re-export types from the main index.d.ts file
export * from './index.d';

// Import ServiceCategory from planGenerator/types to use the same definition
// This ensures we use a single consistent definition across the app
import { ServiceCategory } from "../utils/planGenerator/types";
export type { ServiceCategory };

// Export common project-specific types
export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: Array<{
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: any[];
    frequency?: string;
  }>;
  totalCost: number;
  planType: 'best-fit' | 'high-impact' | 'progressive';
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
  
  // Add missing fields that are being accessed elsewhere
  recommendedServices?: ServiceCategory[];
  serviceDescriptions?: any[];
  suggestedProfessionals?: any[];
  matchScore?: number;
  goal?: string;
  primaryFocus?: string;
  complexity?: number;
  intensity?: string;
  expectedDuration?: string;
}

export interface UserCriteria {
  conditions?: string[];
  goal?: string;
  secondaryGoals?: string[];
  budget?: {
    monthly: number;
    preferredSetup: 'monthly' | 'pay-as-you-go' | 'package' | 'not-sure' | 'once-off';
    flexibleBudget: boolean;
  };
  categories?: ServiceCategory[];
  location?: string;
  preferOnline?: boolean;
  preferredGender?: 'male' | 'female' | 'no-preference';
  isUrgent?: boolean;
  priorities?: Record<string, number>;
  availabilityConstraints?: string[];
  
  // Add the missing properties being accessed
  locationRadius?: 'exact' | 'nearby' | 'anywhere';
  mode?: string[];
}
