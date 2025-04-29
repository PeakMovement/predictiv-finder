
import { AIHealthPlan } from '@/types';
import { analyzeUserInput } from './inputAnalyzer';
import { findAlternativeCategories } from './categoryMatcher';
import { determineBudgetTier } from './budgetConfig';
import { generatePlan } from './planGenerator';
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
} from './enhancedInputAnalyzer';

import { 
  generatePlanName, 
  generatePlanDescription, 
  generateServiceDescription,
  determineTimeFrame,
  determinePlanType,
  calculateBudgetTiers
} from './planStructure';

import { calculateOptimalServiceAllocation } from './planStructure/serviceAllocation';
import { BASELINE_COSTS, STUDENT_DISCOUNT } from './types';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  console.log("Generating AI plans for query:", userQuery);
  
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
    specificGoals,
    primaryIssue,
    contextualFactors,
    servicePriorities,
    contraindicated,
    userType
  } = enhancedAnalyzeUserInput(userQuery);
  
  console.log("Enhanced analysis complete:", {
    medicalConditions,
    suggestedCategories,
    budget,
    location,
    preferOnline,
    severity,
    primaryIssue,
    contextualFactors,
    userType
  });
  
  // Ensure we have the right categories based on the analysis
  let categories = [...suggestedCategories];
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  const coMorbidityServices = checkCoMorbidities(medicalConditions);
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service) && !contraindicated?.includes(service)) {
      categories.push(service);
      console.log(`Added ${service} due to co-morbidity detection`);
    }
  });
  
  // Remove contraindicated services
  categories = categories.filter(cat => !contraindicated?.includes(cat));
  console.log("Final service categories after filtering:", categories);
  
  // Apply special case handling
  categories = handleSpecialCases(
    categories,
    medicalConditions,
    userQuery, 
    servicePriorities || {} as Record<string, number>,
    primaryIssue
  );
  
  // Calculate budget tiers based on user input and context
  const budgetTiers = calculateBudgetTiers(
    budget, 
    userQuery, 
    preferences || {}, 
    userType, 
    contextualFactors || []
  );
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Create plans for each budget tier
  const plans: AIHealthPlan[] = [];
  
  for (const tier of budgetTiers) {
    console.log(`\nGenerating plan for ${tier.name} tier (${tier.budget} ZAR)`);
    
    // Use our enhanced calculation for optimal service allocation
    const optimizedServices = calculateOptimalServiceAllocation(
      categories,
      servicePriorities || {} as Record<string, number>,
      tier.budget,
      userType,
      contextualFactors || []
    );
    
    console.log("Optimized services:", optimizedServices);
    
    // Generate notes
    const notes = generatePlanNotes(
      preferences || {},
      medicalConditions,
      severity || {},
      specificGoals || {},
      timeFrame,
      location,
      preferOnline,
      contextualFactors,
      primaryIssue,
      servicePriorities
    );
    
    // Create a customized description
    const hasKneePainAndRacePrep = hasKneePainAndRacePreparation(medicalConditions, userQuery);
    let description = generatePlanDescription(
      medicalConditions, 
      primaryIssue, 
      userType, 
      tier.name,
      hasKneePainAndRacePrep
    );
    
    // Add notes to description
    if (notes.length > 0) {
      description = `${description} ${notes.join(' ')}`;
    }
    
    // Create the final plan
    const plan: AIHealthPlan = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}-${tier.name}`,
      name: generatePlanName(tier.name, medicalConditions, primaryIssue, hasKneePainAndRacePrep),
      description,
      services: optimizedServices.map(service => ({
        type: service.type,
        price: Math.round(service.cost / service.sessions), // Price per session
        sessions: service.sessions,
        description: generateServiceDescription(
          service.type, 
          tier.name === 'high',
          service.frequency,
          primaryIssue,
          hasKneePainAndRacePrep
        ),
        recommendedPractitioners: [] // Will be populated by the planGenerator module
      })),
      totalCost: optimizedServices.reduce((sum, s) => sum + s.cost, 0),
      planType: determinePlanType(medicalConditions, primaryIssue, tier.name),
      timeFrame: timeFrame || determineTimeFrame(medicalConditions, userQuery, contextualFactors || [], hasKneePainAndRacePrep)
    };
    
    plans.push(plan);
  }
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
};

// Helper function to detect knee pain + race preparation special case
function hasKneePainAndRacePreparation(medicalConditions: string[], userQuery: string): boolean {
  const hasKneePain = medicalConditions.some(m => 
    m.toLowerCase().includes('knee') && m.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = userQuery.toLowerCase().includes('race') || 
                     userQuery.toLowerCase().includes('marathon') ||
                     userQuery.toLowerCase().includes('run') ||
                     medicalConditions.some(m => m.toLowerCase().includes('race'));
                     
  return hasKneePain && hasRacePrep;
}

// Helper function to handle special cases and adjust categories
function handleSpecialCases(
  categories: string[],
  medicalConditions: string[],
  userQuery: string,
  servicePriorities: Record<string, number>,
  primaryIssue?: string
): string[] {
  let updatedCategories = [...categories];
  
  // Special case handling for knee pain + race preparation
  const hasKneePain = medicalConditions.some(m => 
    m.toLowerCase().includes('knee') && m.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = userQuery.toLowerCase().includes('race') || 
                     userQuery.toLowerCase().includes('marathon') ||
                     userQuery.toLowerCase().includes('run') ||
                     medicalConditions.some(m => m.toLowerCase().includes('race'));
  
  if (hasKneePain && hasRacePrep) {
    console.log("Detected knee pain + race preparation special case");
    
    // Ensure coaching is included for race preparation
    if (!updatedCategories.includes('coaching')) {
      updatedCategories.push('coaching');
      console.log("Added coaching for race preparation");
    }
    
    // Ensure physiotherapy is included for knee pain
    if (!updatedCategories.includes('physiotherapist')) {
      updatedCategories.push('physiotherapist');
      console.log("Added physiotherapist for knee pain");
    }
    
    // Add to medical conditions if not already there
    if (!medicalConditions.includes('knee pain')) {
      medicalConditions.push('knee pain');
    }
    
    if (!medicalConditions.includes('race preparation')) {
      medicalConditions.push('race preparation');
    }
    
    // Adjust the service priorities
    servicePriorities['coaching'] = Math.max(servicePriorities['coaching'] || 0, 0.9);
    servicePriorities['physiotherapist'] = Math.max(servicePriorities['physiotherapist'] || 0, 0.9);
  }
  
  // Special case handling for anxiety + eating + race preparation
  if (userQuery.toLowerCase().includes('anxiety') && 
      userQuery.toLowerCase().includes('struggling to eat') && 
      (userQuery.toLowerCase().includes('race') || userQuery.toLowerCase().includes('run'))) {
    
    // Ensure dietician is included and prioritized
    if (!updatedCategories.includes('dietician')) {
      updatedCategories.push('dietician');
      console.log("Added dietician for anxiety + eating issues");
    }
    
    // Ensure personal trainer is included for race preparation
    if (!updatedCategories.includes('personal-trainer')) {
      updatedCategories.push('personal-trainer');
      console.log("Added personal-trainer for race preparation");
    }
    
    // Remove physiotherapist if present (unless there's a physical injury)
    if (updatedCategories.includes('physiotherapist') && 
        !userQuery.toLowerCase().includes('pain') && 
        !userQuery.toLowerCase().includes('injury')) {
      updatedCategories = updatedCategories.filter(c => c !== 'physiotherapist');
      console.log("Removed physiotherapist as not relevant to main issues");
    }
  }
  
  return updatedCategories;
}

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
