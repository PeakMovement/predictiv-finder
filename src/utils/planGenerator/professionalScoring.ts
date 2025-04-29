
import { Practitioner, ServiceCategory } from "@/types";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";
import { KeywordMapping } from "./inputAnalyzer/keywordMappings";

// Refined scoring weights for different factors
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
  REDUNDANCY_PENALTY: -0.3,
  // New: Higher penalty for exceeding budget constraints
  BUDGET_CONSTRAINT_PENALTY: -0.5,
  // New: Personal context relevance
  PERSONAL_CONTEXT: 0.4,
  // New: Goal alignment
  GOAL_ALIGNMENT: 0.8,
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
 * Enhanced scoring of professionals based on multiple dimensions
 * Including symptoms, goals, budget, timeline, and personal context
 */
export function scoreProfessionals(
  practitioners: Practitioner[],
  symptoms: string[],
  goals: string[],
  budget?: number,
  timeframe?: string,
  explicitMentions?: ServiceCategory[],
  complexity?: number,
  personalContext?: string[],
  preferences?: Record<string, any>
): ScoredProfessional[] {
  console.log("Scoring professionals based on:", { 
    practitioners: practitioners.length,
    symptoms, 
    goals, 
    budget, 
    timeframe, 
    explicitMentions,
    personalContext
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
    
    // Enhanced scoring for goal alignment
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
      
      // More aggressive penalty for substantially exceeding budget
      if (budgetScore < -0.7) {
        scored.score += SCORING_WEIGHTS.BUDGET_CONSTRAINT_PENALTY;
        scored.factors["budget_constraint"] = SCORING_WEIGHTS.BUDGET_CONSTRAINT_PENALTY;
        console.log(`Applied strict budget penalty to ${practitioner.name}: ${SCORING_WEIGHTS.BUDGET_CONSTRAINT_PENALTY}`);
      }
    }
    
    // Adjust score for timeframe appropriateness
    if (timeframe) {
      const timelineScore = scoreTimelineFit(practitioner.serviceType, timeframe);
      scored.timelineScore = timelineScore;
      scored.score += timelineScore * SCORING_WEIGHTS.TIMELINE_FIT;
      scored.factors["timeline_fit"] = timelineScore * SCORING_WEIGHTS.TIMELINE_FIT;
    }
    
    // NEW: Score based on personal context
    if (personalContext && personalContext.length > 0) {
      const contextScore = scorePersonalContext(scored, personalContext, practitioner);
      scored.score += contextScore;
    }
    
    // NEW: Score based on preferences if provided
    if (preferences) {
      const preferenceScore = scorePreferences(scored, preferences, practitioner);
      scored.score += preferenceScore;
    }
    
    // Special case: boost specific combinations known to work well
    if (complexity && complexity > 3) {
      // For complex issues, give slight boost to specialists that complement others
      adjustForComplexity(scored, practitioners);
    }

    // Round the scores to 2 decimal places for cleaner output
    scored.score = parseFloat(scored.score.toFixed(2));
    scored.relevanceScore = parseFloat(scored.relevanceScore.toFixed(2));
    scored.budgetScore = parseFloat(scored.budgetScore.toFixed(2));
    scored.timelineScore = parseFloat(scored.timelineScore.toFixed(2));

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
 * Enhanced scoring for goal alignment with more nuanced matching
 */
function scoreByGoals(scored: ScoredProfessional, goals: string[]) {
  const practitioner = scored.practitioner;
  
  // For each user goal, check how well the professional's expertise aligns
  goals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    
    // Direct tag matching (explicit alignment)
    const directMatchTags = practitioner.serviceTags.filter(tag => 
      goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(goalLower)
    );
    
    if (directMatchTags.length > 0) {
      // More points for multiple matching tags
      const matchScore = Math.min(0.85, 0.65 + (directMatchTags.length * 0.1));
      scored.score += matchScore;
      scored.relevanceScore += matchScore;
      scored.factors[`direct_goal_match_${goal}`] = matchScore;
      console.log(`${practitioner.name} directly matches goal "${goal}" with tags: ${directMatchTags.join(', ')}: +${matchScore}`);
    }
    
    // Semantic matching for related concepts
    const semanticMatches = getSemanticMatches(goalLower, practitioner.serviceType);
    if (semanticMatches.length > 0) {
      const semanticScore = 0.5;
      scored.score += semanticScore;
      scored.relevanceScore += semanticScore;
      scored.factors[`semantic_goal_match_${goal}`] = semanticScore;
      console.log(`${practitioner.name} semantically matches goal "${goal}" via: ${semanticMatches.join(', ')}: +${semanticScore}`);
    }
  });
}

/**
 * Helper to find semantic matches between goals and service types
 */
