
// Re-export all functionality from sub-modules
export * from './types';
export * from './errorHandling';
export * from './professionalScoring';
export * from './planStructure';
export * from './sessionCalculator';
export * from './serviceMappings';
export * from './locationFilter';
export * from './aiPlanGenerator';
export * from './enhancedInputAnalyzer';

// Re-export from budgetConfig, but explicitly to avoid ambiguity
import { 
  getBudgetTiers,
  calculateBudgetRange,
  inferBudgetFromInput 
} from './budgetConfig';

export { 
  getBudgetTiers,
  calculateBudgetRange,
  inferBudgetFromInput
};

// Re-export custom determineBudgetTier from enhancedBudgetOptimizer
export { determineBudgetTier } from './budgetHandling/enhancedBudgetOptimizer';

// Re-export type definitions explicitly to avoid ambiguity
export type { 
  ServiceCategory, 
  TreatmentModality,
  ServiceAllocation,
  PlanContext,
  ServiceAllocationItem,
  BudgetTier
} from './types';
export { BASELINE_COSTS } from './types';
