
import { AIHealthPlan, ServiceCategory } from '@/types';
import { handleSpecialCases, hasKneePainAndRacePreparation } from './complexity';
import { generatePlanNotes } from '../enhancedInputAnalyzer';
import { 
  generatePlanName, 
  generatePlanDescription, 
  generateServiceDescription,
  determineTimeFrame,
  determinePlanType,
} from '../planStructure';
import { getMockPractitioners } from './mockData';
import { scoreProfessionals, buildOptimizedPlan } from '../professionalScoring';
import { calculateOptimalServiceAllocation } from '../planStructure/serviceAllocation';

/**
 * Generates custom AI health plans based on the analyzed user data
 * 
 * @param userQuery Original user input text
 * @param analysis Analyzed user data with extracted information
 * @param categories Service categories to include in the plan
 * @param complexityScore Calculated complexity score
 * @param budgetTiers Array of budget tiers to generate plans for
 * @returns Array of generated health plans
 */
export function buildHealthPlans(
  userQuery: string,
  analysis: any,
  categories: ServiceCategory[],
  complexityScore: number,
  budgetTiers: Array<{name: string, budget: number}>
): AIHealthPlan[] {
  const plans: AIHealthPlan[] = [];
  
  // Handle special case detection
  const hasKneePainAndRacePrep = hasKneePainAndRacePreparation(
    analysis.medicalConditions, 
    userQuery
  );
  
  for (const tier of budgetTiers) {
    console.log(`\nGenerating plan for ${tier.name} tier (${tier.budget} ZAR)`);
    
    // Build the plan using either practitioner-based or service-based approach
    const plan = buildPlanForTier(
      tier,
      userQuery,
      analysis,
      categories,
      complexityScore,
      hasKneePainAndRacePrep
    );
    
    plans.push(plan);
  }
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
}

/**
 * Builds a health plan for a specific budget tier
 */
function buildPlanForTier(
  tier: {name: string, budget: number},
  userQuery: string,
  analysis: any,
  categories: ServiceCategory[],
  complexityScore: number,
  hasKneePainAndRacePrep: boolean
): AIHealthPlan {
  // Get practitioners for the tier
  const practitioners = getMockPractitioners(categories, tier.budget);
  
  // Score the practitioners based on all our extracted data
  const scoredPractitioners = scoreProfessionals(
    practitioners,
    analysis.medicalConditions,
    analysis.specificGoals ? (Array.isArray(analysis.specificGoals) ? analysis.specificGoals : []) : [],
    tier.budget,
    analysis.timeFrame,
    categories,
    complexityScore,
    analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : [],
    analysis.preferences
  );
  
  // Build an optimized plan using our enhanced system
  const optimizedPlan = buildOptimizedPlan(
    scoredPractitioners,
    tier.budget,
    analysis.timeFrame,
    complexityScore,
    analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : [],
    analysis.preferences
  );
  
  // Use enhanced calculation for optimal service allocation as fallback
  const services = getOptimizedServices(
    optimizedPlan,
    categories,
    analysis,
    tier
  );
  
  // Generate personalized plan notes
  const notes = generateEnhancedPlanNotes(
    analysis,
    optimizedPlan,
    hasKneePainAndRacePrep
  );
  
  // Create a customized description
  let description = generatePlanDescription(
    analysis.medicalConditions, 
    analysis.primaryIssue, 
    analysis.userType, 
    tier.name,
    hasKneePainAndRacePrep
  );
  
  // Add notes to description
  if (notes.length > 0) {
    description = `${description} ${notes.join(' ')}`;
  }
  
  // Create the final plan
  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}-${tier.name}`,
    name: generatePlanName(tier.name, analysis.medicalConditions, analysis.primaryIssue, hasKneePainAndRacePrep),
    description,
    services: services.map(service => ({
      type: service.type as ServiceCategory,
      price: Math.round(service.cost / service.sessions), // Price per session
      sessions: service.sessions,
      description: generateServiceDescription(
        service.type, 
        tier.name === 'high',
        service.frequency,
        analysis.primaryIssue,
        hasKneePainAndRacePrep
      ),
      recommendedPractitioners: optimizedPlan.professionals.filter(p => 
        p.serviceType === service.type
      ) // Add recommended practitioners if available
    })),
    totalCost: services.reduce((sum, s) => sum + s.cost, 0),
    planType: determinePlanType(analysis.medicalConditions, analysis.primaryIssue, tier.name),
    timeFrame: analysis.timeFrame || determineTimeFrame(
      analysis.medicalConditions, 
      userQuery, 
      analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : [], 
      hasKneePainAndRacePrep
    )
  };
}

/**
 * Get optimized services for the plan
 */
function getOptimizedServices(
  optimizedPlan: any,
  categories: ServiceCategory[],
  analysis: any,
  tier: {name: string, budget: number}
): Array<{type: ServiceCategory, cost: number, sessions: number, frequency: string}> {
  // Convert professional-based plan to services or use optimal allocation if needed
  if (optimizedPlan.professionals.length > 0) {
    return optimizedPlan.professionals.map((pro: any) => ({
      type: pro.serviceType,
      cost: pro.pricePerSession * 4, // Assume 4 sessions for simplicity
      sessions: 4,
      frequency: "Weekly"
    }));
  } else {
    // Fall back to algorithmic allocation
    return calculateOptimalServiceAllocation(
      categories,
      analysis.servicePriorities ? analysis.servicePriorities : {},
      tier.budget,
      analysis.userType,
      analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : []
    );
  }
}

/**
 * Generate enhanced plan notes with more detail
 */
function generateEnhancedPlanNotes(
  analysis: any,
  optimizedPlan: any,
  hasSpecialCase: boolean
): string[] {
  // Generate base notes from plan data
  const notes = generatePlanNotes(
    analysis.preferences ? analysis.preferences : {},
    analysis.medicalConditions,
    analysis.severity ? analysis.severity : {},
    analysis.specificGoals ? (Array.isArray(analysis.specificGoals) ? analysis.specificGoals : {}) : {},
    analysis.timeFrame,
    analysis.location,
    analysis.preferOnline,
    analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : [],
    analysis.primaryIssue,
    analysis.servicePriorities
  );
  
  // Add explanations from professional scoring if available
  if (optimizedPlan.explanations && optimizedPlan.explanations.length > 0) {
    notes.push(...optimizedPlan.explanations);
  }
  
  // Add special case notes
  if (hasSpecialCase) {
    notes.push("This plan addresses your specific combination of conditions with specialized care.");
  }
  
  return notes;
}
