
import { generatePlan } from './planGenerator/planGenerator';
import { analyzeUserInput } from './planGenerator/inputAnalyzer';
import { findAlternativeCategories } from './planGenerator/categoryMatcher';
import { determineBudgetTier } from './planGenerator/budgetConfig';
import { AIHealthPlan } from '@/types';
import { enhancedAnalyzeUserInput, checkCoMorbidities, generatePlanNotes } from './planGenerator/enhancedInputAnalyzer';
import { CO_MORBIDITY_MAPPINGS } from './planGenerator/serviceMappings';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  // Use enhanced analysis to extract detailed information from user input
  const { 
    medicalConditions, 
    suggestedCategories, 
    budget,
    location,
    preferOnline,
    severity,
    preferences,
    timeAvailability,
    timeFrame,
    specificGoals
  } = enhancedAnalyzeUserInput(userQuery);
  
  console.log("Enhanced analysis results:", {
    medicalConditions,
    suggestedCategories,
    budget,
    location,
    preferOnline,
    severity,
    preferences,
    timeAvailability,
    timeFrame,
    specificGoals
  });
  
  // Ensure personal trainer is included for fitness/weight loss queries
  let categories = [...suggestedCategories];
  if (userQuery.toLowerCase().includes('weight') || 
      userQuery.toLowerCase().includes('tone') || 
      userQuery.toLowerCase().includes('kg') || 
      userQuery.toLowerCase().includes('train')) {
    if (!categories.includes('personal-trainer')) {
      categories.push('personal-trainer');
      console.log("Added personal-trainer based on fitness keywords");
    }
  }
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  // Check from our mappings first
  Object.values(CO_MORBIDITY_MAPPINGS).forEach(mapping => {
    const hasAllConditions = mapping.conditions.every(condition => 
      medicalConditions.includes(condition)
    );
    
    if (hasAllConditions) {
      mapping.additionalServices.forEach(service => {
        if (!categories.includes(service)) {
          categories.push(service);
          console.log(`Added ${service} due to co-morbidity of ${mapping.conditions.join(' + ')}`);
        }
      });
    }
  });
  
  // Also check with our helper function for any additional co-morbidities
  const coMorbidityServices = checkCoMorbidities(medicalConditions);
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service)) {
      categories.push(service);
    }
  });
  
  // Create plans, respecting user's budget if provided
  const plans: AIHealthPlan[] = [];
  
  // Dynamic budget tier calculation
  let budgetTiers = [
    { name: 'low', budget: 800 },
    { name: 'medium', budget: 2000 },
    { name: 'high', budget: 4000 }
  ];
  
  // If budget constraints are mentioned but no specific budget given, assume tight budget
  const hasBudgetConstraint = userQuery.toLowerCase().includes('tight budget') || 
                             userQuery.toLowerCase().includes("can't afford") ||
                             userQuery.toLowerCase().includes('affordable') ||
                             preferences.budgetConstraint === 'tight';
  
  // If user specified a budget, create custom tiers around that budget
  if (budget) {
    // Create a low tier at exactly the user's budget
    const userBudget = Math.max(400, budget); // Ensure minimum viable budget
    
    budgetTiers = [
      { name: 'low', budget: userBudget },
      { name: 'medium', budget: Math.floor(userBudget * 1.5) },
      { name: 'high', budget: Math.floor(userBudget * 2.5) }
    ];
  } else if (hasBudgetConstraint) {
    // Set lower budget tiers if constraints mentioned but no specific budget
    budgetTiers = [
      { name: 'low', budget: 600 },
      { name: 'medium', budget: 1200 },
      { name: 'high', budget: 2500 }
    ];
  }
  
  // Adjust tiers based on preferences (e.g., student discount)
  if (preferences.occupation === 'student') {
    budgetTiers = budgetTiers.map(tier => ({
      ...tier,
      budget: Math.floor(tier.budget * 0.8), // 20% discount for students
    }));
    console.log("Applied student discount to budget tiers");
  }
  
  // Generate plans for each budget tier
  budgetTiers.forEach(tier => {
    const budgetTierObj = determineBudgetTier(tier.budget);
    
    const goal = extractGoal(userQuery, specificGoals);
    console.log("Extracted goal:", goal);
    
    const extractedLocation = location || extractLocation(userQuery);
    console.log("Final location:", extractedLocation);
    
    // Generate the plan using our existing function but with enhanced context
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
    
    // Generate personalized notes
    const personalizedNotes = generatePlanNotes(
      preferences,
      medicalConditions,
      severity,
      specificGoals,
      timeFrame,
      extractedLocation,
      preferOnline
    );
    
    // Add notes to the plan description
    if (personalizedNotes.length > 0) {
      plan.description = `${plan.description} ${personalizedNotes.join(' ')}`;
    }
    
    plans.push(plan);
  });
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
};

// Extract goal from user input with enhanced specificity
const extractGoal = (input: string, specificGoals: Record<string, any> = {}): string => {
  // Handle weight loss with specific targets
  if (specificGoals.weightLoss) {
    const { amount, unit } = specificGoals.weightLoss;
    return `lose ${amount} ${unit}`;
  }
  
  // Special handling for weight loss and fitness
  if (input.toLowerCase().includes('lose weight') || 
      input.toLowerCase().includes('weight loss') || 
      input.toLowerCase().includes('kg')) {
    
    // Extract specific kg/pounds mentioned
    const weightMatch = input.match(/lose\s+(\d+)\s*(kg|pounds|lbs)/i);
    if (weightMatch) {
      const amount = weightMatch[1];
      const unit = weightMatch[2];
      return `lose ${amount} ${unit}`;
    }
    
    return 'lose weight';
  }
  
  if (input.toLowerCase().includes('tone') || input.toLowerCase().includes('toning')) {
    return 'tone up and improve fitness';
  }
  
  if (input.toLowerCase().includes('wedding')) {
    return 'get fit for wedding';
  }
  
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
