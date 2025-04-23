
import { generatePlan } from './planGenerator/planGenerator';
import { analyzeUserInput } from './planGenerator/inputAnalyzer';
import { findAlternativeCategories } from './planGenerator/categoryMatcher';
import { determineBudgetTier } from './planGenerator/budgetConfig';
import { AIHealthPlan } from '@/types';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  // Analyze the input to extract conditions, service categories, budget and location
  const { 
    medicalConditions, 
    suggestedCategories, 
    budget,
    location,
    preferOnline 
  } = analyzeUserInput(userQuery);
  
  console.log("Analysis results:", {
    medicalConditions,
    suggestedCategories,
    budget,
    location,
    preferOnline
  });
  
  // Create plans, respecting user's budget if provided
  const plans: AIHealthPlan[] = [];
  
  let budgetTiers = [
    { name: 'low', budget: 800 },
    { name: 'medium', budget: 2000 },
    { name: 'high', budget: 4000 }
  ];
  
  // If user specified a budget, create custom tiers around that budget
  if (budget) {
    // Create a low tier at exactly the user's budget
    const userBudget = Math.max(400, budget); // Ensure minimum viable budget
    
    budgetTiers = [
      { name: 'low', budget: userBudget },
      { name: 'medium', budget: Math.floor(userBudget * 1.5) },
      { name: 'high', budget: Math.floor(userBudget * 2.5) }
    ];
  }
  
  budgetTiers.forEach(tier => {
    const budgetTierObj = determineBudgetTier(tier.budget);
    
    const goal = extractGoal(userQuery);
    console.log("Extracted goal:", goal);
    
    const extractedLocation = location || extractLocation(userQuery);
    console.log("Final location:", extractedLocation);
    
    const plan = generatePlan({
      budget: tier.budget,
      medicalConditions,
      goal,
      location: extractedLocation,
      preferOnline: preferOnline !== undefined ? preferOnline : userQuery.toLowerCase().includes('online'),
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
    /want to (.*?)(\.|\,|\;|\and|\s|$)/i,
    /goal is to (.*?)(\.|\,|\;|\and|\s|$)/i,
    /looking to (.*?)(\.|\,|\;|\and|\s|$)/i,
    /need to (.*?)(\.|\,|\;|\and|\s|$)/i,
    /help with (.*?)(\.|\,|\;|\and|\s|$)/i,
    /struggling with (.*?)(\.|\,|\;|\and|\s|$)/i,
    /improve (.*?)(\.|\,|\;|\and|\s|$)/i,
    /manage (.*?)(\.|\,|\;|\and|\s|$)/i,
    /treat (.*?)(\.|\,|\;|\and|\s|$)/i,
  ];
  
  for (const pattern of goalPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no explicit goal found, check for key medical conditions
  const medicalKeywords = ['pain', 'ache', 'issue', 'problem', 'condition', 'symptoms', 'discomfort', 'difficulties'];
  for (const keyword of medicalKeywords) {
    const medicalPattern = new RegExp(`(?:my|the|with)\\s+(.*?)\\s+${keyword}s?`, 'i');
    const match = input.match(medicalPattern);
    if (match && match[1]) {
      return `manage ${match[1]} ${keyword}`;
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
