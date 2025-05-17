
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

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
  }> = createServiceCategoryRecord({
    score: 0,
    reasons: []
  });
  
  console.log("Enhanced matching with:", { conditions, symptoms, goals, budget, isUrgent });
  
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
 * Determine relevance level based on match score
 */
function determineRelevance(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
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
  // Simple symptom-to-category mappings
  const symptomMappings: Record<string, {
    primary: ServiceCategory,
    specialties?: ServiceCategory[],
    secondary?: ServiceCategory[]
  }> = {
    'pain': {
      primary: 'pain-management',
      specialties: ['physiotherapist', 'orthopedics'],
      secondary: ['general-practitioner']
    },
    'fatigue': {
      primary: 'family-medicine',
      specialties: ['endocrinology'],
      secondary: ['dietician']
    },
    'anxiety': {
      primary: 'psychology',
      specialties: ['psychiatry'],
      secondary: ['coaching']
    },
    'weakness': {
      primary: 'physiotherapist',
      specialties: ['biokineticist', 'neurology'],
      secondary: ['personal-trainer']
    },
    'stiffness': {
      primary: 'physiotherapist',
      specialties: ['biokineticist'],
      secondary: ['orthopedics']
    }
  };

  symptoms.forEach(symptom => {
    const symptomLower = symptom.toLowerCase();
    let foundMapping = false;
    
    // Check for specific symptom mappings
    Object.entries(symptomMappings).forEach(([key, mapping]) => {
      if (symptomLower.includes(key)) {
        foundMapping = true;
        const severity = severityScores[symptomLower] || 0.5;
        
        // Primary category
        matches[mapping.primary].score += 0.8 * (severity + 0.5);
        matches[mapping.primary].reasons.push(`Primary match for symptom: ${symptom}`);
        
        if (!matches[mapping.primary].primaryCondition) {
          matches[mapping.primary].primaryCondition = symptom;
        }
        
        // Add secondary categories with lower weights
        (mapping.specialties || []).forEach(specialty => {
          if (specialty !== mapping.primary) {
            matches[specialty].score += 0.5 * (severity + 0.5);
            matches[specialty].reasons.push(`Secondary match for symptom: ${symptom}`);
          }
        });
        
        // Tertiary connections
        (mapping.secondary || []).forEach(secondary => {
          matches[secondary].score += 0.3 * (severity + 0.5);
          matches[secondary].reasons.push(`Complementary for symptom: ${symptom}`);
        });
      }
    });
    
    // Generic fallbacks if no specific mapping found
    if (!foundMapping) {
      // Generic pain symptoms
      if (symptomLower.includes('pain') || symptomLower.includes('ache') || symptomLower.includes('sore')) {
        matches['pain-management'].score += 0.7;
        matches['physiotherapist'].score += 0.6;
        matches['general-practitioner'].score += 0.5;
        
        matches['pain-management'].reasons.push(`Generic pain symptom: ${symptom}`);
        matches['physiotherapist'].reasons.push(`Generic pain symptom: ${symptom}`);
        matches['general-practitioner'].reasons.push(`Generic pain symptom: ${symptom}`);
      }
      
      // Generic digestive symptoms
      if (symptomLower.includes('digest') || symptomLower.includes('stomach') || 
          symptomLower.includes('bowel') || symptomLower.includes('nausea')) {
        matches['gastroenterology'].score += 0.7;
        matches['dietician'].score += 0.6;
        matches['general-practitioner'].score += 0.5;
        
        matches['gastroenterology'].reasons.push(`Digestive symptom: ${symptom}`);
        matches['dietician'].reasons.push(`Digestive symptom: ${symptom}`);
        matches['general-practitioner'].reasons.push(`Digestive symptom: ${symptom}`);
      }
      
      // Generic mental health symptoms
      if (symptomLower.includes('stress') || symptomLower.includes('mood') || 
          symptomLower.includes('depress') || symptomLower.includes('anxiety')) {
        matches['psychology'].score += 0.7;
        matches['psychiatry'].score += 0.6;
        matches['coaching'].score += 0.5;
        
        matches['psychology'].reasons.push(`Mental health symptom: ${symptom}`);
        matches['psychiatry'].reasons.push(`Mental health symptom: ${symptom}`);
        matches['coaching'].reasons.push(`Mental health symptom: ${symptom}`);
      }
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
      matches['dietician'].score += 0.8;
      matches['personal-trainer'].score += 0.7;
      matches['coaching'].score += 0.5;
      matches['endocrinology'].score += 0.3;
      
      matches['dietician'].reasons.push(`Matches goal: ${goal}`);
      matches['personal-trainer'].reasons.push(`Matches goal: ${goal}`);
      matches['coaching'].reasons.push(`Matches goal: ${goal}`);
      matches['endocrinology'].reasons.push(`Matches goal: ${goal}`);
    }
    
    // Running goals
    if (goalLower.includes('run') || goalLower.includes('marathon') || goalLower.includes('jog')) {
      matches['coaching'].score += 0.8;
      matches['personal-trainer'].score += 0.7;
      matches['physiotherapist'].score += 0.5;
      
      matches['coaching'].reasons.push(`Running goal: ${goal}`);
      matches['personal-trainer'].reasons.push(`Running goal: ${goal}`);
      matches['physiotherapist'].reasons.push(`Running goal: ${goal}`);
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
    matches['personal-trainer'].score += 0.2;
    matches['dietician'].score += 0.3;
    matches['family-medicine'].score += 0.3;
    matches['coaching'].score += 0.2;
    
    matches['endocrinology'].score -= 0.2;
    matches['psychiatry'].score -= 0.2;
    matches['orthopedics'].score -= 0.3;
    matches['gastroenterology'].score -= 0.3;
    
    // Add reasons for budget adjustments
    matches['personal-trainer'].reasons.push(`Budget-friendly option (${budget})`);
    matches['dietician'].reasons.push(`Budget-friendly option (${budget})`);
    matches['endocrinology'].reasons.push(`Less budget-optimal (${budget})`);
    matches['psychiatry'].reasons.push(`Less budget-optimal (${budget})`);
  } 
  // For moderate budgets
  else if (budget <= 2000) {
    matches['personal-trainer'].score += 0.1;
    matches['dietician'].score += 0.1;
    matches['family-medicine'].score += 0.1;
    matches['coaching'].score += 0.1;
    
    matches['physiotherapist'].score += 0.1;
    matches['endocrinology'].score -= 0.1;
    matches['psychiatry'].score -= 0.1;
    matches['orthopedics'].score -= 0.1;
  }
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
    matches[category].score += 0.3;
    matches[category].reasons.push('Prioritized due to urgency');
  });
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
  }
}
