
// Additional types needed for the recommendation system
export interface ProfessionalRecommendationOptions {
  budget?: number;
  preferOnline?: boolean;
  location?: string;
  timeframe?: number;
  includeComplementary?: boolean;
}

export interface ProfessionalRecommendationResult {
  primaryRecommendations: Array<{
    category: string;
    sessions: number;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
  complementaryRecommendations?: Array<{
    category: string;
    sessions: number;
    reasoning: string;
  }>;
  budgetAllocation?: {
    total: number;
    breakdown: Record<string, number>;
  };
  notes?: string[];
}

// Additional types needed by the recommendation generator
export interface ProfessionalRecommendation {
  category: string;
  score: number;
  primaryCondition?: string;
  idealSessions: number;
  estimatedBudget: number;
  idealTiming: string;
  severity: number;
  notes: string[];
  preferredTraits: string[];
}

export interface CategoryRecommendation {
  category: string;
  score: number;
  primaryCondition?: string;
}
