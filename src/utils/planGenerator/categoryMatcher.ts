import { ServiceCategory } from "./types";

/**
 * Finds alternative service categories based on the user's selected categories
 * @param selectedCategories Currently selected service categories
 * @returns Array of recommended additional service categories
 */
export const findAlternativeCategories = (
  selectedCategories: ServiceCategory[]
): ServiceCategory[] => {
  // Common complementary service pairings
  const complementaryServices: Partial<Record<ServiceCategory, ServiceCategory[]>> = {
    'personal-trainer': ['dietician', 'physiotherapist', 'coaching'],
    'dietician': ['personal-trainer', 'coaching', 'family-medicine'],
    'physiotherapist': ['personal-trainer', 'biokineticist', 'pain-management'],
    'coaching': ['personal-trainer', 'dietician', 'psychiatry'],
    'family-medicine': ['dietician', 'psychiatry', 'gastroenterology'],
    'gastroenterology': ['dietician', 'family-medicine'],
    'psychiatry': ['coaching', 'family-medicine'],
    'cardiology': ['family-medicine', 'dietician'],
    'orthopedics': ['physiotherapist', 'biokineticist'],
    'pain-management': ['physiotherapist', 'family-medicine'],
    'biokineticist': ['personal-trainer', 'physiotherapist'],
    'internal-medicine': ['family-medicine', 'dietician'],
    'pediatrics': ['family-medicine', 'dietician'],
    'dermatology': ['family-medicine'],
    'neurology': ['psychiatry', 'pain-management'],
    'obstetrics-gynecology': ['family-medicine', 'dietician'],
    'emergency-medicine': ['family-medicine'],
    'anesthesiology': ['pain-management'],
    'endocrinology': ['dietician', 'internal-medicine'],
    'urology': ['family-medicine'],
    'oncology': ['internal-medicine', 'dietician'],
    'neurosurgery': ['neurology', 'pain-management'],
    'infectious-disease': ['internal-medicine', 'family-medicine'],
    'radiology': ['family-medicine'],
    'geriatric-medicine': ['family-medicine', 'psychiatry'],
    'plastic-surgery': ['dermatology'],
    'rheumatology': ['pain-management', 'physiotherapist']
  };
  
  const recommendedCategories = new Set<ServiceCategory>();
  
  // If no categories selected, recommend some common starting points
  if (selectedCategories.length === 0) {
    return ['family-medicine', 'personal-trainer', 'dietician'];
  }
  
  // Add complementary services based on selected categories
  selectedCategories.forEach(category => {
    const complementary = complementaryServices[category];
    if (complementary) {
      complementary.forEach(service => {
        // Only recommend services that aren't already selected
        if (!selectedCategories.includes(service)) {
          recommendedCategories.add(service);
        }
      });
    }
  });
  
  // Special case: If selected categories contain both personal trainer and dietician,
  // suggest coaching as it complements both
  if (selectedCategories.includes('personal-trainer') && 
      selectedCategories.includes('dietician') &&
      !selectedCategories.includes('coaching')) {
    recommendedCategories.add('coaching');
  }
  
  // If selected categories include any pain-related service,
  // suggest pain-management if not already selected
  const painRelatedServices: ServiceCategory[] = ['physiotherapist', 'orthopedics'];
  if (painRelatedServices.some(s => selectedCategories.includes(s)) && 
      !selectedCategories.includes('pain-management')) {
    recommendedCategories.add('pain-management');
  }
  
  // Return up to 3 recommendations
  return Array.from(recommendedCategories).slice(0, 3);
};

/**
 * Maps user health conditions to appropriate service categories
 * @param conditions Array of health conditions
 * @returns Recommended service categories
 */