function getSemanticMatches(goal: string, serviceType: ServiceCategory): string[] {
  const matches: string[] = [];
  
  // Mapping of semantic relationships
  const semanticMap: Record<string, string[]> = {
    'weight loss': ['dietician', 'personal-trainer', 'coaching', 'endocrinology'],
    'weight gain': ['dietician', 'personal-trainer'],
    'muscle': ['personal-trainer', 'physiotherapist', 'biokineticist'],
    'fitness': ['personal-trainer', 'coaching', 'biokineticist'],
    'pain': ['physiotherapist', 'orthopedics', 'family-medicine', 'pain-management'],
    'stress': ['psychiatry', 'coaching', 'family-medicine'],
    'anxiety': ['psychiatry', 'coaching'],
    'depression': ['psychiatry', 'coaching', 'family-medicine'],
    'stomach': ['gastroenterology', 'dietician', 'family-medicine'],
    'race': ['personal-trainer', 'coaching', 'physiotherapist'],
    'marathon': ['personal-trainer', 'coaching', 'physiotherapist', 'dietician'],
    'endurance': ['personal-trainer', 'coaching', 'cardiology'],
    'strength': ['personal-trainer', 'biokineticist'],
    'mobility': ['physiotherapist', 'biokineticist'],
    'heart': ['cardiology', 'family-medicine', 'personal-trainer'],
    'skin': ['dermatology', 'family-medicine'],
    'diet': ['dietician', 'endocrinology'],
    'nutrition': ['dietician'],
    'recovery': ['physiotherapist', 'biokineticist'],
    'sleep': ['psychiatry', 'family-medicine'],
    'focus': ['psychiatry', 'coaching'],
    'energy': ['dietician', 'endocrinology', 'family-medicine'],
    'motivation': ['coaching', 'psychiatry'],
    'rehabilitation': ['physiotherapist', 'biokineticist'],
  };
  
  // Check if goal contains any of our semantic keys
  Object.entries(semanticMap).forEach(([key, relatedServices]) => {
    if (goal.includes(key) && relatedServices.includes(serviceType)) {
      matches.push(key);
    }
  });
  
  return matches;
}

/**
 * Score how well a practitioner fits within a budget
 * Returns a value between -1 and 1, where:
 * 1 = excellent value for budget
 * 0 = neutral/average value
 * -1 = significantly over budget
 */
function scoreBudgetFit(practitioner: Practitioner, budget: number): number {
  // Calculate monthly cost (4 sessions per month as standard)
  const monthlyCost = practitioner.pricePerSession * 4;
  const budgetPortion = monthlyCost / budget;
  
  // Score based on how much of the budget they consume
  if (budgetPortion <= 0.15) {
    // Excellent value - uses less than 15% of budget per session
    return 1.0;
  } else if (budgetPortion <= 0.3) {
    // Very good value - uses 15-30% of budget per session
    return 0.8;
  } else if (budgetPortion <= 0.5) {
    // Good value - uses 30-50% of budget per session
    return 0.5;
  } else if (budgetPortion <= 0.7) {
    // Fair value - uses 50-70% of budget per session
    return 0.2;
  } else if (budgetPortion <= 0.9) {
    // Poor value - uses 70-90% of budget per session
    return -0.3;
  } else if (budgetPortion <= 1.1) {
    // Barely fits - uses 90-110% of budget per session
    return -0.7;
  } else {
    // Doesn't fit budget - uses more than 110% of budget
    return -1.0;
  }
}

/**
 * Score how appropriate a service type is for a given timeframe
 * More nuanced assessment based on service type and timeframe
 */
