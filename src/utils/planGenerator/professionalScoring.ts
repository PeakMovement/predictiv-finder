
import { Practitioner, ServiceCategory } from "@/types";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";
import { KeywordMapping } from "./inputAnalyzer/keywordMappings";

// Scoring weights for different factors
const SCORING_WEIGHTS = {
  // How relevant a professional is to a specific symptom or condition
  SYMPTOM_RELEVANCE: {
    PRIMARY: 0.9,
    SECONDARY: 0.6,
    SPECIALTY: 0.75
  },
  // How much should explicit mentions boost the score
  EXPLICIT_MENTION: 0.85,
  // Budget alignment - how well they fit in budget 
  BUDGET_FIT: 0.7,
  // How appropriate are they for specific timeframes
  TIMELINE_FIT: 0.65,
  // Boost for specialists that work well together
  SYNERGY_BOOST: 0.2,
  // Penalty for redundant overlapping specialists
  REDUNDANCY_PENALTY: -0.3
};

// Type for the scored professional result
export interface ScoredProfessional {
  practitioner: Practitioner;
  score: number;
  relevanceScore: number; // How relevant they are to the core symptoms/goals
  budgetScore: number;    // How well they fit in the budget
  timelineScore: number;  // How appropriate they are for the timeline
  factors: {              // Individual scoring factors for explanation
    [key: string]: number;
  };
}

/**
 * Score professionals based on relevance to symptoms, goals, budget and timeline
 */
export function scoreProfessionals(
  practitioners: Practitioner[],
  symptoms: string[],
  goals: string[],
  budget?: number,
  timeframe?: string,
  explicitMentions?: ServiceCategory[],
  complexity?: number
): ScoredProfessional[] {
  console.log("Scoring professionals based on:", { 
    practitioners: practitioners.length,
    symptoms, 
    goals, 
    budget, 
    timeframe, 
    explicitMentions 
  });

  // Get all scored professionals
  const scoredPros = practitioners.map(practitioner => {
    // Initialize scoring object
    const scored: ScoredProfessional = {
      practitioner,
      score: 0,
      relevanceScore: 0,
      budgetScore: 0,
      timelineScore: 0,
      factors: {}
    };
    
    // Score based on symptom relevance
    scoreBySymptoms(scored, symptoms);
    
    // Score based on goal alignment
    scoreByGoals(scored, goals);
    
    // Adjust score for explicit mentions (user specifically mentioned this type)
    if (explicitMentions && explicitMentions.includes(practitioner.serviceType)) {
      scored.score += SCORING_WEIGHTS.EXPLICIT_MENTION;
      scored.factors["explicit_mention"] = SCORING_WEIGHTS.EXPLICIT_MENTION;
      console.log(`Boosting score for ${practitioner.name} due to explicit mention: +${SCORING_WEIGHTS.EXPLICIT_MENTION}`);
    }
    
    // Adjust score for budget fit if budget specified
    if (budget) {
      const budgetScore = scoreBudgetFit(practitioner, budget);
      scored.budgetScore = budgetScore;
      scored.score += budgetScore * SCORING_WEIGHTS.BUDGET_FIT;
      scored.factors["budget_fit"] = budgetScore * SCORING_WEIGHTS.BUDGET_FIT;
    }
    
    // Adjust score for timeframe appropriateness if specified
    if (timeframe) {
      const timelineScore = scoreTimelineFit(practitioner.serviceType, timeframe);
      scored.timelineScore = timelineScore;
      scored.score += timelineScore * SCORING_WEIGHTS.TIMELINE_FIT;
      scored.factors["timeline_fit"] = timelineScore * SCORING_WEIGHTS.TIMELINE_FIT;
    }
    
    // Special case: boost specific combinations known to work well
    if (complexity && complexity > 3) {
      // For complex issues, give slight boost to specialists that complement others
      adjustForComplexity(scored, practitioners);
    }

    return scored;
  });

  // Sort by total score, highest first
  return scoredPros.sort((a, b) => b.score - a.score);
}

/**
 * Score a professional based on symptom relevance
 */
function scoreBySymptoms(scored: ScoredProfessional, symptoms: string[]) {
  const practitioner = scored.practitioner;
  
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (!mapping) return;
    
    // Check if professional is primary for this symptom
    if (mapping.primary === practitioner.serviceType) {
      const score = SCORING_WEIGHTS.SYMPTOM_RELEVANCE.PRIMARY;
      scored.score += score;
      scored.relevanceScore += score;
      scored.factors[`primary_for_${symptom}`] = score;
      console.log(`${practitioner.name} is primary for ${symptom}: +${score}`);
    }
    
    // Check if professional is in specialties for this symptom
    if (mapping.specialties && mapping.specialties.includes(practitioner.serviceType)) {
      const score = SCORING_WEIGHTS.SYMPTOM_RELEVANCE.SPECIALTY;
      scored.score += score;
      scored.relevanceScore += score;
      scored.factors[`specialty_for_${symptom}`] = score;
      console.log(`${practitioner.name} is specialty for ${symptom}: +${score}`);
    }
    
    // Check if professional is in secondary for this symptom
    if (mapping.secondary && mapping.secondary.includes(practitioner.serviceType)) {
      const score = SCORING_WEIGHTS.SYMPTOM_RELEVANCE.SECONDARY;
      scored.score += score;
      scored.relevanceScore += score;
      scored.factors[`secondary_for_${symptom}`] = score;
      console.log(`${practitioner.name} is secondary for ${symptom}: +${score}`);
    }
  });
}

