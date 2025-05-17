/**
 * Professional category matching module
 * Handles the logic for matching health professionals to user needs
 */

import { ServiceCategory } from "../types";
import { CategoryRecommendation } from "./types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";
import { enhancedMemoize } from "@/utils/cache";

/**
 * Match practitioners to user needs based on symptoms and goals
 * Enhanced with memoization for better performance
 * 
 * @param symptoms User's symptoms
 * @param severityScores Severity scores for conditions
 * @param goals User's health goals
 * @param location User's location
 * @param isRemote Whether user prefers remote services
 * @param hasBudgetConstraint Whether user has budget constraints
 * @returns Ranked list of practitioner categories
 */
export function matchPractitionersToNeeds(
  symptoms: string[],
  severityScores: Record<string, number>,
  goals: string[],
  location?: string,
  isRemote?: boolean,
  hasBudgetConstraint?: boolean
): CategoryRecommendation[] {
  // Create a basic set of recommendations
  const recommendations: CategoryRecommendation[] = [];
  
  // Match based on symptoms
  if (symptoms.length > 0) {
    const matchedBySymptoms = matchSymptomsToPractitioners(symptoms, severityScores);
    recommendations.push(...matchedBySymptoms);
  }
  
  // Match based on goals
  if (goals.length > 0) {
    const matchedByGoals = matchGoalsToPractitioners(goals);
    recommendations.push(...matchedByGoals);
  }
  
  // Deduplicate and consolidate scores
  const consolidatedRecommendations = consolidateRecommendations(recommendations);
  
  // Sort by score (highest first)
  return consolidatedRecommendations.sort((a, b) => b.score - a.score);
}

/**
 * Match symptoms to appropriate practitioners
 */
function matchSymptomsToPractitioners(
  symptoms: string[],
  severityScores: Record<string, number>
): CategoryRecommendation[] {
  const recommendations: CategoryRecommendation[] = [];
  
  symptoms.forEach(symptom => {
    const severity = severityScores[symptom] || 0.5;
    const lowerSymptom = symptom.toLowerCase();
    
    // Match pain-related symptoms
    if (lowerSymptom.includes('pain')) {
      if (lowerSymptom.includes('back') || lowerSymptom.includes('neck') || lowerSymptom.includes('joint')) {
        recommendations.push({
          category: 'physiotherapist',
          score: 0.8 * severity,
          reasoning: `Recommended for ${symptom}`,
          primaryCondition: symptom
        });
        
        if (severity > 0.7) {
          recommendations.push({
            category: 'pain-management',
            score: 0.7 * severity,
            reasoning: `Recommended for severe ${symptom}`,
            primaryCondition: symptom
          });
        }
      }
      
      if (lowerSymptom.includes('chronic') || severity > 0.8) {
        recommendations.push({
          category: 'pain-management',
          score: 0.9 * severity,
          reasoning: `Recommended for chronic ${symptom}`,
          primaryCondition: symptom
        });
      }
    }
    
    // Match mental health symptoms
    if (lowerSymptom.includes('anxiety') || lowerSymptom.includes('stress') || 
        lowerSymptom.includes('depression') || lowerSymptom.includes('mental')) {
      recommendations.push({
        category: 'psychology',
        score: 0.85 * severity,
        reasoning: `Recommended for ${symptom}`,
        primaryCondition: symptom
      });
      
      if (severity > 0.7 || lowerSymptom.includes('severe')) {
        recommendations.push({
          category: 'psychiatry',
          score: 0.75 * severity,
          reasoning: `Recommended for severe ${symptom}`,
          primaryCondition: symptom
        });
      }
    }
    
    // Match dietary/nutrition symptoms
    if (lowerSymptom.includes('diet') || lowerSymptom.includes('weight') || 
        lowerSymptom.includes('nutrition') || lowerSymptom.includes('eating')) {
      recommendations.push({
        category: 'dietician',
        score: 0.9 * severity,
        reasoning: `Recommended for ${symptom}`,
        primaryCondition: symptom
      });
      
      recommendations.push({
        category: 'nutrition-coaching',
        score: 0.7 * severity,
        reasoning: `Recommended for ${symptom}`,
        primaryCondition: symptom
      });
    }
    
    // Always consider general practitioner for medical symptoms
    if (!lowerSymptom.includes('fitness') && !lowerSymptom.includes('training')) {
      recommendations.push({
        category: 'general-practitioner',
        score: 0.6 * severity,
        reasoning: `Recommended for general medical assessment of ${symptom}`,
        primaryCondition: symptom
      });
    }
  });
  
  return recommendations;
}

/**
 * Match goals to appropriate practitioners
 */
