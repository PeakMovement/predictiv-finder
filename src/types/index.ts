
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
  }>;
  totalCost: number;
  planType: string;
  timeFrame: string;
}
