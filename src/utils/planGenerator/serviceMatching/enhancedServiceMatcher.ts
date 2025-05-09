
import { ServiceCategory, BASELINE_COSTS } from "../types";
import { CONDITION_TO_SERVICES } from "../serviceMappings";
import { SYMPTOM_MAPPINGS } from "../symptomMappings";
import { ServiceMatchResult, ServiceMatchRecord } from "./serviceMatchTypes";
import { createEmptyServiceRecord, addServiceMatch } from "./matchUtils";
import { findComplementaryServices } from "./complementaryServices";

/**
 * Enhanced service matching that considers multiple factors
 * 
 * @param symptoms - Detected symptoms
 * @param priorities - Symptom priorities
 * @param goals - User goals
 * @param budget - Available budget
 * @param isUrgent - Whether the condition is urgent
 * @returns Ranked service categories with relevance scores
 */
export function matchServicesToSymptoms(
  symptoms: string[],
  priorities: Record<string, number> = {},
  goals: string[] = [],
  budget?: number,
  isUrgent: boolean = false
): ServiceMatchResult[] {
  console.log("Matching services to symptoms:", symptoms, "with goals:", goals);
  
  // Create empty service match record
  const serviceCategories = Object.keys(BASELINE_COSTS) as ServiceCategory[];
  const matches = createEmptyServiceRecord(serviceCategories);
  
  try {
    // Step 1: Primary matching based on symptoms
    matchSymptomToServices(symptoms, priorities, matches);
    
    // Step 2: Goal-based adjustments
    applyGoalBasedAdjustments(goals, matches);
    
    // Step 3: Budget constraints
    if (budget !== undefined) {
      applyBudgetAdjustments(budget, matches);
    }
    
    // Step 4: Urgency adjustments
    if (isUrgent) {
      applyUrgencyAdjustments(matches);
    }
    
    // Convert to ranked results
    const results = convertToRankedResults(matches, symptoms);
    
    return results;
  } catch (error) {
    console.error("Error in service matching:", error);
    return [];
  }
}

/**
 * Match symptoms to services using symptom mappings and condition mappings
 */
function matchSymptomToServices(
  symptoms: string[],
  priorities: Record<string, number>,
  matches: ServiceMatchRecord
): void {
  symptoms.forEach(symptom => {
    const priority = priorities[symptom] || 0.5;
    const mapping = SYMPTOM_MAPPINGS[symptom];
    
    if (mapping) {
      // Primary service for this symptom
      addServiceMatch(matches, mapping.primary, priority * 1.0, 
        `Primary match for '${symptom}'`, symptom);
      
      // Secondary services for this symptom (lower weight)
      mapping.specialties.forEach(specialty => {
        if (specialty !== mapping.primary) {
          addServiceMatch(matches, specialty, priority * 0.7, 
            `Specialty for '${symptom}'`, symptom);
        }
      });
      
      // Additional services if any
      mapping.secondary?.forEach(secondary => {
        addServiceMatch(matches, secondary, priority * 0.5, 
          `Secondary match for '${symptom}'`, symptom);
      });
    }
    
    // Use the condition to service mappings as well
    const services = CONDITION_TO_SERVICES[symptom] || [];
    services.forEach((service, index) => {
      // Weight services by their order in the array (first ones are most important)
      const orderWeight = 1 - (index * 0.1);
      addServiceMatch(matches, service, priority * orderWeight, 
        `Service mapping for '${symptom}'`, symptom);
    });
  });
}

/**
 * Apply adjustments based on user goals
 */
function applyGoalBasedAdjustments(
  goals: string[], 
  matches: ServiceMatchRecord
): void {
  goals.forEach(goal => {
    const goalLower = goal.toLowerCase();
    
    // Weight loss and fitness goals
    if (goalLower.includes('weight') || goalLower.includes('fit') || 
        goalLower.includes('tone') || goalLower.includes('strong')) {
      addServiceMatch(matches, 'personal-trainer', 0.8, `Fitness goal: '${goal}'`);
      addServiceMatch(matches, 'dietician', 0.7, `Nutrition for goal: '${goal}'`);
    }
    
    // Pain relief goals
    if (goalLower.includes('pain') || goalLower.includes('relief') || 
        goalLower.includes('recover')) {
      addServiceMatch(matches, 'physiotherapist', 0.85, `Recovery goal: '${goal}'`);
      addServiceMatch(matches, 'pain-management', 0.7, `Pain relief goal: '${goal}'`);
    }
    
    // Mental health goals
    if (goalLower.includes('stress') || goalLower.includes('anxiety') || 
        goalLower.includes('depress') || goalLower.includes('mental')) {
      addServiceMatch(matches, 'psychiatry', 0.85, `Mental health goal: '${goal}'`);
      addServiceMatch(matches, 'coaching', 0.75, `Support for goal: '${goal}'`);
    }
    
    // Performance goals
    if (goalLower.includes('race') || goalLower.includes('marathon') || 
        goalLower.includes('perform') || goalLower.includes('compet')) {
      addServiceMatch(matches, 'coaching', 0.85, `Performance goal: '${goal}'`);
      addServiceMatch(matches, 'personal-trainer', 0.8, `Training for goal: '${goal}'`);
    }
  });
}

/**
 * Apply budget-based adjustments to service matches
 */
function applyBudgetAdjustments(
  budget: number, 
  matches: ServiceMatchRecord
): void {
  // Budget adaptive adjustments
  if (budget < 1000) {
    // For very low budgets, reduce scores for expensive specialists
    ['cardiology', 'neurology', 'gastroenterology', 'psychiatry'].forEach(
      (service) => {
        if (matches[service as ServiceCategory]) {
          matches[service as ServiceCategory].score *= 0.7;
          matches[service as ServiceCategory].factors.push(`Reduced due to budget constraints (${budget})`);
        }
      }
    );
    
    // Increase scores for cost-effective options
    ['family-medicine', 'dietician', 'coaching'].forEach(
      (service) => {
        if (matches[service as ServiceCategory]) {
          matches[service as ServiceCategory].score *= 1.2;
          matches[service as ServiceCategory].factors.push(`Increased as budget-friendly option (${budget})`);
        }
      }
    );
  }
}

/**
 * Apply urgency-based adjustments to service matches
 */
function applyUrgencyAdjustments(matches: ServiceMatchRecord): void {
  // Increase scores for medical professionals for urgent conditions
  ['family-medicine', 'emergency-medicine', 'orthopedics', 'cardiology'].forEach(
    (service) => {
      if (matches[service as ServiceCategory]) {
        matches[service as ServiceCategory].score *= 1.3;
        matches[service as ServiceCategory].factors.push('Increased due to urgency');
      }
    }
  );
}

/**
 * Convert service matches to ranked results
 */
function convertToRankedResults(
  matches: ServiceMatchRecord, 
  symptoms: string[]
): ServiceMatchResult[] {
  const results: ServiceMatchResult[] = Object.entries(matches)
    .filter(([_, data]) => data.score > 0) // Only include services with positive scores
    .map(([category, data]) => ({
      category: category as ServiceCategory,
      score: data.score,
      relevanceFactors: data.factors,
      primaryCondition: data.primaryCondition
    }))
    .sort((a, b) => b.score - a.score);
  
  // Add complementary service recommendations
  results.forEach(result => {
    // Find complementary services for this category
    result.complementaryCategories = findComplementaryServices(
      result.category, 
      result.primaryCondition, 
      symptoms
    );
  });
  
  return results;
}