function scoreTimelineFit(serviceType: ServiceCategory, timeframe: string): number {
  const lowerTimeframe = timeframe.toLowerCase();
  
  // Parse timeframe into rough number of weeks
  let estimatedWeeks = 12; // Default: medium timeframe (3 months)
  
  if (lowerTimeframe.includes("week")) {
    const weekMatch = lowerTimeframe.match(/(\d+)\s*week/);
    if (weekMatch && weekMatch[1]) {
      estimatedWeeks = parseInt(weekMatch[1]);
    } else {
      estimatedWeeks = 4; // Default "weeks" to 4 weeks
    }
  } 
  else if (lowerTimeframe.includes("month")) {
    const monthMatch = lowerTimeframe.match(/(\d+)\s*month/);
    if (monthMatch && monthMatch[1]) {
      estimatedWeeks = parseInt(monthMatch[1]) * 4;
    } else {
      estimatedWeeks = 4; // Default "month" to 1 month (4 weeks)
    }
  }
  else if (lowerTimeframe.includes("year")) {
    const yearMatch = lowerTimeframe.match(/(\d+)\s*year/);
    if (yearMatch && yearMatch[1]) {
      estimatedWeeks = parseInt(yearMatch[1]) * 52;
    } else {
      estimatedWeeks = 52; // Default "year" to 1 year (52 weeks)
    }
  }
  
  // Map services to their optimal timeframes (in weeks)
  const serviceOptimalTimelines: Record<ServiceCategory, {min: number, ideal: number, max: number}> = {
    'dietician': {min: 4, ideal: 12, max: 52},
    'personal-trainer': {min: 4, ideal: 16, max: 104},
    'physiotherapist': {min: 2, ideal: 8, max: 24},
    'coaching': {min: 4, ideal: 12, max: 52},
    'biokineticist': {min: 4, ideal: 12, max: 36},
    'family-medicine': {min: 1, ideal: 4, max: 52},
    'psychiatry': {min: 4, ideal: 16, max: 104},
    'cardiology': {min: 4, ideal: 12, max: 52},
    'dermatology': {min: 2, ideal: 8, max: 24},
    'gastroenterology': {min: 2, ideal: 8, max: 24},
    'orthopedics': {min: 2, ideal: 12, max: 36},
    'neurology': {min: 4, ideal: 12, max: 52},
    'endocrinology': {min: 8, ideal: 24, max: 104},
    'rheumatology': {min: 6, ideal: 16, max: 52},
    'pain-management': {min: 2, ideal: 8, max: 36}
  };
  
  // If we don't have timeline data for this service, use default scoring
  if (!serviceOptimalTimelines[serviceType]) {
    return 0.6; // Default neutral score
  }
  
  const timeline = serviceOptimalTimelines[serviceType];
  
  // Calculate score based on how close the timeframe is to this service's ideal timeline
  if (estimatedWeeks < timeline.min) {
    // Too short - calculate fraction of minimum
    const fraction = estimatedWeeks / timeline.min;
    return Math.max(0.2, fraction * 0.6); // Score between 0.2-0.6
  } 
  else if (estimatedWeeks <= timeline.ideal) {
    // Within ideal range (min to ideal)
    const positionInRange = (estimatedWeeks - timeline.min) / (timeline.ideal - timeline.min);
    return 0.7 + (positionInRange * 0.3); // Score between 0.7-1.0
  }
  else if (estimatedWeeks <= timeline.max) {
    // Above ideal but within max
    const positionInRange = 1 - ((estimatedWeeks - timeline.ideal) / (timeline.max - timeline.ideal));
    return 0.5 + (positionInRange * 0.2); // Score between 0.5-0.7
  } 
  else {
    // Beyond maximum effective timeframe
    return 0.5; // Still somewhat useful, but not ideal
  }
}

/**
 * NEW: Score professionals based on user's personal context
 */
function scorePersonalContext(
  scored: ScoredProfessional, 
  personalContext: string[],
  practitioner: Practitioner
): number {
  let contextScore = 0;
  
  // Check for specific context factors
  personalContext.forEach(context => {
    const contextLower = context.toLowerCase();
    
    // Check for first-time vs experienced client context
    if (contextLower.includes('first time') || contextLower.includes('never before')) {
      // Coaches and family medicine are good for first-timers
      if (['coaching', 'family-medicine'].includes(practitioner.serviceType)) {
        contextScore += 0.3;
        scored.factors["beginner_friendly"] = 0.3;
      }
    }
    
    // Check for busy lifestyle context
    if (contextLower.includes('busy') || contextLower.includes('time constraint') || 
        contextLower.includes('working parent') || contextLower.includes('no time')) {
      // Online services are better for busy people
      if (practitioner.isOnline) {
        contextScore += 0.3;
        scored.factors["convenient_for_busy"] = 0.3;
      }
      
      // Practitioners with flexible schedules
      if (practitioner.availability && 
          (practitioner.availability.includes('flexible') || 
           practitioner.availability.includes('weekends'))) {
        contextScore += 0.25;
        scored.factors["flexible_scheduling"] = 0.25;
      }
    }
    
    // Check for age-related context
    if (contextLower.includes('senior') || contextLower.includes('elderly') || 
        contextLower.includes('older adult')) {
      // Special consideration for practitioners that work well with seniors
      if (['physiotherapist', 'family-medicine', 'cardiology'].includes(practitioner.serviceType)) {
        contextScore += 0.3;
        scored.factors["senior_appropriate"] = 0.3;
      }
    }
    
    // Check for recovery context
    if (contextLower.includes('injury') || contextLower.includes('surgery') || 
        contextLower.includes('recovery')) {
      // Rehabilitation specialists are best for recovery
      if (['physiotherapist', 'biokineticist', 'orthopedics'].includes(practitioner.serviceType)) {
        contextScore += 0.4;
        scored.factors["recovery_specialist"] = 0.4;
      }
    }
    
    // Check for competition/performance context
    if (contextLower.includes('competition') || contextLower.includes('athlete') || 
        contextLower.includes('performance') || contextLower.includes('race') || 
        contextLower.includes('marathon')) {
      // Performance specialists
      if (['personal-trainer', 'coaching', 'biokineticist', 'sports-medicine'].includes(practitioner.serviceType)) {
        contextScore += 0.35;
        scored.factors["performance_specialist"] = 0.35;
      }
    }
  });
  
  return contextScore;
}

/**
 * NEW: Score based on user preferences
 */
