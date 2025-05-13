
import { ServiceCategory } from "../types";

/**
 * Detailed recommendation for a professional service
 */
export interface ProfessionalRecommendation {
  /** Service category */
  category: ServiceCategory;
  /** Confidence score (0-1) */
  score: number;
  /** Primary condition being addressed */
  primaryCondition?: string;
  /** Ideal number of sessions */
  idealSessions: number;
  /** Estimated budget for all sessions */
  estimatedBudget: number;
  /** Recommended timing pattern */
  idealTiming: string;
  /** Condition severity (0-1) */
  severity: number;
  /** Notes about the recommendation */
  notes: string[];
  /** Preferred traits in a practitioner */
  preferredTraits: string[];
}

/**
 * Simplified category recommendation with basic scoring
 */
export interface CategoryRecommendation {
  /** Service category */
  category: ServiceCategory;
  /** Match score (0-1) */
  score: number;
  /** Primary condition addressed */
  primaryCondition?: string;
}

/**
 * Specialized recommendation for specific health scenarios
 */
export interface ScenarioRecommendation {
  /** Primary professional category */
  primaryProfessional: ServiceCategory;
  /** Optional secondary professional category */
  secondaryProfessional?: ServiceCategory;
  /** Supporting professional categories */
  supportingProfessionals: ServiceCategory[];
  /** Rationale for the recommendation */
  rationale: string;
}

/**
 * Result of a specialized health scenario analysis
 */
export interface ScenarioResult {
  /** Main health issue identified */
  mainIssue: string;
  /** Professional recommendations */
  recommendations: {
    primaryProfessional: ServiceCategory;
    secondaryProfessional?: ServiceCategory;
    supportingProfessionals: ServiceCategory[];
    rationale: string;
  };
}