/**
 * Score a professional based on goals alignment
 */
function scoreByGoals(scored: ScoredProfessional, goals: string[]) {
  const practitioner = scored.practitioner;
  
  // Implementation would analyze goals and check how well the professional aligns
  // This is a placeholder, ideally would use a mapping of goals to service types
  
  // For now, use service tags as a proxy for goal alignment
  goals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    const hasRelevantTag = practitioner.serviceTags.some(tag => 
      goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(goalLower)
    );
    
    if (hasRelevantTag) {
      const score = 0.75; // Moderate score for tag match
      scored.score += score;
      scored.relevanceScore += score;
      scored.factors[`tag_match_${goal}`] = score;
      console.log(`${practitioner.name} has tag matching goal ${goal}: +${score}`);
    }
  });
}

/**
 * Score how well a practitioner fits within a budget
 * Returns a value between -1 and 1, where:
 * 1 = excellent value for budget
 * 0 = neutral/average value
 * -1 = significantly over budget
 */
function scoreBudgetFit(practitioner: Practitioner, budget: number): number {
  // Calculate how much of the budget a single session would take
  const budgetPortion = practitioner.pricePerSession / budget;
  
  // Score based on how much of the budget they consume
  if (budgetPortion <= 0.2) {
    // Excellent value - uses less than 20% of budget per session
    return 1.0;
  } else if (budgetPortion <= 0.4) {
    // Good value - uses 20-40% of budget per session
    return 0.7;
  } else if (budgetPortion <= 0.6) {
    // Average value - uses 40-60% of budget per session
    return 0.3;
  } else if (budgetPortion <= 0.8) {
    // Poor value - uses 60-80% of budget per session
    return -0.3;
  } else if (budgetPortion <= 1.0) {
    // Barely fits - uses 80-100% of budget per session
    return -0.7;
  } else {
    // Doesn't fit budget - uses more than 100% of budget
    return -1.0;
  }
}

/**
 * Score how appropriate a service type is for a given timeframe
 * Returns a value between 0 and 1:
 * 1 = ideal for timeframe
 * 0 = not appropriate for timeframe
 */
function scoreTimelineFit(serviceType: ServiceCategory, timeframe: string): number {
  // For short timeframes (weeks/month)
  if (timeframe.includes("week") || (timeframe.includes("month") && !timeframe.includes("months"))) {
    switch(serviceType) {
      case "dietician": 
        return 0.9; // Quick dietary changes can show results
      case "coaching":
        return 0.8; // Good for quick motivation and direction
      case "personal-trainer":
        return 0.7; // Can provide programs that work in short timeframes
      case "physiotherapist":
        return 0.6; // Can provide quick relief for some conditions
      case "family-medicine":
        return 0.8; // Quick diagnosis and treatment for many conditions
      default:
        return 0.5; // Neutral for other specialists in short timeframe
    }
  }
  
  // For medium timeframes (months)
  else if (timeframe.includes("months") || timeframe.includes("quarter")) {
    // Most specialists work well in medium timeframes
    return 0.8;
  }
  
  // For long timeframes (year+)
  else if (timeframe.includes("year")) {
    switch(serviceType) {
      case "cardiology":
      case "endocrinology":
      case "rheumatology":
      case "psychiatry": 
        return 0.9; // These specialties often deal with long-term conditions
      default:
        return 0.7; // Other specialists still potentially valuable for long-term
    }
  }
  
  return 0.6; // Default if timeframe isn't clearly recognized
}

/**
 * Adjust scores based on how well practitioners would work together in complex cases
 */
