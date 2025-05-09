
// Extend the existing interface with our new fields
export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: Array<{
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: Array<{
      name: string;
      imageUrl?: string;
      specialty?: string;
      serviceType: ServiceCategory;
    }>;
  }>;
  totalCost: number;
  planType: 'best-fit' | 'high-impact' | 'progressive';
  timeFrame: string;
  
  // New fields for UI/UX enhancements
  expectedOutcomes?: Array<{
    milestone: string;
    timeframe: string;
    description: string;
  }>;
  
  rationales?: Array<{
    service: ServiceCategory;
    rationale: string;
    evidenceLevel: "high" | "medium" | "low";
  }>;
  
  progressTimeline?: Array<{
    week: number;
    milestone: string;
    focus: string;
  }>;
  
  alternativeOptions?: Array<{
    originalService: ServiceCategory;
    alternatives: ServiceCategory[];
    reason: string;
  }>;
}

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
