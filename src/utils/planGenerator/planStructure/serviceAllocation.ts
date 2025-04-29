
export interface OptimizedService {
  type: string;
  cost: number;
  sessions: number;
  frequency?: string;
}

// Function to calculate optimal service allocation
export function calculateOptimalServiceAllocation(
  categories: string[],
  servicePriorities: Record<string, number>,
  budget: number,
  userType?: string,
  contextualFactors: string[] = []
): OptimizedService[] {
  // This is a simplified implementation - the actual function would be more complex
  // and would consider various factors to allocate services optimally
  return categories.map(category => {
    const priority = servicePriorities[category] || 0.5;
    const sessionCost = 400; // Default cost
    const sessions = Math.max(1, Math.floor((budget * priority) / categories.length / sessionCost));
    
    return {
      type: category,
      cost: sessions * sessionCost,
      sessions,
      frequency: sessions > 1 ? `${sessions}x per month` : 'Once'
    };
  });
}