function scorePreferences(
  scored: ScoredProfessional,
  preferences: Record<string, any>,
  practitioner: Practitioner
): number {
  let preferenceScore = 0;
  
  // Handle location preference
  if (preferences.preferLocation && practitioner.location) {
    if (practitioner.location.toLowerCase().includes(preferences.preferLocation.toLowerCase())) {
      preferenceScore += 0.3;
      scored.factors["preferred_location"] = 0.3;
    }
  }
  
  // Handle online vs in-person preference
  if (preferences.preferOnline !== undefined) {
    if ((preferences.preferOnline && practitioner.isOnline) || 
        (!preferences.preferOnline && !practitioner.isOnline)) {
      preferenceScore += 0.35;
      scored.factors["delivery_preference"] = 0.35;
    }
  }
  
  // Handle experience level preference
  if (preferences.experienceLevel && practitioner.bio) {
    const yearsMatch = practitioner.bio.match(/(\d+)\s*years? experience/i);
    if (yearsMatch && yearsMatch[1]) {
      const years = parseInt(yearsMatch[1]);
      
      // If user prefers experienced practitioners and this one has 5+ years
      if (preferences.experienceLevel === 'experienced' && years >= 5) {
        preferenceScore += 0.25;
        scored.factors["experienced_practitioner"] = 0.25;
      }
      // If user prefers newer practitioners and this one has less than 5 years
      else if (preferences.experienceLevel === 'newer' && years < 5) {
        preferenceScore += 0.25;
        scored.factors["newer_practitioner"] = 0.25;
      }
    }
  }
  
  // Handle gender preference (if applicable and available in data)
  if (preferences.genderPreference && practitioner.gender) {
    if (preferences.genderPreference === practitioner.gender) {
      preferenceScore += 0.25;
      scored.factors["gender_preference"] = 0.25;
    }
  }
  
  return preferenceScore;
}

/**
 * Adjust scores based on how well practitioners would work together in complex cases
 * Enhanced with more detailed synergy relationships
 */
