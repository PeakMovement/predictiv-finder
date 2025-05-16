import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappings";

/**
 * Enhanced interface for professional matching results
 */
export interface EnhancedMatchResult {
  category: ServiceCategory;
  score: number;
  primaryCondition?: string;
  matchReasons: string[];
  relevance: "high" | "medium" | "low";
}

/**
 * Enhanced professional matcher that uses contextual clues and semantic understanding
 * to better match health professionals to user needs
 */
export function matchProfessionalsEnhanced(
  conditions: string[],
  symptoms: string[],
  goals: string[],
  severityScores: Record<string, number>,
  budget?: number,
  isUrgent: boolean = false
): EnhancedMatchResult[] {
  // Initialize the matches record with all service categories
  const matches: Record<ServiceCategory, { 
    score: number, 
    reasons: string[], 
    primaryCondition?: string 
  }> = {} as Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>;
  
  console.log("Enhanced matching with:", { conditions, symptoms, goals, budget, isUrgent });
  
  // Initialize with zero scores for all service categories
  const serviceCategories: ServiceCategory[] = [
    'physiotherapist', 'biokineticist', 'dietician', 'personal-trainer',
    'pain-management', 'coaching', 'psychology', 'psychiatry',
    'podiatrist', 'general-practitioner', 'sport-physician', 'orthopedic-surgeon',
    'family-medicine', 'gastroenterology', 'massage-therapy', 'nutrition-coaching',
    'strength-coaching', 'run-coaches', 'occupational-therapy', 'physical-therapy', 
    'chiropractor', 'nurse-practitioner', 'cardiology', 'dermatology', 
    'neurology', 'endocrinology', 'urology', 'oncology',
    'rheumatology', 'pediatrics', 'geriatrics', 'sports-medicine', 'internal-medicine',
    'orthopedics', 'neurosurgery', 'infectious-disease', 'plastic-surgery',
    'obstetrics-gynecology', 'emergency-medicine', 'anesthesiology', 'radiology',
    'geriatric-medicine', 'all'
  ];
  
  serviceCategories.forEach(category => {
    matches[category] = { score: 0, reasons: [] };
  });
  
  // 1. Match based on specific conditions
  matchConditions(conditions, severityScores, matches);
  
  // 2. Match based on symptoms
  matchSymptoms(symptoms, severityScores, matches);
  
  // 3. Apply goal-based adjustments
  applyGoalAdjustments(goals, matches);
  
  // 4. Apply budget constraints if provided
  if (budget !== undefined) {
    applyBudgetAdjustments(budget, matches);
  }
  
  // 5. Handle urgency factors
  if (isUrgent) {
    applyUrgencyAdjustments(matches);
  }
  
  // 6. Apply multi-factor bonuses for comprehensive solutions
  applyMultiFactorBonuses(conditions, symptoms, goals, matches);
  
  // Convert to sorted array of results
  return Object.entries(matches)
    .map(([category, data]): EnhancedMatchResult => ({
      category: category as ServiceCategory,
      score: data.score,
      primaryCondition: data.primaryCondition,
      matchReasons: data.reasons,
      relevance: determineRelevance(data.score)
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Match conditions to professional categories
 */
function matchConditions(
  conditions: string[],
  severityScores: Record<string, number>,
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  // Enhanced condition-to-service mappings with severity adjustments
  const conditionMappings: Record<string, Array<{category: ServiceCategory, weight: number, primary?: boolean}>> = {
    'back pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'orthopedics', weight: 0.8 },
      { category: 'pain-management', weight: 0.7 },
      { category: 'biokineticist', weight: 0.6 }
    ],
    'knee pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'orthopedics', weight: 0.8 },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'shoulder pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'orthopedics', weight: 0.8 },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'neck pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'biokineticist', weight: 0.7 },
      { category: 'pain-management', weight: 0.7 }
    ],
    'weight loss': [
      { category: 'dietician', weight: 0.9, primary: true },
      { category: 'personal-trainer', weight: 0.8 },
      { category: 'coaching', weight: 0.7 },
      { category: 'endocrinology', weight: 0.6 }
    ],
    'insulin resistance': [
      { category: 'dietician', weight: 0.9, primary: true },
      { category: 'endocrinology', weight: 0.85 },
      { category: 'family-medicine', weight: 0.7 }
    ],
    'diabetes': [
      { category: 'endocrinology', weight: 0.9, primary: true },
      { category: 'dietician', weight: 0.85 },
      { category: 'family-medicine', weight: 0.75 }
    ],
    'fitness': [
      { category: 'personal-trainer', weight: 0.9, primary: true },
      { category: 'biokineticist', weight: 0.7 },
      { category: 'coaching', weight: 0.6 }
    ],
    'strength training': [
      { category: 'personal-trainer', weight: 0.9, primary: true },
      { category: 'biokineticist', weight: 0.8 }
    ],
    'running': [
      { category: 'personal-trainer', weight: 0.8, primary: true },
      { category: 'coaching', weight: 0.8 },
      { category: 'physiotherapist', weight: 0.6 }
    ],
    'bloating': [
      { category: 'gastroenterology', weight: 0.9, primary: true },
      { category: 'dietician', weight: 0.8 }
    ],
    'digestive issues': [
      { category: 'gastroenterology', weight: 0.9, primary: true },
      { category: 'dietician', weight: 0.8 }
    ],
    'fatigue': [
      { category: 'family-medicine', weight: 0.8 },
      { category: 'endocrinology', weight: 0.7 },
      { category: 'dietician', weight: 0.6 }
    ],
    'poor concentration': [
      { category: 'psychiatry', weight: 0.8 },
      { category: 'family-medicine', weight: 0.7 }
    ],
    'anxiety': [
      { category: 'psychiatry', weight: 0.9, primary: true },
      { category: 'coaching', weight: 0.7 }
    ],
    'depression': [
      { category: 'psychiatry', weight: 0.9, primary: true },
      { category: 'coaching', weight: 0.6 }
    ],
    'stress': [
      { category: 'psychiatry', weight: 0.8 },
      { category: 'coaching', weight: 0.8 }
    ],
    'burnout': [
      { category: 'psychiatry', weight: 0.8, primary: true },
      { category: 'coaching', weight: 0.8 }
    ],
    'triathlon': [
      { category: 'coaching', weight: 0.9, primary: true },
      { category: 'personal-trainer', weight: 0.8 },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'hip pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'orthopedics', weight: 0.8 },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'calf pain': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'biokineticist', weight: 0.8 }
    ],
    'injury': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'sports-medicine', weight: 0.8 }
    ],
    'recovery': [
      { category: 'physiotherapist', weight: 0.8 },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'posture': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'biokineticist', weight: 0.7 }
    ],
    'core weakness': [
      { category: 'physiotherapist', weight: 0.8, primary: true },
      { category: 'personal-trainer', weight: 0.7 },
      { category: 'biokineticist', weight: 0.75 }
    ],
    'gut health': [
      { category: 'dietician', weight: 0.9, primary: true },
      { category: 'gastroenterology', weight: 0.8 }
    ],
    'postpartum': [
      { category: 'physiotherapist', weight: 0.9, primary: true },
      { category: 'personal-trainer', weight: 0.7 }
    ],
    'low energy': [
      { category: 'dietician', weight: 0.8 },
      { category: 'family-medicine', weight: 0.7 },
      { category: 'endocrinology', weight: 0.6 }
    ]
  };
  
  // Apply condition matching with severity adjustments
  conditions.forEach(condition => {
    const conditionLower = condition.toLowerCase();
    const mappings = conditionMappings[conditionLower];
    
    if (mappings) {
      const severity = severityScores[conditionLower] || 0.5;
      
      mappings.forEach(mapping => {
        // Adjust weight based on severity
        let adjustedWeight = mapping.weight;
        if (severity > 0.7) {
          // For high severity, boost medical professionals
          if (['family-medicine', 'orthopedics', 'gastroenterology', 'psychiatry'].includes(mapping.category)) {
            adjustedWeight *= 1.2;
          }
        }
        
        // Apply the score
        matches[mapping.category].score += adjustedWeight;
        matches[mapping.category].reasons.push(`Matches condition: ${condition}`);
        
        // Set as primary condition if marked as primary
        if (mapping.primary && !matches[mapping.category].primaryCondition) {
          matches[mapping.category].primaryCondition = condition;
        }
      });
      
      console.log(`Matched condition "${condition}" with severity ${severity}`);
    }
  });
}

