
import { ServiceCategory } from '../types';

export interface ServiceMatchRecord {
  [key: string]: {
    score: number;
    factors: string[];
    primaryCondition?: string;
  };
}

export interface ServiceMatchResult {
  category: ServiceCategory;
  score: number;
  relevanceFactors: string[];
  primaryCondition?: string;
  complementaryCategories?: ServiceCategory[];
  reasoning?: string;
}

export interface ServiceMatchOptions {
  includeComplementary?: boolean;
  prioritizeDirectMatch?: boolean;
  preferRemote?: boolean;
  budgetSensitive?: boolean;
  maxResults?: number;
}