export const mapConditionsToCategories = (
  conditions: string[]
): ServiceCategory[] => {
  const conditionMap: Record<string, ServiceCategory[]> = {
    'back pain': ['physiotherapist', 'orthopedics', 'pain-management'],
    'knee pain': ['physiotherapist', 'orthopedics'],
    'weight loss': ['dietician', 'personal-trainer'],
    'fitness goals': ['personal-trainer', 'coaching'],
    'stomach issues': ['gastroenterology', 'dietician'],
    'digestive problems': ['gastroenterology', 'dietician'],
    'anxiety': ['psychiatry', 'coaching'],
    'depression': ['psychiatry', 'coaching'],
    'stress': ['psychiatry', 'coaching'],
    'headaches': ['neurology', 'family-medicine'],
    'sleep issues': ['psychiatry', 'family-medicine'],
    'hypertension': ['cardiology', 'dietician'],
    'diabetes': ['endocrinology', 'dietician']
  };
  
  const categories = new Set<ServiceCategory>();
  
  conditions.forEach(condition => {
    const mappedCategories = conditionMap[condition.toLowerCase()];
    if (mappedCategories) {
      mappedCategories.forEach(category => categories.add(category));
    } else {
      // Default to family medicine for unknown conditions
      categories.add('family-medicine');
    }
  });
  
  return Array.from(categories);
};

/**
 * Score professionals based on their compatibility with user needs
 * @param professionalType The category of the professional
 * @param condition The user's condition or concern
 * @param severity The severity of the condition (0-1)
 * @param goalType The user's goal type (if available)
 * @param budgetConstraint Whether budget is a major constraint
 * @returns A score between 0-1 representing compatibility
 */
export const scoreProfessionalMatch = (
  professionalType: ServiceCategory,
  condition: string,
  severity: number = 0.5,
  goalType?: string,
  budgetConstraint: boolean = false
): number => {
  // Base score mappings for different conditions by professional type
  const baseScores: Record<string, Partial<Record<ServiceCategory, number>>> = {
    'back pain': {
      'physiotherapist': 0.9,
      'orthopedics': 0.8, 
      'pain-management': 0.7,
      'biokineticist': 0.6,
      'personal-trainer': 0.4
    },
    'knee pain': {
      'physiotherapist': 0.9,
      'orthopedics': 0.8,
      'biokineticist': 0.7,
      'personal-trainer': 0.3
    },
    'weight loss': {
      'dietician': 0.9,
      'personal-trainer': 0.8,
      'coaching': 0.7,
      'endocrinology': 0.6
    },
    'fitness goals': {
      'personal-trainer': 0.9,
      'coaching': 0.8,
      'dietician': 0.6,
      'physiotherapist': 0.5
    },
    'stomach issues': {
      'gastroenterology': 0.9,
      'dietician': 0.7,
      'family-medicine': 0.6
    },
    'anxiety': {
      'psychiatry': 0.9, 
      'coaching': 0.7
    },
    'depression': {
      'psychiatry': 0.9,
      'coaching': 0.6
    }
  };
  
  // Goal type adjustments
  const goalAdjustments: Record<string, Partial<Record<ServiceCategory, number>>> = {
    'running': {
      'personal-trainer': 0.2,
      'coaching': 0.3,
      'physiotherapist': 0.1
    },
    'weight': {
      'dietician': 0.3,
      'personal-trainer': 0.2
    },
    'strength': {
      'personal-trainer': 0.3,
      'biokineticist': 0.2
    },
    'race': {
      'coaching': 0.4,
      'personal-trainer': 0.2
    }
  };
  
  // Budget adjustments - for tight budgets, favor more affordable options
  const budgetAdjustments: Partial<Record<ServiceCategory, number>> = {
    'family-medicine': 0.2,
    'dietician': 0.1,
    'coaching': 0.1,
    'personal-trainer': 0.0,
    'psychiatry': -0.1,
    'cardiology': -0.2,
    'gastroenterology': -0.2,
    'neurology': -0.2,
    'orthopedics': -0.1
  };
  
  // Severity adjustments - for higher severity, favor medical professionals
  // Changed to Partial<Record> to fix the TypeScript error
  const severityAdjustments: Partial<Record<ServiceCategory, number>> = {
    'family-medicine': 0.3,
    'orthopedics': 0.3,
    'psychiatry': 0.3,
    'gastroenterology': 0.3,
    'neurology': 0.3,
    'physiotherapist': 0.2,
    'pain-management': 0.2,
    'coaching': -0.2,
    'personal-trainer': -0.3
  };
  
  // Calculate base score
  let score = 0.5; // Default score
  
  // Apply condition-specific base score if available
  if (baseScores[condition] && baseScores[condition][professionalType] !== undefined) {
    score = baseScores[condition][professionalType] || score;
  }
  
  // Apply goal adjustment if available
  if (goalType && goalAdjustments[goalType] && goalAdjustments[goalType][professionalType] !== undefined) {
    score += goalAdjustments[goalType][professionalType] || 0;
  }
  
  // Apply budget adjustment if budget constrained
  if (budgetConstraint && budgetAdjustments[professionalType] !== undefined) {
    score += budgetAdjustments[professionalType] || 0;
  }
  
  // Apply severity adjustment based on condition severity
  // Only apply significant adjustment if severity is high or low
  if (severity > 0.7) { // High severity
    const severityFactor = (severity - 0.5) * 2; // 0 to 1 factor
    score += (severityAdjustments[professionalType] || 0) * severityFactor;
  } else if (severity < 0.3) { // Low severity
    const severityFactor = (0.5 - severity) * 2; // 0 to 1 factor
    score -= (severityAdjustments[professionalType] || 0) * severityFactor;
  }
  
  // Ensure score is within 0-1 range
  return Math.max(0, Math.min(1, score));
};