function adjustForComplexity(
  scored: ScoredProfessional, 
  allPractitioners: Practitioner[]
) {
  const practitioner = scored.practitioner;
  
  // Define synergistic combinations for specific service types
  const synergies: Partial<Record<ServiceCategory, {
    highSynergy: ServiceCategory[], 
    moderateSynergy: ServiceCategory[]
  }>> = {
    "dietician": {
      highSynergy: ["personal-trainer", "endocrinology"],
      moderateSynergy: ["coaching", "family-medicine", "gastroenterology"]
    },
    "personal-trainer": {
      highSynergy: ["physiotherapist", "dietician"],
      moderateSynergy: ["coaching", "cardiology", "orthopedics"]
    },
    "physiotherapist": {
      highSynergy: ["personal-trainer", "orthopedics"],
      moderateSynergy: ["biokineticist", "pain-management"]
    },
    "psychiatry": {
      highSynergy: ["coaching", "family-medicine"],
      moderateSynergy: ["dietician", "personal-trainer"]
    },
    "cardiology": {
      highSynergy: ["dietician", "family-medicine"],
      moderateSynergy: ["personal-trainer", "endocrinology"]
    },
    "coaching": {
      highSynergy: ["psychiatry", "personal-trainer"],
      moderateSynergy: ["dietician", "family-medicine"]
    },
    "gastroenterology": {
      highSynergy: ["dietician", "family-medicine"],
      moderateSynergy: ["endocrinology"]
    },
    "family-medicine": {
      highSynergy: ["psychiatry", "dietician"],
      moderateSynergy: ["coaching", "personal-trainer", "physiotherapist"]
    }
  };
  
  // Check if this practitioner has synergies with other high-ranking practitioners
  const serviceSynergies = synergies[practitioner.serviceType];
  if (serviceSynergies) {
    // Check for high-synergy partners
    const hasHighSynergy = allPractitioners.some(other => 
      other.id !== practitioner.id && 
      serviceSynergies.highSynergy.includes(other.serviceType as ServiceCategory)
    );
    
    if (hasHighSynergy) {
      const synergisticBoost = SCORING_WEIGHTS.SYNERGY_BOOST * 1.5; // Higher boost for high synergy
      scored.score += synergisticBoost;
      scored.factors["high_synergy_boost"] = synergisticBoost;
      console.log(`Giving ${practitioner.name} high synergy boost: +${synergisticBoost}`);
    }
    
    // Check for moderate-synergy partners
    const hasModSynergy = allPractitioners.some(other => 
      other.id !== practitioner.id && 
      serviceSynergies.moderateSynergy.includes(other.serviceType as ServiceCategory)
    );
    
    if (hasModSynergy) {
      scored.score += SCORING_WEIGHTS.SYNERGY_BOOST;
      scored.factors["moderate_synergy_boost"] = SCORING_WEIGHTS.SYNERGY_BOOST;
      console.log(`Giving ${practitioner.name} moderate synergy boost: +${SCORING_WEIGHTS.SYNERGY_BOOST}`);
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
 * More sophisticated detection of complex cases that require multidisciplinary approach
 * Returns true if the case is complex, false if it's simple
 */
export function isComplexCase(
  symptoms: string[], 
  goals: string[],
  userQuery: string
): boolean {
  // Basic complexity - number of symptoms and goals
  const baseComplexity = symptoms.length + goals.length;
  
  // Check for chronic conditions or multiple issues
  const hasChronic = symptoms.some(s => 
    s.toLowerCase().includes('chronic') || 
    s.toLowerCase().includes('recurring') ||
    s.toLowerCase().includes('long-term')
  );
  
  // Check for comorbidities - multiple medical conditions that often require coordinated care
  const hasComorbidities = 
    (symptoms.some(s => s.toLowerCase().includes('diabetes')) && symptoms.some(s => s.toLowerCase().includes('heart'))) ||
    (symptoms.some(s => s.toLowerCase().includes('pain')) && symptoms.some(s => s.toLowerCase().includes('depression'))) ||
    (symptoms.some(s => s.toLowerCase().includes('stomach')) && symptoms.some(s => s.toLowerCase().includes('anxiety')));
  
  // Check for combination of physical and mental health issues
  const hasPhysicalIssues = symptoms.some(s => 
    s.toLowerCase().includes('pain') || 
    s.toLowerCase().includes('injury') ||
    s.toLowerCase().includes('mobility') ||
    s.toLowerCase().includes('heart') ||
    s.toLowerCase().includes('lung') ||
    s.toLowerCase().includes('stomach') ||
    s.toLowerCase().includes('weight') ||
    s.toLowerCase().includes('sleep')
  );
  
  const hasMentalHealthIssues = symptoms.some(s => 
    s.toLowerCase().includes('anxiety') || 
    s.toLowerCase().includes('depression') ||
    s.toLowerCase().includes('stress') ||
    s.toLowerCase().includes('mental health') ||
    s.toLowerCase().includes('focus') ||
    s.toLowerCase().includes('mood') ||
    s.toLowerCase().includes('addiction')
  );
  
  const hasMixedHealthIssues = hasPhysicalIssues && hasMentalHealthIssues;
  
  // Check for keywords that indicate complexity
  const complexityKeywords = [
    'multiple issues', 'several problems', 'chronic', 'recurring',
    'for years', 'complicated', 'complex', 'many symptoms', 'comorbid',
    'tried everything', 'nothing works', 'specialist', 'second opinion',
    'previous treatment failed', 'long-standing', 'persistent',
    'severe', 'debilitating', 'getting worse', 'progressive'
  ];
  
  const keywordMatches = complexityKeywords.filter(k => userQuery.toLowerCase().includes(k));
  const hasComplexityKeywords = keywordMatches.length > 0;
  
  // Check for explicit mention of multiple unrelated goals
  const diverseGoalsPatterns = [
    // Fitness + Mental health
    (goals.some(g => g.includes('weight') || g.includes('fitness')) && 
     goals.some(g => g.includes('stress') || g.includes('anxiety'))),
    // Physical recovery + Performance
    (goals.some(g => g.includes('recovery') || g.includes('injury')) && 
     goals.some(g => g.includes('performance') || g.includes('race'))),
    // Nutrition + Chronic condition management
    (goals.some(g => g.includes('diet') || g.includes('nutrition')) && 
     symptoms.some(s => s.includes('chronic') || s.includes('manage')))
  ];
  
  const hasDiverseGoals = diverseGoalsPatterns.some(pattern => pattern === true);
  
  // Advanced decision logic:
  // Complex if ANY of the following:
  return (
    baseComplexity >= 4 ||                   // More than 4 symptoms/goals combined
    hasChronic ||                           // Has any chronic condition
    hasComplexityKeywords ||                // Explicitly mentions complexity keywords
    (baseComplexity >= 3 && hasMixedHealthIssues) || // 3+ issues with mixed physical/mental
    hasComorbidities ||                     // Has known comorbidities
    (baseComplexity >= 2 && keywordMatches.length >= 2) || // Multiple symptoms with multiple complexity indicators
    hasDiverseGoals                         // Has diverse unrelated goals
  );
}

/**
 * Build an optimized plan based on scored professionals, applying budget and timeline constraints
 * Enhanced with more intelligent selection and explanation generation
 */
export function buildOptimizedPlan(
  scoredProfessionals: ScoredProfessional[],
  budget?: number,
  timeframe?: string,
  complexity?: number,
  personalContext?: string[],
  preferences?: Record<string, any>
): {
  professionals: Practitioner[];
  totalCost: number;
  explanations: string[];
} {
  const plan: Practitioner[] = [];
  const explanations: string[] = [];
  let totalCost = 0;
  
  // Determine if this is a complex case requiring multiple professionals
  const needsMultidisciplinary = complexity !== undefined && complexity > 3;
  
  // Determine max professionals based on complexity
  const maxProfessionals = needsMultidisciplinary ? 3 : 
                           complexity && complexity > 1 ? 2 : 1;
  
  console.log(`Building plan with max ${maxProfessionals} professionals, budget ${budget}, complexity ${complexity}`);
  
  // Make a copy of scored professionals to work with
  const workingScoredPros = [...scoredProfessionals];
  
  // First pass: add highest scoring professionals until we hit constraints
  while (plan.length < maxProfessionals && workingScoredPros.length > 0) {
    // Get the highest scoring professional from remaining options
    const nextBestPro = workingScoredPros.shift()!;
    
    // Check budget constraint
    const newTotalCost = totalCost + (nextBestPro.practitioner.pricePerSession * 4); // 4 sessions per month
    if (budget && newTotalCost > budget) {
      console.log(`Skipping ${nextBestPro.practitioner.name} as adding would exceed budget`);
      continue;
    }
    
    // Check for service redundancy - avoid multiple practitioners of same type unless explicitly complex
    if (plan.some(p => p.serviceType === nextBestPro.practitioner.serviceType) && !needsMultidisciplinary) {
      console.log(`Skipping ${nextBestPro.practitioner.name} as we already have a ${nextBestPro.practitioner.serviceType}`);
      continue;
    }
    
    // Add to plan
    plan.push(nextBestPro.practitioner);
    totalCost = newTotalCost;
    
    // Generate explanation for this professional (more personalized)
    const explanation = generateEnhancedExplanation(nextBestPro, personalContext, preferences, plan.length);
    explanations.push(explanation);
    
    console.log(`Added ${nextBestPro.practitioner.name} to plan, total cost now: ${totalCost}`);
  }
  
  // If we're over budget, adjust the plan
  if (budget && totalCost > budget && plan.length > 0) {
    const adjustedPlan = adjustPlanForBudget(plan, budget, scoredProfessionals);
    
    if (adjustedPlan.changed) {
      plan.length = 0; // Clear the current plan
      plan.push(...adjustedPlan.plan); // Add the adjusted plan
      
      // Add budget adjustment explanation
      explanations.push(adjustedPlan.explanation);
      
      // Update total cost
      totalCost = plan.reduce((sum, pro) => sum + (pro.pricePerSession * 4), 0);
      
      console.log(`Plan adjusted for budget: new total cost ${totalCost}`);
    }
  }
  
  // If we couldn't add any professionals due to budget, try with the cheapest option
  if (plan.length === 0 && budget) {
    const cheapestPro = scoredProfessionals
      .sort((a, b) => a.practitioner.pricePerSession - b.practitioner.pricePerSession)[0];
      
    if (cheapestPro) {
      plan.push(cheapestPro.practitioner);
      totalCost = cheapestPro.practitioner.pricePerSession * 4; // 4 sessions per month
      
      // More tailored explanation for budget-constrained selection
      const budgetExplanation = `${cheapestPro.practitioner.name} was selected as the most affordable option within your budget of R${budget}. While they may not be the ideal specialist for all your needs, they provide the best value given your financial constraints.`;
      explanations.push(budgetExplanation);
      
      console.log(`Added ${cheapestPro.practitioner.name} as budget-constrained option`);
    }
  }
  
  // If we have a complex case but ended up with only one professional,
  // add a note explaining the limitations
  if (needsMultidisciplinary && plan.length === 1 && budget) {
    const limitationNote = `Note: Your situation would ideally benefit from a multidisciplinary approach with multiple professionals, but budget constraints limit our recommendation to a single professional. Consider increasing your budget or focusing on one goal at a time for better results.`;
    explanations.push(limitationNote);
  }
  
  // If plan is empty (should rarely happen), add a fallback explanation
  if (plan.length === 0) {
    explanations.push("We couldn't find suitable professionals matching your criteria. Please consider adjusting your budget or requirements.");
  }
  
  return {
    professionals: plan,
    totalCost,
    explanations
  };
}

/**
 * Improved budget adjustment with more intelligent replacements
 */
function adjustPlanForBudget(
  currentPlan: Practitioner[], 
  budget: number,
  allScoredPros: ScoredProfessional[]
): {
  plan: Practitioner[];
  changed: boolean;
  explanation: string;
} {
  // Calculate current cost (4 sessions per professional)
  const currentCost = currentPlan.reduce((sum, pro) => sum + (pro.pricePerSession * 4), 0);
  
  // If already within budget, return unchanged
  if (currentCost <= budget) {
    return { 
      plan: currentPlan, 
      changed: false, 
      explanation: "" 
    };
  }
  
  // Create a copy to modify
  const adjustedPlan = [...currentPlan];
  
  // Identify all possible replacement candidates from our scored list
  const replacementCandidates = allScoredPros.filter(scored => 
    !currentPlan.some(p => p.id === scored.practitioner.id)
  );
  
  // Start with a high-level strategy
  const budgetDeficit = currentCost - budget;
  const averageSavingsNeeded = budgetDeficit / currentPlan.length;
  
  // Sort the current plan by price (most expensive first)
  const planByPrice = [...adjustedPlan].sort(
    (a, b) => b.pricePerSession - a.pricePerSession
  );
  
  // Track replaced professionals for explanation
  const replacements: Array<{old: Practitioner, new: Practitioner, saving: number}> = [];
  
  // Try replacing expensive professionals with more affordable alternatives
  for (const expensivePro of planByPrice) {
    // Only continue if we're still over budget
    const currentAdjustedCost = adjustedPlan.reduce(
      (sum, pro) => sum + (pro.pricePerSession * 4), 0
    );
    
    if (currentAdjustedCost <= budget) break;
    
    // Find cheaper alternatives with the same service type, sorted by highest score
    const alternatives = replacementCandidates
      .filter(scored => 
        scored.practitioner.serviceType === expensivePro.serviceType && 
        scored.practitioner.pricePerSession < expensivePro.pricePerSession
      )
      .sort((a, b) => b.score - a.score);
    
    if (alternatives.length > 0) {
      // Find the index of the expensive pro
      const index = adjustedPlan.findIndex(p => p.id === expensivePro.id);
      
      // Find the best alternative that makes a significant difference
      const bestAlternative = alternatives[0];
      const savings = (expensivePro.pricePerSession - bestAlternative.practitioner.pricePerSession) * 4;
      
      // Replace with the best alternative
      replacements.push({
        old: expensivePro, 
        new: bestAlternative.practitioner, 
        saving: savings
      });
      
      adjustedPlan[index] = bestAlternative.practitioner;
      
      // Check if we're now under budget
      const newCost = adjustedPlan.reduce(
        (sum, pro) => sum + (pro.pricePerSession * 4), 0
      );
      
      if (newCost <= budget) {
        break;
      }
    }
  }
  
  // If we still can't fit within budget and have multiple professionals, 
  // try removing the lowest-scored professional
  const currentAdjustedCost = adjustedPlan.reduce(
    (sum, pro) => sum + (pro.pricePerSession * 4), 0
  );
  
  if (currentAdjustedCost > budget && adjustedPlan.length > 1) {
    // Map the adjusted plan back to scored professionals
    const adjustedScored = adjustedPlan.map(pro => 
      allScoredPros.find(scored => scored.practitioner.id === pro.id)
    ).filter(Boolean) as ScoredProfessional[];
    
    // Sort by score (lowest first)
    adjustedScored.sort((a, b) => a.score - b.score);
    
    if (adjustedScored.length > 0) {
      // Remove the lowest scoring professional
      const lowestScored = adjustedScored[0];
      const removedPro = lowestScored.practitioner;
      
      // Add to our tracking
      replacements.push({
        old: removedPro, 
        new: {} as Practitioner, // Empty to indicate removal
        saving: removedPro.pricePerSession * 4
      });
      
      // Remove the professional
      adjustedPlan.splice(
        adjustedPlan.findIndex(p => p.id === lowestScored.practitioner.id),
        1
      );
    }
  }
  
  // Generate detailed explanation for the adjustment
  let explanation = "";
  if (replacements.length > 0) {
    if (replacements.length === 1 && "id" in replacements[0].new) {
      // Single replacement
      const rep = replacements[0];
      explanation = `To fit within your budget of R${budget}, we've replaced ${rep.old.name} (R${rep.old.pricePerSession}/session) with ${rep.new.name} (R${rep.new.pricePerSession}/session), who offers similar services at a more affordable rate. This saves you R${rep.saving} per month while still addressing your needs.`;
    } 
    else if (replacements.some(r => !("id" in r.new))) {
      // We had to remove a professional entirely
      const removed = replacements.find(r => !("id" in r.new))!;
      explanation = `To stay within your budget of R${budget}, we've had to focus on the most essential services and remove ${removed.old.name} (R${removed.old.pricePerSession}/session) from your plan. You might consider addressing this need separately or increasing your budget for a more comprehensive plan.`;
    }
    else {
      // Multiple replacements
      const totalSavings = replacements.reduce((sum, r) => sum + r.saving, 0);
      explanation = `To fit within your budget of R${budget}, we've made ${replacements.length} adjustments to your plan, replacing more expensive professionals with more affordable alternatives offering similar services. This saves you approximately R${totalSavings} per month.`;
    }
  }
  else {
    explanation = `To stay within your budget constraints, we've optimized your plan for the best value while addressing your key needs.`;
  }
  
  return {
    plan: adjustedPlan,
    changed: replacements.length > 0,
    explanation
  };
}

/**
 * Generate a detailed, personalized explanation for why a professional was selected
 */
function generateEnhancedExplanation(
  scored: ScoredProfessional,
  personalContext?: string[],
  preferences?: Record<string, any>,
  professionalNumber: number = 1
): string {
  const pro = scored.practitioner;
  const factors = Object.entries(scored.factors)
    .sort((a, b) => b[1] - a[1]);
  
  // Position-based prefixes for a more engaging read
  const positionPrefix = professionalNumber === 1 ? 
    "As your primary specialist, " : 
    professionalNumber === 2 ? 
    "To complement your primary care, " : 
    "Rounding out your team, ";
  
  // Build a personalized explanation based on the scoring factors
  let explanation = `${positionPrefix}${pro.name} (${pro.serviceType.replace('-', ' ')}) `;
  
  // Add primary reasons (top 2-3 factors)
  if (factors.length > 0) {
    explanation += "was selected because ";
    
    // Group factors by type for more natural language
    const symptomFactors = factors.filter(f => 
      f[0].startsWith('primary_for_') || 
      f[0].startsWith('specialty_for_') || 
      f[0].startsWith('secondary_for_')
    );
    
    const goalFactors = factors.filter(f => 
      f[0].startsWith('direct_goal_match_') || 
      f[0].startsWith('semantic_goal_match_') ||
      f[0].startsWith('tag_match_')
    );
    
    const budgetFactors = factors.filter(f => 
      f[0].includes('budget') || f[0].includes('cost')
    );
    
    const timelineFactors = factors.filter(f => 
      f[0].includes('timeline') || f[0].includes('time')
    );
    
    const contextFactors = factors.filter(f => 
      !symptomFactors.includes(f) && 
      !goalFactors.includes(f) && 
      !budgetFactors.includes(f) && 
      !timelineFactors.includes(f)
    );
    
    // Create explanation components
    const components: string[] = [];
    
    // Add symptom expertise
    if (symptomFactors.length > 0) {
      const symptomNames = symptomFactors.map(f => {
        const match = f[0].match(/_(for|to)_(.+)$/);
        return match ? match[2].replace(/_/g, ' ') : '';
      }).filter(Boolean);
      
      if (symptomNames.length === 1) {
        components.push(`they specialize in ${symptomNames[0]}`);
      } else if (symptomNames.length > 1) {
        const lastSymptom = symptomNames.pop();
        components.push(`they have expertise in ${symptomNames.join(', ')} and ${lastSymptom}`);
      }
    }
    
    // Add goal alignment
    if (goalFactors.length > 0) {
      const goalNames = goalFactors.map(f => {
        const match = f[0].match(/match_(.+)$/);
        return match ? match[1].replace(/_/g, ' ') : '';
      }).filter(Boolean);
      
      if (goalNames.length === 1) {
        components.push(`they're experienced in helping clients with ${goalNames[0]}`);
      } else if (goalNames.length > 1) {
        const lastGoal = goalNames.pop();
        components.push(`they excel at helping clients achieve ${goalNames.join(', ')} and ${lastGoal}`);
      }
    }
    
    // Add budget consideration
    if (budgetFactors.some(f => f[1] > 0)) {
      components.push(`they provide excellent value within your budget`);
    }
    
    // Add timeline consideration
    if (timelineFactors.some(f => f[1] > 0)) {
      components.push(`they're well-suited to your timeframe`);
    }
    
    // Add any other important factors
    contextFactors.slice(0, 2).forEach(factor => {
      const [key, value] = factor;
      
      if (key === 'explicit_mention') {
        components.push(`you specifically mentioned needing this type of service`);
      }
      else if (key === 'synergy_boost' || key === 'high_synergy_boost') {
        components.push(`they work well with the other professionals in your plan`);
      }
      else if (key === 'performance_specialist') {
        components.push(`they have experience working with competitive athletes`);
      }
      else if (key === 'recovery_specialist') {
        components.push(`they specialize in recovery and rehabilitation`);
      }
      else if (key === 'senior_appropriate') {
        components.push(`they have expertise working with older adults`);
      }
      else if (key === 'beginner_friendly') {
        components.push(`they're excellent with first-time clients`);
      }
      else if (key === 'flexible_scheduling') {
        components.push(`they offer flexible scheduling to accommodate your busy lifestyle`);
      }
    });
    
    // Join components with appropriate connectors
    if (components.length === 1) {
      explanation += components[0];
    } 
    else if (components.length === 2) {
      explanation += `${components[0]} and ${components[1]}`;
    }
    else if (components.length > 2) {
      const lastComponent = components.pop();
      explanation += `${components.join(', ')}, and ${lastComponent}`;
    }
    else {
      explanation += `they're a great match for your overall needs`;
    }
  } 
  else {
    explanation += `was selected because they're a good match for your overall requirements`;
  }
  
  // Add more specific information
  if (pro.rating) {
    explanation += `. They have a client rating of ${pro.rating}/5`;
  }
  
  // Add price
  explanation += `. Sessions cost R${pro.pricePerSession} each`;
  
  // Add location/online info
  if (pro.isOnline && pro.location) {
    explanation += ` and they offer both online and in-person sessions in ${pro.location}`;
  } else if (pro.isOnline) {
    explanation += ` and they're available for convenient online sessions`;
  } else if (pro.location) {
    explanation += ` at their practice in ${pro.location}`;
  }
  
  explanation += '.';
  
  return explanation;
}

