
import { ServiceCategory } from "../types";
import { CategoryRecommendation } from "./types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";
import { enhancedMemoize } from "@/utils/cache";

/**
 * Match practitioners to user needs with enhanced caching
 * @param symptoms Array of symptoms from user input
 * @param severityScores Severity scores for symptoms
 * @param goals User's health goals
 * @param location User's location (optional)
 * @param isRemote Whether remote services are preferred
 * @param hasBudgetConstraint Whether there's a budget constraint
 * @returns Array of category recommendations sorted by match score
 */
export function matchPractitionersToNeeds(
  symptoms: string[],
  severityScores: Record<string, number>,
  goals: string[],
  location?: string,
  isRemote: boolean = false,
  hasBudgetConstraint: boolean = false
): CategoryRecommendation[] {
  // Initialize all service categories with zero scores
  const categoryScores = createServiceCategoryRecord<number>(0);
  const categoryReasons = createServiceCategoryRecord<string[]>([]);
  const primaryConditions = createServiceCategoryRecord<string | undefined>(undefined);

  // Process symptoms to find matching professionals
  symptoms.forEach(symptom => {
    const lowerSymptom = symptom.toLowerCase();
    
    // Match common symptoms to professional categories
    // Back pain
    if (lowerSymptom.includes('back pain') || lowerSymptom.includes('backache')) {
      addScore('physiotherapist', 0.9, categoryScores);
      addReason('physiotherapist', `Addresses ${symptom}`, categoryReasons);
      setPrimaryCondition('physiotherapist', symptom, primaryConditions);
      
      addScore('biokineticist', 0.7, categoryScores);
      addReason('biokineticist', `Can help with ${symptom}`, categoryReasons);
      
      addScore('pain-management', 0.8, categoryScores);
      addReason('pain-management', `Specializes in treating ${symptom}`, categoryReasons);
    }
    
    // Joint pain
    if (lowerSymptom.includes('joint') || lowerSymptom.includes('knee') || 
        lowerSymptom.includes('shoulder') || lowerSymptom.includes('hip')) {
      addScore('physiotherapist', 0.9, categoryScores);
      addReason('physiotherapist', `Treats ${symptom}`, categoryReasons);
      setPrimaryCondition('physiotherapist', symptom, primaryConditions);
      
      addScore('biokineticist', 0.8, categoryScores);
      addReason('biokineticist', `Effective for ${symptom}`, categoryReasons);
      
      addScore('orthopedics', 0.8, categoryScores);
      addReason('orthopedics', `Medical specialist for ${symptom}`, categoryReasons);
    }
    
    // Nutrition-related
    if (lowerSymptom.includes('diet') || lowerSymptom.includes('weight') || 
        lowerSymptom.includes('nutrition') || lowerSymptom.includes('eating')) {
      addScore('dietician', 0.9, categoryScores);
      addReason('dietician', `Expert for ${symptom}`, categoryReasons);
      setPrimaryCondition('dietician', symptom, primaryConditions);
      
      addScore('nutrition-coaching', 0.8, categoryScores);
      addReason('nutrition-coaching', `Provides guidance for ${symptom}`, categoryReasons);
    }
    
    // Mental health
    if (lowerSymptom.includes('anxiety') || lowerSymptom.includes('stress') || 
        lowerSymptom.includes('depression') || lowerSymptom.includes('mental')) {
      addScore('psychology', 0.9, categoryScores);
      addReason('psychology', `Addresses ${symptom}`, categoryReasons);
      setPrimaryCondition('psychology', symptom, primaryConditions);
      
      addScore('psychiatry', 0.8, categoryScores);
      addReason('psychiatry', `Medical treatment for ${symptom}`, categoryReasons);
      
      addScore('coaching', 0.6, categoryScores);
      addReason('coaching', `Support for managing ${symptom}`, categoryReasons);
    }
    
    // Fitness-related
    if (lowerSymptom.includes('strength') || lowerSymptom.includes('fitness') || 
        lowerSymptom.includes('exercise') || lowerSymptom.includes('muscle')) {
      addScore('personal-trainer', 0.9, categoryScores);
      addReason('personal-trainer', `Specializes in ${symptom}`, categoryReasons);
      setPrimaryCondition('personal-trainer', symptom, primaryConditions);
      
      addScore('biokineticist', 0.8, categoryScores);
      addReason('biokineticist', `Scientific approach to ${symptom}`, categoryReasons);
      
      addScore('coaching', 0.7, categoryScores);
      addReason('coaching', `Guidance and motivation for ${symptom}`, categoryReasons);
    }
    
    // Running-specific
    if (lowerSymptom.includes('run') || lowerSymptom.includes('marathon') || 
        lowerSymptom.includes('jog') || lowerSymptom.includes('sprint')) {
      addScore('coaching', 0.9, categoryScores);
      addReason('coaching', `Specialized training for ${symptom}`, categoryReasons);
      setPrimaryCondition('coaching', symptom, primaryConditions);
      
      addScore('personal-trainer', 0.7, categoryScores);
      addReason('personal-trainer', `Structured program for ${symptom}`, categoryReasons);
    }
    
    // Let severity influence score
    const severity = severityScores[lowerSymptom] || 0.5;
    if (severity > 0.7) {
      // For high severity, boost medical professionals
      addScore('family-medicine', 0.7, categoryScores);
      addReason('family-medicine', `Assessment of severe ${symptom}`, categoryReasons);
      
      // Specific specialists based on high severity symptoms
      if (lowerSymptom.includes('heart') || lowerSymptom.includes('chest') || lowerSymptom.includes('breath')) {
        addScore('cardiology', 0.8, categoryScores);
        addReason('cardiology', `Medical evaluation of severe ${symptom}`, categoryReasons);
      }
      
      if (lowerSymptom.includes('skin') || lowerSymptom.includes('rash')) {
        addScore('dermatology', 0.8, categoryScores);
        addReason('dermatology', `Medical treatment of severe ${symptom}`, categoryReasons);
      }
      
      if (lowerSymptom.includes('digest') || lowerSymptom.includes('stomach') || lowerSymptom.includes('bowel')) {
        addScore('gastroenterology', 0.8, categoryScores);
        addReason('gastroenterology', `Medical evaluation of severe ${symptom}`, categoryReasons);
      }
    }
  });

  // Process goals to better match practitioners
  goals.forEach(goal => {
    const lowerGoal = goal.toLowerCase();
    
    // Weight management goals
    if (lowerGoal.includes('weight') || lowerGoal.includes('lose') || lowerGoal.includes('slim')) {
      addScore('dietician', 0.9, categoryScores);
      addReason('dietician', `Helps achieve ${goal}`, categoryReasons);
      
      addScore('personal-trainer', 0.8, categoryScores);
      addReason('personal-trainer', `Exercise program for ${goal}`, categoryReasons);
      
      addScore('nutrition-coaching', 0.7, categoryScores);
      addReason('nutrition-coaching', `Nutritional guidance for ${goal}`, categoryReasons);
    }
    
    // Fitness goals
    if (lowerGoal.includes('fit') || lowerGoal.includes('strong') || lowerGoal.includes('muscle')) {
      addScore('personal-trainer', 0.9, categoryScores);
      addReason('personal-trainer', `Expertise in ${goal}`, categoryReasons);
      
      addScore('biokineticist', 0.8, categoryScores);
      addReason('biokineticist', `Scientific approach to ${goal}`, categoryReasons);
    }
    
    // Running goals
    if (lowerGoal.includes('run') || lowerGoal.includes('marathon') || lowerGoal.includes('race')) {
      addScore('coaching', 0.9, categoryScores);
      addReason('coaching', `Specialized training for ${goal}`, categoryReasons);
      
      addScore('personal-trainer', 0.7, categoryScores);
      addReason('personal-trainer', `Conditioning for ${goal}`, categoryReasons);
    }
    
    // Rehabilitation goals
    if (lowerGoal.includes('recover') || lowerGoal.includes('rehab') || lowerGoal.includes('heal')) {
      addScore('physiotherapist', 0.9, categoryScores);
      addReason('physiotherapist', `Rehabilitation for ${goal}`, categoryReasons);
      
      addScore('biokineticist', 0.8, categoryScores);
      addReason('biokineticist', `Recovery assistance for ${goal}`, categoryReasons);
    }
    
    // Mental wellbeing goals
    if (lowerGoal.includes('stress') || lowerGoal.includes('mental') || lowerGoal.includes('relax')) {
      addScore('psychology', 0.9, categoryScores);
      addReason('psychology', `Mental health support for ${goal}`, categoryReasons);
      
      addScore('coaching', 0.8, categoryScores);
      addReason('coaching', `Guidance for ${goal}`, categoryReasons);
      
      addScore('psychiatry', 0.7, categoryScores);
      addReason('psychiatry', `Medical support for ${goal}`, categoryReasons);
    }
  });
  
  // Adjust for location and remote preferences
  if (isRemote) {
    // Boost professionals that are commonly available remotely
    addScore('psychology', 0.1, categoryScores);
    addReason('psychology', 'Well-suited for remote sessions', categoryReasons);
    
    addScore('dietician', 0.1, categoryScores);
    addReason('dietician', 'Effective in remote format', categoryReasons);
    
    addScore('coaching', 0.2, categoryScores);
    addReason('coaching', 'Ideal for remote coaching', categoryReasons);
    
    // Reduce scores for hands-on services
    reduceScore('physiotherapist', 0.1, categoryScores);
    addReason('physiotherapist', 'Limited by remote format', categoryReasons);
    
    reduceScore('massage-therapy', 0.2, categoryScores);
    addReason('massage-therapy', 'Not suitable for remote sessions', categoryReasons);
  }
  
  // Adjust for budget constraints
  if (hasBudgetConstraint) {
    // Reduce scores for typically expensive services
    reduceScore('psychiatry', 0.2, categoryScores);
    addReason('psychiatry', 'May be constrained by budget', categoryReasons);
    
    reduceScore('orthopedic-surgeon', 0.3, categoryScores);
    addReason('orthopedic-surgeon', 'High cost service', categoryReasons);
    
    // Boost scores for cost-effective options
    addScore('dietician', 0.1, categoryScores);
    addReason('dietician', 'Cost-effective option', categoryReasons);
    
    addScore('coaching', 0.1, categoryScores);
    addReason('coaching', 'Flexible pricing options', categoryReasons);
  }

  // Convert to the CategoryRecommendation format and sort by score
  const recommendations: CategoryRecommendation[] = Object.entries(categoryScores)
    .map(([category, score]) => {
      const serviceCategory = category as ServiceCategory;
      return {
        category: serviceCategory,
        score,
        reasoning: categoryReasons[serviceCategory].join('; '),
        primaryCondition: primaryConditions[serviceCategory]
      };
    })
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score);

  return recommendations;
}

// Helper functions for score management
function addScore(category: ServiceCategory, value: number, scores: Record<ServiceCategory, number>): void {
  scores[category] = (scores[category] || 0) + value;
}

function reduceScore(category: ServiceCategory, value: number, scores: Record<ServiceCategory, number>): void {
  scores[category] = Math.max(0, (scores[category] || 0) - value);
}

function addReason(category: ServiceCategory, reason: string, reasons: Record<ServiceCategory, string[]>): void {
  if (!reasons[category]) {
    reasons[category] = [];
  }
  
  // Avoid duplicates
  if (!reasons[category].includes(reason)) {
    reasons[category].push(reason);
  }
}

function setPrimaryCondition(
  category: ServiceCategory, 
  condition: string, 
  conditions: Record<ServiceCategory, string | undefined>
): void {
  // Only set if not already set
  if (!conditions[category]) {
    conditions[category] = condition;
  }
}

// Create a cached version of the matching function for performance
export const cachedMatchPractitioners = enhancedMemoize(
  matchPractitionersToNeeds,
  (args) => JSON.stringify(args)
);
