import { AIHealthPlan, ServiceCategory } from '@/types';
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
import { scoreProfessionals, buildOptimizedPlan } from './professionalScoring';
import { COMPLEXITY_INDICATORS } from './inputAnalyzer/keywordMappings';

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
    specificGoals || [],
    userQuery,
    servicePriorities || {}
  );
  
  console.log("Calculated complexity score:", complexityScore);
  
  // Ensure we have the right categories based on the analysis
  let categories = [...suggestedCategories];
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  const coMorbidityServices = checkCoMorbidities(medicalConditions);
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service as ServiceCategory) && !contraindicated?.includes(service as ServiceCategory)) {
      categories.push(service as ServiceCategory);
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
    
    // Use our new professional scoring system here
    // In a real implementation, you would get actual practitioners from your database
    // For now, we'll use a placeholder implementation that works with our current structure
    const practitioners = getMockPractitioners(categories, tier.budget);
    
    // Score the practitioners based on all our extracted data
    const scoredPractitioners = scoreProfessionals(
      practitioners,
      medicalConditions,
      specificGoals || [],
      tier.budget,
      timeFrame,
      categories,
      complexityScore
    );
    
    console.log("Top scored practitioners:", 
      scoredPractitioners.slice(0, 3).map(p => 
        `${p.practitioner.name} (${p.score.toFixed(2)})`
      )
    );
    
    // Build an optimized plan using our new system
    const optimizedPlan = buildOptimizedPlan(
      scoredPractitioners,
      tier.budget,
      timeFrame,
      complexityScore
    );
    
    // Use our enhanced calculation for optimal service allocation as fallback
    // if we don't have enough real practitioners
    let optimizedServices = [];
    if (optimizedPlan.professionals.length === 0) {
      optimizedServices = calculateOptimalServiceAllocation(
        categories,
        servicePriorities || {} as Record<string, number>,
        tier.budget,
        userType,
        contextualFactors || []
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
  categories: ServiceCategory[],
  medicalConditions: string[],
  userQuery: string,
  servicePriorities: Record<string, number>,
  primaryIssue?: string
): ServiceCategory[] {
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

/**
 * Calculate complexity score based on various factors
 * Returns a value between 0-5 where:
 * 0-1: Simple issue (single condition/goal)
 * 2-3: Moderate complexity (multiple related issues)
 * 4-5: Complex case (multiple chronic or interrelated conditions)
 */
function calculateComplexityScore(
  conditions: string[],
  goals: string[],
  userQuery: string,
  servicePriorities: Record<string, number>
): number {
  let score = 0;
  
  // Base score from number of conditions and goals
  score += Math.min(conditions.length * 0.8, 2.5); // Cap at 2.5
  score += Math.min(goals.length * 0.5, 1.5);      // Cap at 1.5
  
  // Check for complexity indicators in the query
  const complexityMatches = COMPLEXITY_INDICATORS.filter(indicator => 
    userQuery.toLowerCase().includes(indicator.toLowerCase())
  );
  
  score += complexityMatches.length * 0.5; // 0.5 points per complexity indicator
  
  // Check for chronic conditions
  const chronicConditions = conditions.filter(c => 
    c.toLowerCase().includes('chronic') || 
    c.toLowerCase().includes('recurring') ||
    c.toLowerCase().includes('persistent')
  );
  
  score += chronicConditions.length * 0.7; // 0.7 points per chronic condition
  
  // Check service diversity needed based on priorities
  const highPriorityServices = Object.entries(servicePriorities)
    .filter(([_, priority]) => priority > 0.7)
    .map(([service, _]) => service);
    
  // More diverse service needs = higher complexity
  score += Math.min(highPriorityServices.length * 0.4, 1.2);
  
  // Ensure score stays within 0-5 range
  return Math.max(0, Math.min(5, score));
}

// Placeholder function to get mock practitioners
// In a real implementation, this would query your database
function getMockPractitioners(categories: ServiceCategory[], budget: number) {
  // This would usually come from your database
  // Here we're creating mock practitioners for demonstration
  const practitioners = [];
  
  // Create 2-3 mock practitioners for each category
  categories.forEach(category => {
    const baseCost = getBaseCostForCategory(category);
    
    // Add a premium option
    practitioners.push({
      id: `${category}-premium-${Date.now()}`,
      name: `Premium ${category.replace('-', ' ')}`,
      serviceType: category,
      pricePerSession: Math.round(baseCost * 1.3), // 30% more expensive
      serviceTags: getMockTagsForCategory(category),
      location: "Johannesburg",
      isOnline: true,
      availability: "Weekdays",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Experienced premium ${category.replace('-', ' ')} specializing in advanced treatments and personalized care.`,
      rating: 4.8
    });
    
    // Add a standard option
    practitioners.push({
      id: `${category}-standard-${Date.now()}`,
      name: `Standard ${category.replace('-', ' ')}`,
      serviceType: category,
      pricePerSession: baseCost,
      serviceTags: getMockTagsForCategory(category),
      location: "Johannesburg",
      isOnline: Math.random() > 0.3, // 70% chance of online availability
      availability: "Weekdays and weekends",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Qualified ${category.replace('-', ' ')} with a balanced approach to client needs.`,
      rating: 4.5
    });
    
    // Add a budget option
    practitioners.push({
      id: `${category}-budget-${Date.now()}`,
      name: `Budget ${category.replace('-', ' ')}`,
      serviceType: category,
      pricePerSession: Math.round(baseCost * 0.7), // 30% cheaper
      serviceTags: getMockTagsForCategory(category),
      location: "Online",
      isOnline: true,
      availability: "Limited availability",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Affordable ${category.replace('-', ' ')} focused on providing value while maintaining quality care.`,
      rating: 4.2
    });
  });
  
  return practitioners;
}

// Helper function to get base cost for different categories
function getBaseCostForCategory(category: string): number {
  switch(category) {
    case 'personal-trainer': return 500;
    case 'dietician': return 600;
    case 'physiotherapist': return 700;
    case 'coaching': return 550;
    case 'biokineticist': return 650;
    case 'family-medicine': return 800;
    case 'psychiatry': return 1200;
    case 'cardiology': return 1500;
    case 'dermatology': return 1100;
    case 'gastroenterology': return 1300;
    case 'orthopedics': return 1400;
    case 'neurology': return 1600;
    default: return 800;
  }
}

// Helper function to get tags for different categories
function getMockTagsForCategory(category: string): string[] {
  switch(category) {
    case 'personal-trainer': 
      return ['strength training', 'weight loss', 'cardio', 'fitness'];
    case 'dietician': 
      return ['nutrition', 'weight management', 'meal planning', 'diet'];
    case 'physiotherapist': 
      return ['rehabilitation', 'pain management', 'sports injuries', 'recovery'];
    case 'coaching': 
      return ['motivation', 'habit formation', 'accountability', 'goals'];
    case 'biokineticist': 
      return ['movement', 'rehabilitation', 'performance', 'assessment'];
    case 'family-medicine': 
      return ['general health', 'preventative care', 'diagnosis', 'treatment'];
    case 'psychiatry': 
      return ['mental health', 'anxiety', 'depression', 'therapy'];
    default: 
      return ['healthcare', 'wellness', 'treatment', 'specialized care'];
  }
}

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
