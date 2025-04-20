
import { ServiceCategory, AIHealthPlan, Practitioner } from "@/types";

export interface BudgetTier {
  name: 'low' | 'medium' | 'high';
  range: {
    min: number;
    max: number;
  };
  maxSessions: number;
}

export interface ServiceAllocation {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
}

export interface PriceRange {
  affordable: number;
  highEnd: number;
}

export interface PlanContext {
  budget: number;
  location?: string;
  goal?: string;
  medicalConditions: string[];
  preferOnline?: boolean;
  budgetTier: BudgetTier;
}

export interface ServiceConfigurationByBudget {
  [key: string]: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}