function adjustForComplexity(
  scored: ScoredProfessional, 
  allPractitioners: Practitioner[]
) {
  const practitioner = scored.practitioner;
  
  // Define synergistic combinations
  const synergies: Record<ServiceCategory, ServiceCategory[]> = {
    "dietician": ["personal-trainer", "endocrinology"],
    "personal-trainer": ["physiotherapist", "dietician"],
    "physiotherapist": ["personal-trainer", "orthopedics"],
    "psychiatry": ["coaching", "family-medicine"],
    "cardiology": ["dietician", "family-medicine"],
  };
  
  // Check if this practitioner has synergies with other high-ranking practitioners
  const synergisticWith = synergies[practitioner.serviceType];
  if (synergisticWith) {
    // Find if we have other practitioners of those types
    const hasSynergisticPartners = allPractitioners.some(other => 
      other.id !== practitioner.id && 
      synergisticWith.includes(other.serviceType)
    );
    
    if (hasSynergisticPartners) {
      scored.score += SCORING_WEIGHTS.SYNERGY_BOOST;
      scored.factors["synergy_boost"] = SCORING_WEIGHTS.SYNERGY_BOOST;
      console.log(`Giving ${practitioner.name} synergy boost: +${SCORING_WEIGHTS.SYNERGY_BOOST}`);
    }
  }
  
  // Check for redundancy (too many of the same type)
  const sameTypeCount = allPractitioners.filter(
    p => p.serviceType === practitioner.serviceType
  ).length;
  
  if (sameTypeCount > 1) {
    // Apply redundancy penalty if we have multiple of the same type
    scored.score += SCORING_WEIGHTS.REDUNDANCY_PENALTY;
    scored.factors["redundancy_penalty"] = SCORING_WEIGHTS.REDUNDANCY_PENALTY;
    console.log(`Giving ${practitioner.name} redundancy penalty: ${SCORING_WEIGHTS.REDUNDANCY_PENALTY}`);
  }
}

/**
 * Build an optimized plan based on scored professionals, applying budget and timeline constraints
 */
export function buildOptimizedPlan(
  scoredProfessionals: ScoredProfessional[],
  budget?: number,
  timeframe?: string,
  complexity?: number
): {
  professionals: Practitioner[];
  totalCost: number;
  explanations: string[];
} {
  const plan: Practitioner[] = [];
  const explanations: string[] = [];
  let totalCost = 0;
  
  // Determine max professionals based on complexity
  const maxProfessionals = complexity && complexity > 3 ? 3 : 
                           complexity && complexity > 1 ? 2 : 1;
  
  console.log(`Building plan with max ${maxProfessionals} professionals, budget ${budget}, complexity ${complexity}`);
  
  // First pass: add highest scoring professionals until we hit constraints
  for (const scored of scoredProfessionals) {
    // Stop if we've reached the max number of professionals
    if (plan.length >= maxProfessionals) break;
    
    // Check budget constraint
    const newTotalCost = totalCost + scored.practitioner.pricePerSession;
    if (budget && newTotalCost > budget) {
      console.log(`Skipping ${scored.practitioner.name} as adding would exceed budget`);
      continue;
    }
    
    // Add to plan
    plan.push(scored.practitioner);
    totalCost = newTotalCost;
    
    // Generate explanation for this professional
    const explanation = generateExplanation(scored);
    explanations.push(explanation);
    
    console.log(`Added ${scored.practitioner.name} to plan, total cost now: ${totalCost}`);
  }
  
  // If we couldn't add any professionals due to budget, try with the cheapest option
  if (plan.length === 0 && budget) {
    const cheapestPro = scoredProfessionals
      .sort((a, b) => a.practitioner.pricePerSession - b.practitioner.pricePerSession)[0];
      
    if (cheapestPro) {
      plan.push(cheapestPro.practitioner);
      totalCost = cheapestPro.practitioner.pricePerSession;
      explanations.push(`${cheapestPro.practitioner.name} was selected as the most affordable option within your budget.`);
      console.log(`Added ${cheapestPro.practitioner.name} as budget-constrained option`);
    }
  }
  
  return {
    professionals: plan,
    totalCost,
    explanations
  };
}

/**
 * Generate a human-readable explanation for why a professional was selected
 */
function generateExplanation(scored: ScoredProfessional): string {
  const pro = scored.practitioner;
  const factors = Object.entries(scored.factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Get top 3 factors
  
  // Base explanation
  let explanation = `${pro.name} (${pro.serviceType.replace('-', ' ')}) was selected because `;
  
  // Add primary reason
  if (factors.length > 0) {
    const primaryFactor = factors[0][0];
    
    if (primaryFactor.startsWith('primary_for_')) {
      const symptom = primaryFactor.replace('primary_for_', '');
      explanation += `they specialize in treating ${symptom}`;
    } 
    else if (primaryFactor.startsWith('specialty_for_')) {
      const symptom = primaryFactor.replace('specialty_for_', '');
      explanation += `they have expertise in ${symptom}`;
    }
    else if (primaryFactor.startsWith('tag_match_')) {
      const goal = primaryFactor.replace('tag_match_', '');
      explanation += `they're experienced in helping clients with ${goal}`;
    }
    else if (primaryFactor === 'explicit_mention') {
      explanation += `you specifically mentioned needing this type of service`;
    }
    else if (primaryFactor === 'budget_fit') {
      explanation += `they provide excellent value within your budget`;
    }
    else if (primaryFactor === 'timeline_fit') {
      explanation += `they're well-suited to your timeframe`;
    }
    else if (primaryFactor === 'synergy_boost') {
      explanation += `they work well with the other professionals in your plan`;
    }
    else {
      explanation += `they're a great match for your needs`;
    }
  } else {
    explanation += `they're a good match for your overall requirements`;
  }
  
  // Add price
  explanation += `. Sessions cost R${pro.pricePerSession} each.`;
  
  return explanation;
}
