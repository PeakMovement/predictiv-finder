
import { ServiceCategory as AppServiceCategory, AIHealthPlan, Practitioner } from "@/types";

// Re-export the ServiceCategory from the app types
export type ServiceCategory = AppServiceCategory;

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
  maxSessions?: number;
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
  severity?: Record<string, number>;
  preferences?: Record<string, string>;
  specificGoals?: Record<string, any>;
  timeAvailability?: number;
}

export interface ServiceConfigurationByBudget {
  [key: string]: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}