/**
 * Match symptoms to professional categories
 */
function matchSymptoms(
  symptoms: string[],
  severityScores: Record<string, number>,
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom.toLowerCase()];
    
    if (mapping) {
      const severity = severityScores[symptom] || 0.5;
      
      // Add the primary category
      const primaryCategory = mapping.primary;
      matches[primaryCategory].score += 0.8 * (severity + 0.5); // Scale by severity
      matches[primaryCategory].reasons.push(`Primary match for symptom: ${symptom}`);
      
      if (!matches[primaryCategory].primaryCondition) {
        matches[primaryCategory].primaryCondition = symptom;
      }
      
      // Add secondary categories with lower weights
      (mapping.specialties || []).forEach(specialty => {
        if (specialty !== primaryCategory) {
          matches[specialty].score += 0.5 * (severity + 0.5);
          matches[specialty].reasons.push(`Secondary match for symptom: ${symptom}`);
        }
      });
      
      // Tertiary connections
      (mapping.secondary || []).forEach(secondary => {
        matches[secondary].score += 0.3 * (severity + 0.5);
        matches[secondary].reasons.push(`Complementary for symptom: ${symptom}`);
      });
      
      console.log(`Matched symptom "${symptom}" with severity ${severity}`);
    }
  });
}

/**
 * Apply goal-based adjustments to matches
 */
