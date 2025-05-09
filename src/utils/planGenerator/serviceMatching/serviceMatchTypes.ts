
import { ServiceCategory } from "../types";

/**
 * Result from the service matching process
 */
export interface ServiceMatchResult {
  category: ServiceCategory;
  score: number;
  relevanceFactors: string[];
  primaryCondition?: string;
  complementaryCategories?: ServiceCategory[];
}

/**
 * Service match with detailed reasoning
 */
export interface ServiceMatch {
  score: number;
  factors: string[];
  primaryCondition?: string;
}

/**
 * Type for service match tracking
 */
export type ServiceMatchRecord = Record<ServiceCategory, ServiceMatch>;
