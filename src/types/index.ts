
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
