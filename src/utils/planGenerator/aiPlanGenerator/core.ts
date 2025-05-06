
import { AIHealthPlan, ServiceCategory } from '@/types';
import { analyzeUserInput } from '../inputAnalyzer';
import { findAlternativeCategories } from '../categoryMatcher';
import { determineBudgetTier } from '../budgetConfig';
import { generatePlan } from '../planGenerator';
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
} from '../enhancedInputAnalyzer';

import { 
  generatePlanName, 
  generatePlanDescription, 
  generateServiceDescription,
  determineTimeFrame,
  determinePlanType,
  calculateBudgetTiers
} from '../planStructure';

import { calculateOptimalServiceAllocation } from '../planStructure/serviceAllocation';
import { BASELINE_COSTS, STUDENT_DISCOUNT } from '../types';
import { 
  scoreProfessionals, 
  buildOptimizedPlan, 
  isComplexCase 
} from '../professionalScoring';
import { COMPLEXITY_INDICATORS } from '../inputAnalyzer/keywordMappings';
import { calculateComplexityScore, hasKneePainAndRacePreparation, handleSpecialCases } from './complexity';
import { getMockPractitioners } from './mockData';

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
  
  // Calculate complexity score based on conditions, goals, and complexity indicators
  const complexityScore = calculateComplexityScore(
    medicalConditions,
    specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
    userQuery,
    servicePriorities ? servicePriorities : {}
  );
  
  console.log("Calculated complexity score:", complexityScore);
  
  // Determine if this is a complex case requiring multiple professionals
  const needsMultidisciplinary = isComplexCase(
    medicalConditions, 
    specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
    userQuery
  );
  
  console.log("Needs multidisciplinary approach:", needsMultidisciplinary);
  
  // Ensure we have the right categories based on the analysis
  let categories = [...suggestedCategories];
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  const coMorbidityServices = checkCoMorbidities(medicalConditions);
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service as ServiceCategory) && 
        contraindicated && !contraindicated.includes(service as ServiceCategory)) {
      categories.push(service as ServiceCategory);
      console.log(`Added ${service} due to co-morbidity detection`);
    }
  });
  
  // Remove contraindicated services
  if (contraindicated) {
    categories = categories.filter(cat => !contraindicated.includes(cat));
  }
  console.log("Final service categories after filtering:", categories);
  
  // Apply special case handling
  categories = handleSpecialCases(
    categories,
    medicalConditions,
    userQuery, 
    servicePriorities ? servicePriorities : {},
    primaryIssue
  );
  
  // Calculate budget tiers based on user input and context
  const budgetTiers = calculateBudgetTiers(
    budget, 
    userQuery, 
    preferences ? preferences : {}, 
    userType, 
    contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : []
  );
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Create plans for each budget tier
  const plans: AIHealthPlan[] = [];
  
  for (const tier of budgetTiers) {
    console.log(`\nGenerating plan for ${tier.name} tier (${tier.budget} ZAR)`);
    
    // Use our new professional scoring system here
    // In a real implementation, you would get actual practitioners from your database
    // For now, we'll use a placeholder implementation that works with our current structure
    const practitioners = getMockPractitioners(categories, tier.budget);
    
    // Score the practitioners based on all our extracted data
    const scoredPractitioners = scoreProfessionals(
      practitioners,
      medicalConditions,
      specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
      tier.budget,
      timeFrame,
      categories,
      complexityScore,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      preferences
    );
    
    console.log("Top scored practitioners:", 
      scoredPractitioners.slice(0, 3).map(p => 
        `${p.practitioner.name} (${p.score.toFixed(2)})`
      )
    );
    
    // Build an optimized plan using our enhanced system
    const optimizedPlan = buildOptimizedPlan(
      scoredPractitioners,
      tier.budget,
      timeFrame,
      complexityScore,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      preferences
    );
    
    // Use our enhanced calculation for optimal service allocation as fallback
    // if we don't have enough real practitioners
    let optimizedServices = [];
    if (optimizedPlan.professionals.length === 0) {
      optimizedServices = calculateOptimalServiceAllocation(
        categories,
        servicePriorities ? servicePriorities : {},
        tier.budget,
        userType,
        contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : []
      );
    } else {
      // Convert our professional-based plan to the service format needed
      optimizedServices = optimizedPlan.professionals.map(pro => ({
        type: pro.serviceType,
        cost: pro.pricePerSession * 4, // Assume 4 sessions for simplicity
        sessions: 4,
        frequency: "Weekly"
      }));
    }
    
    console.log("Optimized services:", optimizedServices);
    
    // Generate notes with more personalization
    const notes = generatePlanNotes(
      preferences ? preferences : {},
      medicalConditions,
      severity ? severity : {},
      specificGoals ? (Array.isArray(specificGoals) ? specificGoals : {}) : {},
      timeFrame,
      location,
      preferOnline,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      primaryIssue,
      servicePriorities
    );
    
    // Add explanations from our professional scoring if available
    if (optimizedPlan.explanations.length > 0) {
      notes.push(...optimizedPlan.explanations);
    }
    
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
        type: service.type as ServiceCategory,
        price: Math.round(service.cost / service.sessions), // Price per session
        sessions: service.sessions,
        description: generateServiceDescription(
          service.type, 
          tier.name === 'high',
          service.frequency,
          primaryIssue,
          hasKneePainAndRacePrep
        ),
        recommendedPractitioners: optimizedPlan.professionals.filter(p => 
          p.serviceType === service.type
        ) // Add recommended practitioners if available
      })),
      totalCost: optimizedServices.reduce((sum, s) => sum + s.cost, 0),
      planType: determinePlanType(medicalConditions, primaryIssue, tier.name),
      timeFrame: timeFrame || determineTimeFrame(medicalConditions, userQuery, contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [], hasKneePainAndRacePrep)
    };
    
    plans.push(plan);
  }
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
};

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
