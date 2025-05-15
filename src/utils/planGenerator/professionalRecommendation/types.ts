
import { ServiceCategory } from "../types";

/**
 * Professional recommendation priority levels
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Options for customizing professional recommendations
 */
export interface ProfessionalRecommendationOptions {
  includeBudgetAllocation?: boolean;
  preferOnline?: boolean;
  maxRecommendations?: number;
  includeNotes?: boolean;
  considerUserHistory?: boolean;
}

/**
 * Represents a complete professional recommendation result
 */
export interface ProfessionalRecommendationResult {
  /** Primary recommended professionals */
  primaryRecommendations: ProfessionalRecommendation[];
  /** Complementary recommended professionals */
  complementaryRecommendations?: ProfessionalRecommendation[];
  /** Budget allocation if relevant */
  budgetAllocation?: {
    total: number;
    breakdown: Record<ServiceCategory, number>;
  };
  /** Recommendation notes */
  notes?: string[];
}

/**
 * Individual professional recommendation
 */
export interface ProfessionalRecommendation {
  /** Professional category */
  category: ServiceCategory;
  /** Recommended number of sessions */
  sessions: number;
  /** Recommendation priority level */
  priority?: PriorityLevel;
  /** Reasoning for recommendation */
  reasoning?: string;
}

/**
 * Category recommendation with computed scores
 */
export interface CategoryRecommendation {
  /** Professional category */
  category: ServiceCategory;
  /** Match score (0-1) */
  score: number;
  /** Importance value (0-1) */
  importance: number;
  /** Recommendation reasoning */
  reasoning?: string;
  /** Primary condition this addresses */
  primaryCondition?: string;
  /** Complementary categories */
  complementaryCategories?: ServiceCategory[];
}

/**
 * Results from health scenario detection
 */
export interface ScenarioResult {
  /** Scenario identification confidence */
  confidence: number;
  /** Main health issue identified */
  mainIssue: string;
  /** Specific recommendations for this scenario */
  recommendations: {
    /** Primary professional to consult */
    primaryProfessional: ServiceCategory;
    /** Secondary professional to consult (if needed) */
    secondaryProfessional?: ServiceCategory;
    /** Supporting professionals to complement treatment */
    supportingProfessionals: ServiceCategory[];
    /** Rationale for these recommendations */
    rationale: string;
  };
}

/**
 * Health issue analysis
 */
export interface HealthIssueAnalysis {
  /** Identified symptoms */
  symptoms: string[];
  /** Contraindicated services */
  contraindications: ServiceCategory[];
  /** User goals */
  goals: string[];
  /** Severity scores for symptoms */
  severityScores: Record<string, number>;
  /** Location information */
  locationInfo: {
    location: string;
    isRemote: boolean;
  };
  /** Whether user has budget constraint */
  hasBudgetConstraint: boolean;
  /** User's budget amount (if specified) */
  budget?: number;
}
