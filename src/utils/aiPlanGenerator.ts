
// Re-export everything from the CSV-based optimization approach only
export * from './planGenerator/aiPlanGenerator/index';

// Re-export the SessionAllocation type explicitly 
import type { ServiceAllocation } from './planGenerator/types';
export type { ServiceAllocation as AIGeneratorSessionAllocation };
