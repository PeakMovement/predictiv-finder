
import { AIHealthPlan, ServiceCategory } from '@/types';
import { findAlternativeCategories } from '../categoryMatcher';
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
        service.type as ServiceCategory, 
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
    ),
    // Add expected outcomes and timeline data for progress tracking
    expectedOutcomes: generateExpectedOutcomes(
      analysis.medicalConditions,
      analysis.specificGoals || [],
      tier.name
    ),
    rationales: generatePlanRationales(
      analysis.medicalConditions,
      analysis.servicePriorities || {},
      categories,
      tier.name
    ),
    progressTimeline: generateProgressTimeline(
      analysis.medicalConditions,
      services.map(s => s.type as ServiceCategory),
      analysis.timeFrame
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
): Array<{type: string; cost: number; sessions: number; frequency: string}> {
  // Convert professional-based plan to services or use optimal allocation if needed
  if (optimizedPlan.professionals && optimizedPlan.professionals.length > 0) {
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

/**
 * Generates expected outcomes based on the user's condition and goals
 */
function generateExpectedOutcomes(
  conditions: string[],
  goals: string[],
  tierName: string
): Array<{milestone: string, timeframe: string, description: string}> {
  const outcomes: Array<{milestone: string, timeframe: string, description: string}> = [];
  const isPremium = tierName === 'high';
  
  // Early milestone (1-2 weeks)
  outcomes.push({
    milestone: "Initial Progress",
    timeframe: isPremium ? "1 week" : "2 weeks",
    description: "Initial assessment complete and personalized strategy established. You should start experiencing the first positive changes."
  });
  
  // Mid milestone (4-6 weeks)
  outcomes.push({
    milestone: "Significant Improvement",
    timeframe: isPremium ? "4 weeks" : "6 weeks",
    description: "Notable progress in primary symptoms with measurable improvement in function and well-being."
  });
  
  // Final milestone (8-12 weeks)
  outcomes.push({
    milestone: "Goal Achievement",
    timeframe: isPremium ? "8 weeks" : "12 weeks",
    description: "Expected achievement of primary health goals with sustainable strategies for continued progress."
  });
  
  // Add condition-specific outcomes
  if (conditions.some(c => c.includes('pain'))) {
    outcomes.push({
      milestone: "Pain Reduction",
      timeframe: isPremium ? "3 weeks" : "5 weeks",
      description: "Expected significant reduction in pain levels with improved mobility and function."
    });
  }
  
  if (conditions.some(c => c.includes('weight'))) {
    outcomes.push({
      milestone: "Weight Management",
      timeframe: isPremium ? "6 weeks" : "8 weeks",
      description: "Established sustainable eating patterns and expected progress toward weight goals."
    });
  }
  
  if (goals.some(g => g.includes('strength') || g.includes('fitness'))) {
    outcomes.push({
      milestone: "Strength Building",
      timeframe: isPremium ? "5 weeks" : "7 weeks",
      description: "Noticeable improvement in strength, endurance and overall physical capacity."
    });
  }
  
  if (conditions.some(c => c.includes('stress') || c.includes('anxiety'))) {
    outcomes.push({
      milestone: "Stress Management",
      timeframe: isPremium ? "4 weeks" : "6 weeks",
      description: "Development of effective coping mechanisms and reduced stress response."
    });
  }
  
  return outcomes;
}

/**
 * Generate detailed rationales for why specific services were included in the plan
 */
function generatePlanRationales(
  conditions: string[],
  servicePriorities: Record<string, number>,
  selectedCategories: ServiceCategory[],
  tierName: string
): Array<{service: ServiceCategory, rationale: string, evidenceLevel: "high" | "medium" | "low"}> {
  const rationales: Array<{service: ServiceCategory, rationale: string, evidenceLevel: "high" | "medium" | "low"}> = [];
  
  // Generate rationales for each selected service
  selectedCategories.forEach(category => {
    let rationale = "";
    let evidenceLevel: "high" | "medium" | "low" = "medium";
    
    switch(category) {
      case "physiotherapist":
        rationale = conditions.some(c => c.includes('pain')) 
          ? "Physiotherapy has strong clinical evidence for reducing pain and improving function through targeted exercises and manual therapy."
          : "Physiotherapy helps improve movement patterns, joint mobility, and overall physical function.";
        evidenceLevel = "high";
        break;
      case "dietician":
        rationale = conditions.some(c => c.includes('weight')) 
          ? "Personalized nutrition planning has been shown to significantly improve weight management outcomes compared to self-directed approaches."
          : "Professional dietary guidance ensures optimal nutrition to support your health goals and overall wellbeing.";
        evidenceLevel = "high";
        break;
      case "personal-trainer":
        rationale = "Structured exercise programming with professional guidance leads to better adherence and results compared to self-directed exercise.";
        evidenceLevel = "medium";
        break;
      case "biokineticist":
        rationale = "Biokinetic assessment and specialized movement therapy addresses underlying movement dysfunction that may contribute to your condition.";
        evidenceLevel = "medium";
        break;
      case "coaching":
        rationale = "Health coaching provides accountability and behavioral support that significantly improves adherence to health plans.";
        evidenceLevel = "medium";
        break;
      case "psychiatry":
        rationale = conditions.some(c => c.includes('anxiety') || c.includes('depression')) 
          ? "Psychiatric care provides evidence-based treatment options for managing mental health conditions."
          : "Psychiatric support can help address psychological factors that may influence physical health outcomes.";
        evidenceLevel = "high";
        break;
      default:
        rationale = `${category.replace('-', ' ')} was selected based on the specific details of your health profile.`;
        evidenceLevel = "low";
    }
    
    // Add priority-based explanation
    const priority = servicePriorities[category] || 0;
    if (priority > 0.8) {
      rationale += " This service was identified as critically important based on your specific needs.";
    } else if (priority > 0.5) {
      rationale += " This service was identified as highly beneficial for your specific situation.";
    }
    
    // Add tier-specific information
    if (tierName === 'high') {
      rationale += " Your premium plan includes enhanced access to this service for optimal outcomes.";
    }
    
    rationales.push({
      service: category,
      rationale,
      evidenceLevel
    });
  });
  
  return rationales;
}

/**
 * Generate a progress timeline with key milestones
 */
function generateProgressTimeline(
  conditions: string[],
  services: ServiceCategory[],
  timeFrame: string | undefined
): Array<{week: number, milestone: string, focus: string}> {
  const timeFrameWeeks = timeFrame ? parseInt(timeFrame.split(' ')[0]) || 8 : 8;
  const timeline: Array<{week: number, milestone: string, focus: string}> = [];
  
  // Early assessment and baseline phase
  timeline.push({
    week: 1,
    milestone: "Initial Assessment",
    focus: "Professional evaluation and baseline measurements"
  });
  
  // Early progress phase
  timeline.push({
    week: Math.max(2, Math.floor(timeFrameWeeks * 0.25)),
    milestone: "Early Adaptation",
    focus: "Foundational skill development and initial progress"
  });
  
  // Mid-point check
  timeline.push({
    week: Math.floor(timeFrameWeeks * 0.5),
    milestone: "Mid-point Evaluation",
    focus: "Progress assessment and plan refinement"
  });
  
  // Advanced progress
  timeline.push({
    week: Math.floor(timeFrameWeeks * 0.75),
    milestone: "Advanced Progress",
    focus: "Skill mastery and habit integration"
  });
  
  // Final review
  timeline.push({
    week: timeFrameWeeks,
    milestone: "Goal Achievement",
    focus: "Results review and maintenance planning"
  });
  
  // Add service-specific milestones
  if (services.includes('physiotherapist')) {
    timeline.push({
      week: Math.floor(timeFrameWeeks * 0.35),
      milestone: "Movement Progress",
      focus: "Notable improvement in mobility and function"
    });
  }
  
  if (services.includes('personal-trainer')) {
    timeline.push({
      week: Math.floor(timeFrameWeeks * 0.4),
      milestone: "Fitness Breakthrough",
      focus: "Significant gains in strength and cardiovascular capacity"
    });
  }
  
  if (services.includes('dietician')) {
    timeline.push({
      week: Math.floor(timeFrameWeeks * 0.3),
      milestone: "Nutrition Adaptation",
      focus: "Establishment of sustainable eating patterns"
    });
  }
  
  // Sort by week
  return timeline.sort((a, b) => a.week - b.week);
}

// Export the hasKneePainAndRacePreparation function for use elsewhere
export function hasKneePainAndRacePreparation(
  conditions: string[] | undefined,
  userInput: string
): boolean {
  if (!conditions || conditions.length === 0) return false;
  
  const hasKneePain = conditions.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = conditions.some(c => 
    c.toLowerCase().includes('race') || c.toLowerCase().includes('marathon') || 
    c.toLowerCase().includes('running')
  ) || userInput.toLowerCase().includes('race') || 
     userInput.toLowerCase().includes('marathon') || 
     userInput.toLowerCase().includes('training for');
  
  return hasKneePain && hasRacePrep;
}