/**
 * Match practitioners to user needs with weighted scoring
 * @param conditions User's health conditions
 * @param severityScores Severity scores for each condition
 * @param goals User's health and fitness goals
 * @param location Optional user location
 * @param preferOnline Whether user prefers online consultations
 * @param budgetConstraint Whether there are significant budget constraints
 * @returns Ranked professional categories with scores
 */
export const matchPractitionersToNeeds = (
  conditions: string[],
  severityScores: Record<string, number>,
  goals: string[] = [],
  location?: string,
  preferOnline?: boolean,
  budgetConstraint: boolean = false
): Array<{category: ServiceCategory, score: number, primaryCondition?: string}> => {
  // First get the base category recommendations from conditions
  const baseCategorySet = new Set<ServiceCategory>();
  
  // Add categories from conditions
  conditions.forEach(condition => {
    const mappedCategories = mapConditionsToCategories([condition]);
    mappedCategories.forEach(category => baseCategorySet.add(category));
  });
  
  // Compute scores for each professional category
  const categoryScores: Array<{category: ServiceCategory, score: number, primaryCondition?: string}> = [];
  
  Array.from(baseCategorySet).forEach(category => {
    let maxScore = 0;
    let primaryCondition: string | undefined = undefined;
    
    // Find the highest matching score across all conditions
    conditions.forEach(condition => {
      const severity = severityScores[condition] || 0.5;
      
      // Find best matching goal for this condition-professional pair
      let bestGoalBonus = 0;
      goals.forEach(goal => {
        const score = scoreProfessionalMatch(category, condition, severity, goal, budgetConstraint);
        if (score > maxScore) {
          maxScore = score;
          primaryCondition = condition;
        }
      });
      
      // If no goals, just use condition
      if (goals.length === 0) {
        const score = scoreProfessionalMatch(category, condition, severity, undefined, budgetConstraint);
        if (score > maxScore) {
          maxScore = score;
          primaryCondition = condition;
        }
      }
    });
    
    // Location and online preference adjustments
    if (preferOnline === true) {
      // Professionals that work well online get a boost
      const onlineFriendlyProfessionals: ServiceCategory[] = [
        'dietician', 'coaching', 'psychiatry', 'family-medicine'
      ];
      
      if (onlineFriendlyProfessionals.includes(category)) {
        maxScore += 0.05;
      } else {
        // Physical services get a penalty if online is preferred
        const physicalServices: ServiceCategory[] = [
          'physiotherapist', 'biokineticist', 'personal-trainer'
        ];
        
        if (physicalServices.includes(category)) {
          maxScore -= 0.1;
        }
      }
    }
    
    categoryScores.push({ 
      category, 
      score: maxScore,
      primaryCondition 
    });
  });
  
  // Sort by score descending
  return categoryScores.sort((a, b) => b.score - a.score);
};
