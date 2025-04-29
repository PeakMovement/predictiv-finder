
// Helper function to calculate budget tiers
export function calculateBudgetTiers(
  budget: number | undefined, 
  userQuery: string, 
  preferences: Record<string, string> = {},
  userType?: string,
  contextualFactors: string[] = []
): { name: string; budget: number }[] {
  const hasBudgetConstraint = 
    userQuery.toLowerCase().includes('tight budget') || 
    userQuery.toLowerCase().includes("can't afford") ||
    userQuery.toLowerCase().includes('affordable') ||
    preferences.budgetConstraint === 'tight' ||
    contextualFactors.includes('budget-sensitive');
  
  // Default tiers for South African market (in Rands)
  let budgetTiers = [
    { name: 'low', budget: 1000 },
    { name: 'medium', budget: 2500 },
    { name: 'high', budget: 5000 }
  ];
  
  // Adjust tiers based on user type
  if (userType === 'student') {
    budgetTiers = [
      { name: 'low', budget: 800 },
      { name: 'medium', budget: 1500 },
      { name: 'high', budget: 3000 }
    ];
  } else if (userType === 'premium') {
    budgetTiers = [
      { name: 'low', budget: 2000 },
      { name: 'medium', budget: 4000 },
      { name: 'high', budget: 8000 }
    ];
  }
  
  // If user specified a budget, create custom tiers around that budget
  if (budget) {
    // Check if it's an extremely low budget (less than R1000)
    if (budget < 1000) {
      // For very tight budgets, create reasonable tiers
      budgetTiers = [
        { name: 'low', budget: budget }, // Use their exact budget for low tier
        { name: 'medium', budget: budget * 2 }, // Double their budget
        { name: 'high', budget: budget * 3 } // Triple their budget
      ];
      
      console.log("Created extremely tight budget tiers based on user budget:", budgetTiers);
    } else {
      // Standard approach for normal budgets
      budgetTiers = [
        { name: 'low', budget: Math.max(500, budget) }, // Ensure minimum viable budget
        { name: 'medium', budget: Math.floor(budget * 1.5) },
        { name: 'high', budget: Math.floor(budget * 2.5) }
      ];
    }
  } else if (hasBudgetConstraint) {
    // Set lower budget tiers if constraints mentioned but no specific budget
    budgetTiers = [
      { name: 'low', budget: 800 },
      { name: 'medium', budget: 1600 },
      { name: 'high', budget: 3000 }
    ];
  }
  
  return budgetTiers;
}