function matchGoalsToPractitioners(goals: string[]): CategoryRecommendation[] {
  const recommendations: CategoryRecommendation[] = [];
  
  goals.forEach(goal => {
    const lowerGoal = goal.toLowerCase();
    
    // Match fitness/strength goals
    if (lowerGoal.includes('strength') || lowerGoal.includes('fitness') || 
        lowerGoal.includes('muscle') || lowerGoal.includes('exercise')) {
      recommendations.push({
        category: 'personal-trainer',
        score: 0.9,
        reasoning: `Recommended for ${goal}`
      });
      
      recommendations.push({
        category: 'biokineticist',
        score: 0.7,
        reasoning: `Recommended for ${goal}`
      });
    }
    
    // Match running/endurance goals
    if (lowerGoal.includes('run') || lowerGoal.includes('marathon') || 
        lowerGoal.includes('endurance') || lowerGoal.includes('cardio')) {
      recommendations.push({
        category: 'coaching',
        score: 0.85,
        reasoning: `Recommended for ${goal}`
      });
      
      recommendations.push({
        category: 'personal-trainer',
        score: 0.7,
        reasoning: `Recommended for ${goal}`
      });
    }
    
    // Match nutrition/weight goals
    if (lowerGoal.includes('weight') || lowerGoal.includes('diet') || 
        lowerGoal.includes('nutrition') || lowerGoal.includes('eat')) {
      recommendations.push({
        category: 'dietician',
        score: 0.9,
        reasoning: `Recommended for ${goal}`
      });
      
      recommendations.push({
        category: 'nutrition-coaching',
        score: 0.8,
        reasoning: `Recommended for ${goal}`
      });
    }
    
    // Match performance goals
    if (lowerGoal.includes('performance') || lowerGoal.includes('sport') || 
        lowerGoal.includes('compete') || lowerGoal.includes('athlete')) {
      recommendations.push({
        category: 'sport-physician',
        score: 0.8,
        reasoning: `Recommended for ${goal}`
      });
      
      recommendations.push({
        category: 'biokineticist',
        score: 0.85,
        reasoning: `Recommended for ${goal}`
      });
    }
    
    // Match recovery goals
    if (lowerGoal.includes('recovery') || lowerGoal.includes('injury') || 
        lowerGoal.includes('rehab') || lowerGoal.includes('heal')) {
      recommendations.push({
        category: 'physiotherapist',
        score: 0.95,
        reasoning: `Recommended for ${goal}`
      });
      
      recommendations.push({
        category: 'biokineticist',
        score: 0.85,
        reasoning: `Recommended for ${goal}`
      });
    }
  });
  
  return recommendations;
}

/**
 * Consolidate duplicate recommendations and sum their scores
 */
function consolidateRecommendations(
  recommendations: CategoryRecommendation[]
): CategoryRecommendation[] {
  const consolidatedMap: Record<ServiceCategory, CategoryRecommendation> = {};
  
  recommendations.forEach(rec => {
    if (!consolidatedMap[rec.category]) {
      consolidatedMap[rec.category] = { ...rec };
    } else {
      // Sum scores (capped at 1.0)
      consolidatedMap[rec.category].score = Math.min(1.0, 
        consolidatedMap[rec.category].score + rec.score * 0.5);
      
      // Keep the primary condition from the recommendation with the highest score
      if (rec.score > consolidatedMap[rec.category].score && rec.primaryCondition) {
        consolidatedMap[rec.category].primaryCondition = rec.primaryCondition;
      }
      
      // Append reasoning
      if (rec.reasoning && !consolidatedMap[rec.category].reasoning.includes(rec.reasoning)) {
        consolidatedMap[rec.category].reasoning += `, ${rec.reasoning}`;
      }
    }
  });
  
  return Object.values(consolidatedMap);
}

/**
 * Memoized version of matchPractitionersToNeeds for better performance
 * This prevents unnecessary recalculations for the same inputs
 */
export const cachedMatchPractitioners = enhancedMemoize(matchPractitionersToNeeds);

/**
 * Get recommended practitioners for specific health conditions
 * @param condition The health condition to match
 * @returns Array of recommended professional categories
 */
export function getRecommendedPractitionersForCondition(condition: string): ServiceCategory[] {
  const conditionMap: Record<string, ServiceCategory[]> = {
    'back pain': ['physiotherapist', 'orthopedics', 'pain-management'],
    'knee pain': ['physiotherapist', 'orthopedics'],
    'weight loss': ['dietician', 'personal-trainer'],
    'anxiety': ['psychiatry', 'coaching'],
    'depression': ['psychiatry', 'coaching'],
    'digestive issues': ['gastroenterology', 'dietician'],
    'sleep problems': ['psychiatry', 'family-medicine']
  };
  
  return conditionMap[condition.toLowerCase()] || ['family-medicine'];
}

/**
 * Determines if the user's needs are complex and require specialists
 * @param symptoms User's symptoms
 * @param severity Severity of symptoms
 * @returns Whether specialist care is recommended
 */
export function needsSpecialistCare(symptoms: string[], severity: number): boolean {
  const highRiskSymptoms = ['chest pain', 'shortness of breath', 'severe pain'];
  const hasHighRiskSymptom = symptoms.some(s => 
    highRiskSymptoms.some(risk => s.toLowerCase().includes(risk)));
  
  return hasHighRiskSymptom || severity > 0.8;
}