function applyGoalAdjustments(
  goals: string[],
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  goals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    
    // Weight loss and fitness goals
    if (goalLower.includes('weight') || goalLower.includes('fit') || 
        goalLower.includes('tone') || goalLower.includes('strong')) {
      if (matches['dietician']) matches['dietician'].score += 0.8;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.7;
      if (matches['coaching']) matches['coaching'].score += 0.5;
      if (matches['endocrinology']) matches['endocrinology'].score += 0.3;
      
      if (matches['dietician']) matches['dietician'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['endocrinology']) matches['endocrinology'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Strength goals
    if (goalLower.includes('strength')) {
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.8;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.7;
      
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Fitness goals
    if (goalLower.includes('fit') || goalLower.includes('tone') || goalLower.includes('strong')) {
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.8;
      if (matches['coaching']) matches['coaching'].score += 0.6;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.5;
      
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Running goals
    if (goalLower.includes('run') || goalLower.includes('running')) {
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.8;
      if (matches['coaching']) matches['coaching'].score += 0.8;
      if (matches['physiotherapist']) matches['physiotherapist'].score += 0.6;
      
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Training goals
    if (goalLower.includes('train') || goalLower.includes('training')) {
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.7;
      if (matches['coaching']) matches['coaching'].score += 0.6;
      
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Motivation goals
    if (goalLower.includes('motivation')) {
      if (matches['coaching']) matches['coaching'].score += 0.8;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.5;
      
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Nutrition goals
    if (goalLower.includes('nut') || goalLower.includes('nutr')) {
      if (matches['dietician']) matches['dietician'].score += 0.8;
      if (matches['nutrition-coach']) matches['nutrition-coach'].score += 0.6;
      
      if (matches['dietician']) matches['dietician'].reasons.push(`Matches goal: ${goal}`);
      if (matches['nutrition-coach']) matches['nutrition-coach'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Recovery goals
    if (goalLower.includes('recov') || goalLower.includes('recov')) {
      if (matches['physiotherapist']) matches['physiotherapist'].score += 0.8;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.7;
      
      if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Triathlon goals
    if (goalLower.includes('triathlon')) {
      if (matches['coaching']) matches['coaching'].score += 0.9;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.8;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.7;
      
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Lifestyle goals
    if (goalLower.includes('lif') || goalLower.includes('lif')) {
      if (matches['coaching']) matches['coaching'].score += 0.7;
      if (matches['dietician']) matches['dietician'].score += 0.5;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.5;
      
      if (matches['coaching']) matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      if (matches['dietician']) matches['dietician'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Posture goals
    if (goalLower.includes('posture')) {
      if (matches['physiotherapist']) matches['physiotherapist'].score += 0.9;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.7;
      
      if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Core strength goals
    if (goalLower.includes('core') || goalLower.includes('core')) {
      if (matches['physiotherapist']) matches['physiotherapist'].score += 0.8;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.7;
      if (matches['biokineticist']) matches['biokineticist'].score += 0.75;
      
      if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      if (matches['biokineticist']) matches['biokineticist'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Gut health goals
    if (goalLower.includes('gut') || goalLower.includes('gut')) {
      if (matches['dietician']) matches['dietician'].score += 0.9;
      if (matches['gastroenterology']) matches['gastroenterology'].score += 0.7;
      
      if (matches['dietician']) matches['dietician'].reasons.push(`Matches goal: ${goal}`);
      if (matches['gastroenterology']) matches['gastroenterology'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Postpartum goals
    if (goalLower.includes('postpartum') || goalLower.includes('postpartum')) {
      if (matches['physiotherapist']) matches['physiotherapist'].score += 0.9;
      if (matches['personal-trainer']) matches['personal-trainer'].score += 0.7;
      
      if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Matches goal: ${goal}`);
      if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
    }
  });
}

/**
 * Apply budget-based adjustments to matches
 */
function applyBudgetAdjustments(
  budget: number,
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  // Budget-sensitive adjustments
  
  // For very tight budgets, adjust for cost-effectiveness
  if (budget <= 1000) {
    if (matches['personal-trainer']) matches['personal-trainer'].score += 0.2;
    if (matches['dietician']) matches['dietician'].score += 0.3;
    if (matches['family-medicine']) matches['family-medicine'].score += 0.3;
    if (matches['coaching']) matches['coaching'].score += 0.2;
    
    if (matches['endocrinology']) matches['endocrinology'].score -= 0.2;
    if (matches['psychiatry']) matches['psychiatry'].score -= 0.2;
    if (matches['orthopedics']) matches['orthopedics'].score -= 0.3;
    if (matches['gastroenterology']) matches['gastroenterology'].score -= 0.3;
    if (matches['neurology']) matches['neurology'].score -= 0.3;
    if (matches['cardiology']) matches['cardiology'].score -= 0.3;
    
    // Add reasons for budget adjustments
    if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Budget-friendly option (${budget})`);
    if (matches['dietician']) matches['dietician'].reasons.push(`Budget-friendly option (${budget})`);
    if (matches['endocrinology']) matches['endocrinology'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['psychiatry']) matches['psychiatry'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['orthopedics']) matches['orthopedics'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['gastroenterology']) matches['gastroenterology'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['neurology']) matches['neurology'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['cardiology']) matches['cardiology'].reasons.push(`Less budget-optimal (${budget})`);
  } 
  // For moderate budgets
  else if (budget <= 2000) {
    if (matches['personal-trainer']) matches['personal-trainer'].score += 0.1;
    if (matches['dietician']) matches['dietician'].score += 0.1;
    if (matches['family-medicine']) matches['family-medicine'].score += 0.1;
    if (matches['coaching']) matches['coaching'].score += 0.1;
    
    if (matches['physiotherapist']) matches['physiotherapist'].score += 0.1;
    if (matches['endocrinology']) matches['endocrinology'].score -= 0.1;
    if (matches['psychiatry']) matches['psychiatry'].score -= 0.1;
    if (matches['orthopedics']) matches['orthopedics'].score -= 0.1;
    
    // Add reasons for budget adjustments
    if (matches['personal-trainer']) matches['personal-trainer'].reasons.push(`Budget-friendly option (${budget})`);
    if (matches['dietician']) matches['dietician'].reasons.push(`Budget-friendly option (${budget})`);
    if (matches['endocrinology']) matches['endocrinology'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['psychiatry']) matches['psychiatry'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['orthopedics']) matches['orthopedics'].reasons.push(`Less budget-optimal (${budget})`);
    if (matches['physiotherapist']) matches['physiotherapist'].reasons.push(`Less budget-optimal (${budget})`);
  }
  
  console.log(`Applied budget adjustments for budget: ${budget}`);
}

/**
 * Apply urgency-based adjustments to matches
 */
function applyUrgencyAdjustments(
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  // For urgent cases, prioritize medical professionals
  const urgentCategories: ServiceCategory[] = [
    'family-medicine',
    'orthopedics',
    'emergency-medicine',
    'pain-management',
    'physiotherapist'
  ];
  
  urgentCategories.forEach(category => {
    if (matches[category]) {
      matches[category].score += 0.3;
      matches[category].reasons.push('Prioritized due to urgency');
    }
  });
  
  console.log('Applied urgency adjustments');
}

/**
 * Apply multi-factor bonuses for comprehensive solutions
 */
function applyMultiFactorBonuses(
  conditions: string[],
  symptoms: string[],
  goals: string[],
  matches: Record<ServiceCategory, { score: number, reasons: string[], primaryCondition?: string }>
): void {
  // Special case bonuses for multi-factor situations
  
  // Case 1: Injured athlete (injury + performance goals)
  const hasInjury = conditions.some(c => c.includes('injury') || c.includes('pain'));
  const hasAthleteGoals = goals.some(g => 
    g.includes('running') || g.includes('training') || g.includes('triathlon') || g.includes('strength')
  );
  
  if (hasInjury && hasAthleteGoals) {
    // Sports medicine and physiotherapist combo is ideal
    matches['physiotherapist'].score += 0.2;
    matches['sports-medicine'].score += 0.3;
    matches['biokineticist'].score += 0.2;
    
    matches['physiotherapist'].reasons.push('Ideal for injured athlete');
    matches['sports-medicine'].reasons.push('Specialized for athletic injuries');
    matches['biokineticist'].reasons.push('Helpful for performance with injury');
    
    console.log('Applied injured athlete bonus');
  }
  
  // Case 2: Weight management with metabolic issues
  const hasWeightGoal = goals.some(g => g.includes('weight'));
  const hasMetabolicIssue = conditions.some(c => 
    c.includes('insulin') || c.includes('diabetes')
  );
  
  if (hasWeightGoal && hasMetabolicIssue) {
    // Dietician and endocrinology combo is ideal
    matches['dietician'].score += 0.3;
    matches['endocrinology'].score += 0.3;
    
    matches['dietician'].reasons.push('Essential for metabolic weight management');
    matches['endocrinology'].reasons.push('Specialized for metabolic conditions');
    
    console.log('Applied metabolic weight management bonus');
  }
  
  // Case 3: Chronic pain with burnout/stress
  const hasPain = conditions.some(c => c.includes('pain'));
  const hasStress = conditions.some(c => c.includes('stress') || c.includes('burnout'));
  
  if (hasPain && hasStress) {
    matches['physiotherapist'].score += 0.2;
    matches['coaching'].score += 0.2;
    matches['psychiatry'].score += 0.1;
    
    matches['physiotherapist'].reasons.push('Primary for pain in stress context');
    matches['coaching'].reasons.push('Helpful for managing pain-stress cycle');
    matches['psychiatry'].reasons.push('May help with pain-related mental health');
    
    console.log('Applied pain-stress management bonus');
  }
  
  // Case 4: Digestive issues with fatigue
  const hasDigestive = symptoms.some(s => 
    s.includes('bloat') || s.includes('stomach') || s.includes('digest')
  );
  const hasFatigue = symptoms.some(s => s.includes('fatigue') || s.includes('tired') || s.includes('energy'));
  
  if (hasDigestive && hasFatigue) {
    matches['gastroenterology'].score += 0.2;
    matches['dietician'].score += 0.2;
    
    matches['gastroenterology'].reasons.push('Primary for digestive-fatigue issues');
    matches['dietician'].reasons.push('Important for digestive health management');
    
    console.log('Applied digestive-fatigue bonus');
  }
  
  // Case 5: Desk job with posture issues
  const hasPostureIssue = conditions.some(c => c.includes('posture'));
  const hasDeskJob = symptoms.some(s => s.includes('desk') || s.includes('sitting'));
  
  if (hasPostureIssue || hasDeskJob) {
    matches['physiotherapist'].score += 0.2;
    matches['biokineticist'].score += 0.15;
    
    matches['physiotherapist'].reasons.push('Primary for posture correction');
    matches['biokineticist'].reasons.push('Helpful for posture-specific exercises');
    
    console.log('Applied desk job/posture bonus');
  }
  
  // Case 6: Post-pregnancy recovery
  const hasPostpartum = conditions.some(c => 
    c.includes('birth') || c.includes('postpartum') || c.includes('pregnancy')
  );
  const hasCoreIssues = conditions.some(c => 
    c.includes('core') || c.includes('diastasis') || c.includes('abdominal')
  );
  
  if (hasPostpartum || (hasCoreIssues && goals.some(g => g.includes('birth') || g.includes('pregnancy')))) {
    matches['physiotherapist'].score += 0.25;
    matches['personal-trainer'].score += 0.15;
    
    matches['physiotherapist'].reasons.push('Specialized for postpartum recovery');
    matches['personal-trainer'].reasons.push('Helpful for post-pregnancy fitness');
    
    console.log('Applied postpartum recovery bonus');
  }
}

/**
 * Determine relevance level based on score
 */
function determineRelevance(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}
