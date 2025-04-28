import { AIHealthPlan } from '@/types';
import { analyzeUserInput } from './planGenerator/inputAnalyzer';
import { findAlternativeCategories } from './planGenerator/categoryMatcher';
import { determineBudgetTier } from './planGenerator/budgetConfig';
import { generatePlan } from './planGenerator/planGenerator';
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes,
  calculateOptimalServiceAllocation
} from './planGenerator/enhancedInputAnalyzer';
import { BASELINE_COSTS, STUDENT_DISCOUNT } from './planGenerator/types';

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
  
  // Special case handling for anxiety + eating + race preparation
  if (userQuery.toLowerCase().includes('anxiety') && 
      userQuery.toLowerCase().includes('struggling to eat') && 
      (userQuery.toLowerCase().includes('race') || userQuery.toLowerCase().includes('run'))) {
    
    // Ensure dietician is included and prioritized
    if (!categories.includes('dietician')) {
      categories.push('dietician');
      console.log("Added dietician for anxiety + eating issues");
    }
    
    // Ensure personal trainer is included for race preparation
    if (!categories.includes('personal-trainer')) {
      categories.push('personal-trainer');
      console.log("Added personal-trainer for race preparation");
    }
    
    // Remove physiotherapist if present (unless there's a physical injury)
    if (categories.includes('physiotherapist') && 
        !userQuery.toLowerCase().includes('pain') && 
        !userQuery.toLowerCase().includes('injury')) {
      categories = categories.filter(c => c !== 'physiotherapist');
      console.log("Removed physiotherapist as not relevant to main issues");
    }
  }
  
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
    let description = generatePlanDescription(
      medicalConditions, 
      primaryIssue, 
      userType, 
      tier.name
    );
    
    // Add notes to description
    if (notes.length > 0) {
      description = `${description} ${notes.join(' ')}`;
    }
    
    // Create the final plan
    const plan: AIHealthPlan = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}-${tier.name}`,
      name: generatePlanName(tier.name, medicalConditions, primaryIssue),
      description,
      services: optimizedServices.map(service => ({
        type: service.type,
        price: Math.round(service.cost / service.sessions), // Price per session
        sessions: service.sessions,
        description: generateServiceDescription(
          service.type, 
          tier.name === 'high',
          service.frequency,
          primaryIssue
        ),
        recommendedPractitioners: [] // Will be populated by the planGenerator module
      })),
      totalCost: optimizedServices.reduce((sum, s) => sum + s.cost, 0),
      planType: determinePlanType(medicalConditions, primaryIssue, tier.name),
      timeFrame: timeFrame || determineTimeFrame(medicalConditions, userQuery, contextualFactors || [])
    };
    
    plans.push(plan);
  }
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
};

// Helper function to generate more specific plan names
function generatePlanName(
  tierName: string, 
  conditions: string[], 
  primaryIssue?: string
): string {
  const tierPrefix = `${tierName.charAt(0).toUpperCase() + tierName.slice(1)} Budget:`;
  
  // Special case for anxiety + nutrition + race prep
  if ((primaryIssue === 'anxiety' || conditions.includes('anxiety')) && 
      conditions.includes('nutrition needs') && 
      (primaryIssue === 'race preparation' || conditions.includes('race preparation'))) {
    return `${tierPrefix} Race Preparation & Nutrition Support Plan`;
  }
  
  if (primaryIssue === 'anxiety' || conditions.includes('anxiety')) {
    return `${tierPrefix} Anxiety & Wellbeing Plan`;
  }
  
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return `${tierPrefix} Race Training Plan`;
  }
  
  if (primaryIssue === 'nutrition' || conditions.includes('nutrition needs')) {
    return `${tierPrefix} Nutritional Support Plan`;
  }
  
  // Keep existing cases
  if (primaryIssue === 'shoulder pain' || conditions.includes('shoulder strain')) {
    return `${tierPrefix} Shoulder Recovery Plan`;
  }
  
  if (primaryIssue === 'knee pain' || conditions.includes('knee pain')) {
    return `${tierPrefix} Knee Rehabilitation Plan`;
  }
  
  if (primaryIssue === 'back pain' || conditions.includes('back pain')) {
    return `${tierPrefix} Back Relief & Recovery Plan`;
  }
  
  if (primaryIssue === 'digestive issues' || conditions.includes('stomach issues')) {
    return `${tierPrefix} Digestive Health Plan`;
  }
  
  if (primaryIssue === 'weight management' || conditions.includes('weight loss')) {
    return `${tierPrefix} Weight Management Plan`;
  }
  
  if (primaryIssue === 'fitness' || primaryIssue === 'strength' || conditions.includes('fitness goals')) {
    return `${tierPrefix} Fitness & Strength Plan`;
  }
  
  if (primaryIssue === 'event preparation') {
    return `${tierPrefix} Event Preparation Plan`;
  }
  
  if (primaryIssue === 'sports injury' || conditions.includes('sports injury')) {
    return `${tierPrefix} Sports Recovery Plan`;
  }
  
  if (primaryIssue === 'stress' || conditions.includes('mental health')) {
    return `${tierPrefix} Stress Management Plan`;
  }
  
  // Default name
  return `${tierPrefix} Customized Wellness Plan`;
}

// Helper function to generate more personalized descriptions
function generatePlanDescription(
  conditions: string[], 
  primaryIssue?: string,
  userType?: string,
  tierName?: string
): string {
  // Special case for anxiety + nutrition + race prep
  if ((primaryIssue === 'anxiety' || conditions.includes('anxiety')) && 
      conditions.includes('nutrition needs') && 
      (primaryIssue === 'race preparation' || conditions.includes('race preparation'))) {
    return "A holistic plan combining mental wellness support, nutritional guidance, and race training to help manage anxiety, improve eating habits, and prepare for your upcoming race.";
  }
  
  if (primaryIssue === 'anxiety' || conditions.includes('anxiety')) {
    return "A supportive plan focused on managing anxiety through professional guidance, lifestyle strategies, and mental wellbeing techniques.";
  }
  
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return "A structured training program designed to prepare you for your upcoming race with appropriate intensity progression, recovery protocols, and performance strategies.";
  }
  
  if (primaryIssue === 'nutrition' || conditions.includes('nutrition needs')) {
    return "A personalized nutrition plan addressing your specific dietary needs with practical guidance to establish sustainable eating habits and improve overall health.";
  }
  
  // Keep other existing cases
  if (primaryIssue === 'shoulder pain' || conditions.includes('shoulder strain')) {
    return "A targeted recovery plan focusing on shoulder rehabilitation with physiotherapy and properly guided exercises to reduce pain and restore function.";
  }
  
  // ... keep existing code (other condition descriptions) the same
  
  // Default description
  let baseDescription = "A personalized wellness plan designed to address your specific health needs";
  
  if (userType === 'student') {
    baseDescription += " with student-friendly options";
  } else if (tierName === 'low') {
    baseDescription += " within an affordable budget";
  } else if (tierName === 'high') {
    baseDescription += " with premium service options";
  }
  
  return `${baseDescription}.`;
}

// Helper function to generate more specific service descriptions
function generateServiceDescription(
  serviceType: string, 
  isHighEnd: boolean,
  frequency?: string,
  primaryIssue?: string
): string {
  let description = '';
  
  switch (serviceType) {
    case 'dietician':
      if (primaryIssue === 'anxiety' || primaryIssue?.includes('nutrition')) {
        description = "Specialized nutritional support to address anxiety-related eating challenges";
      } else if (primaryIssue === 'race preparation') {
        description = "Sports nutrition guidance for optimal race preparation and performance";
      } else if (primaryIssue === 'weight management') {
        description = "Customized meal planning for sustainable weight management";
      } else if (primaryIssue === 'digestive issues') {
        description = "Specialized dietary assessment for digestive health";
      } else {
        description = isHighEnd 
          ? "Comprehensive nutritional assessment with detailed dietary recommendations" 
          : "Nutritional guidance and practical meal planning advice";
      }
      break;
      
    case 'personal-trainer':
      if (primaryIssue === 'race preparation') {
        description = "Specialized running training sessions with race-specific preparation";
      } else if (primaryIssue === 'weight management') {
        description = "Structured weight loss training sessions with fat-burning exercises";
      } else if (primaryIssue === 'fitness' || primaryIssue === 'strength') {
        description = "Progressive strength training with performance tracking";
      } else if (primaryIssue === 'event preparation') {
        description = "Event-specific training with periodization and performance targets";
      } else {
        description = isHighEnd 
          ? "Fully personalized training sessions with advanced program design" 
          : "Guided workout sessions targeting your specific fitness goals";
      }
      break;
      
    case 'coaching':
      if (primaryIssue === 'anxiety') {
        description = "Supportive coaching focused on anxiety management and mental wellbeing strategies";
      } else if (primaryIssue === 'race preparation') {
        description = "Race preparation coaching with mental performance techniques";
      } else {
        description = isHighEnd 
          ? "One-on-one coaching sessions with advanced behavior change techniques" 
          : "Supportive coaching to help develop healthy habits and mindsets";
      }
      break;
      
    case 'physiotherapist':
      if (primaryIssue === 'shoulder pain') {
        description = "Specialized shoulder assessment and rehabilitation treatment";
      } else if (primaryIssue === 'knee pain') {
        description = "Comprehensive knee evaluation and targeted rehabilitation";
      } else if (primaryIssue === 'back pain') {
        description = "Focused back assessment with manual therapy and corrective exercises";
      } else if (primaryIssue === 'sports injury') {
        description = "Sports injury rehabilitation with return-to-play protocols";
      } else {
        description = isHighEnd 
          ? "Comprehensive physiotherapy assessment and specialized treatment plan" 
          : "Clinical assessment and targeted rehabilitation exercises";
      }
      break;
      
    default:
      description = isHighEnd 
        ? "Specialized professional consultation with comprehensive assessment" 
        : "Professional consultation focused on your specific needs";
  }
  
  // Add frequency information if available
  if (frequency) {
    description += ` (${frequency})`;
  }
  
  return description;
}

// Helper function to calculate budget tiers
function calculateBudgetTiers(
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
    // Create a low tier at exactly the user's budget
    const userBudget = Math.max(500, budget); // Ensure minimum viable budget
    
    budgetTiers = [
      { name: 'low', budget: userBudget },
      { name: 'medium', budget: Math.floor(userBudget * 1.5) },
      { name: 'high', budget: Math.floor(userBudget * 2.5) }
    ];
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

// Helper function to determine plan type
function determinePlanType(
  conditions: string[],
  primaryIssue?: string,
  tierName?: string
): AIHealthPlan['planType'] {
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return 'progressive';
  }
  
  if (primaryIssue === 'event preparation' || conditions.includes('fitness goals')) {
    return 'progressive';
  }
  
  if (primaryIssue === 'shoulder pain' || primaryIssue === 'knee pain' || 
      primaryIssue === 'back pain' || conditions.includes('sports injury')) {
    return 'high-impact';
  }
  
  if (tierName === 'low') {
    return 'best-fit';
  }
  
  return 'progressive';
}

// Helper function to determine timeframe
function determineTimeFrame(
  conditions: string[],
  userQuery: string,
  contextualFactors: string[] = []
): string {
  // Check for specific race timeframes in the query
  const raceMatch = userQuery.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) ||
                    userQuery.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
                    
  if (raceMatch) {
    const amount = parseInt(raceMatch[1] || raceMatch[3], 10);
    const unit = (raceMatch[2] || raceMatch[4]).toLowerCase();
    return `${amount} ${unit}`;
  }
  
  // Check for general timeframes in the query
  const timeMatch = userQuery.match(/(\d+)\s*(weeks?|months?|days?)/i);
  if (timeMatch) {
    const amount = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    return `${amount} ${unit}`;
  }
  
  // Based on primary issue
  if (contextualFactors.includes('event-preparation')) {
    return '8 weeks'; // Standard event prep timeframe
  }
  
  if (conditions.includes('sports injury') || 
      conditions.includes('shoulder strain') ||
      conditions.includes('knee pain') ||
      conditions.includes('back pain')) {
    return '6 weeks'; // Standard injury rehabilitation timeframe
  }
  
  if (conditions.includes('weight loss')) {
    return '12 weeks'; // Standard weight loss timeframe
  }
  
  if (conditions.includes('race preparation')) {
    return '4 weeks'; // Short race prep timeframe
  }
  
  return '8 weeks'; // Default timeframe
}

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
