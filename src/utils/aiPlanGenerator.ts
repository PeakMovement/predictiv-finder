
import { generatePlan } from './planGenerator/planGenerator';
import { analyzeUserInput } from './planGenerator/inputAnalyzer';
import { findAlternativeCategories } from './planGenerator/categoryMatcher';
import { determineBudgetTier } from './planGenerator/budgetConfig';
import { AIHealthPlan } from '@/types';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  // Analyze the input to extract conditions and service categories
  const { medicalConditions, suggestedCategories } = analyzeUserInput(userQuery);
  
  // Create three plans at different budget tiers
  const plans: AIHealthPlan[] = [];
  
  const budgetTiers = [
    { name: 'low', budget: 800 },
    { name: 'medium', budget: 2000 },
    { name: 'high', budget: 4000 }
  ];
  
  budgetTiers.forEach(tier => {
    const budgetTierObj = determineBudgetTier(tier.budget);
    
    const plan = generatePlan({
      budget: tier.budget,
      medicalConditions,
      goal: extractGoal(userQuery),
      location: extractLocation(userQuery),
      preferOnline: userQuery.toLowerCase().includes('online'),
      budgetTier: budgetTierObj
    });
    
    // Add unique tier name to differentiate plans
    plan.name = `${tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} Budget: ${plan.name}`;
    
    plans.push(plan);
  });
  
  return plans;
};

// Extract goal from user input
const extractGoal = (input: string): string => {
  const goalPatterns = [
    /want to (.*?)(\.|\,|\;|\and)/i,
    /goal is to (.*?)(\.|\,|\;|\and)/i,
    /looking to (.*?)(\.|\,|\;|\and)/i,
    /need to (.*?)(\.|\,|\;|\and)/i,
    /help with (.*?)(\.|\,|\;|\and)/i,
  ];
  
  for (const pattern of goalPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'wellness';
};

// Extract location from user input
const extractLocation = (input: string): string | undefined => {
  const locationPatterns = [
    /in (.*?)(\.|,|;|\s and\s|\s)/i,
    /near (.*?)(\.|,|;|\s and\s|\s)/i,
    /around (.*?)(\.|,|;|\s and\s|\s)/i,
    /from (.*?)(\.|,|;|\s and\s|\s)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      // Filter out common words that might be misinterpreted as locations
      const location = match[1].trim();
      const ignoreWords = ['the', 'a', 'an', 'my', 'your', 'our', 'their', 'home', 'work'];
      if (!ignoreWords.includes(location.toLowerCase())) {
        return location;
      }
    }
  }
  
  return undefined;
};

export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
