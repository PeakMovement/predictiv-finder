
import { ServiceCategory } from "../types";

/**
 * Treatment modality types that might conflict
 */
export type TreatmentModality = 
  | 'rest'
  | 'activity'
  | 'medication'
  | 'diet-restriction'
  | 'stretching'
  | 'strength-training'
  | 'cardio'
  | 'mental-exercise';

/**
 * Maps services to their common treatment modalities
 */
export const SERVICE_TO_MODALITIES: Record<ServiceCategory, TreatmentModality[]> = {
  'physiotherapist': ['stretching', 'strength-training', 'rest'],
  'biokineticist': ['stretching', 'strength-training', 'activity'],
  'dietician': ['diet-restriction'],
  'personal-trainer': ['strength-training', 'cardio', 'activity'],
  'pain-management': ['medication', 'rest'],
  'psychology': ['mental-exercise'],
  'psychiatry': ['medication', 'mental-exercise'],
  // Default entries for other categories
  'general-practitioner': ['medication', 'rest', 'activity'],
  'all': []
};

/**
 * Defines potentially conflicting treatment modalities
 */
export const CONFLICTING_MODALITIES: Record<TreatmentModality, TreatmentModality[]> = {
  'rest': ['activity', 'cardio', 'strength-training'],
  'activity': ['rest'],
  'medication': [], // Conflicts would be specific to medication types
  'diet-restriction': [],
  'stretching': [],
  'strength-training': ['rest'],
  'cardio': ['rest'],
  'mental-exercise': []
};

/**
 * Medical priority scores for different conditions
 * Higher score indicates higher medical urgency
 */
export const CONDITION_PRIORITY_SCORES: Record<string, number> = {
  'heart attack': 10,
  'chest pain': 9,
  'stroke': 10,
  'severe bleeding': 9,
  'head injury': 8,
  'breathing difficulty': 8,
  'broken bone': 7,
  'severe pain': 7,
  'moderate pain': 5,
  'fever': 4,
  'infection': 6,
  'mental health crisis': 8,
  'anxiety': 5,
  'depression': 6,
  'weight management': 4,
  'fitness': 3,
  'general wellness': 2
};

/**
 * Interface for a detected conflict between treatments
 */
export interface TreatmentConflict {
  condition1: string;
  condition2: string;
  service1: ServiceCategory;
  service2: ServiceCategory;
  modality1: TreatmentModality;
  modality2: TreatmentModality;
  conflictSeverity: number; // 0-1 scale
  resolutionStrategy: string;
  recommendedAction: string;
}

/**
 * Detect potential conflicts between services for different conditions
 * 
 * @param conditionServiceMap Mapping of conditions to services
 * @returns Array of detected conflicts
 */
export function detectTreatmentConflicts(
  conditionServiceMap: Record<string, ServiceCategory[]>
): TreatmentConflict[] {
  const conflicts: TreatmentConflict[] = [];
  
  // Get all condition pairs
  const conditions = Object.keys(conditionServiceMap);
  
  // Compare each condition pair
  for (let i = 0; i < conditions.length; i++) {
    const condition1 = conditions[i];
    const services1 = conditionServiceMap[condition1];
    
    for (let j = i + 1; j < conditions.length; j++) {
      const condition2 = conditions[j];
      const services2 = conditionServiceMap[condition2];
      
      // Check for conflicts between services for these conditions
      services1.forEach(service1 => {
        const modalities1 = SERVICE_TO_MODALITIES[service1] || [];
        
        services2.forEach(service2 => {
          const modalities2 = SERVICE_TO_MODALITIES[service2] || [];
          
          // Check for conflicting modalities
          modalities1.forEach(modality1 => {
            const conflicting = CONFLICTING_MODALITIES[modality1] || [];
            
            modalities2.forEach(modality2 => {
              if (conflicting.includes(modality2)) {
                // Found conflict
                const conflict: TreatmentConflict = {
                  condition1,
                  condition2,
                  service1,
                  service2,
                  modality1,
                  modality2,
                  conflictSeverity: calculateConflictSeverity(condition1, condition2, modality1, modality2),
                  resolutionStrategy: determineResolutionStrategy(condition1, condition2, service1, service2),
                  recommendedAction: generateRecommendedAction(condition1, condition2, service1, service2, modality1, modality2)
                };
                
                conflicts.push(conflict);
              }
            });
          });
        });
      });
    }
  }
  
  return conflicts;
}

/**
 * Calculate severity of a treatment conflict
 */
function calculateConflictSeverity(
  condition1: string, 
  condition2: string, 
  modality1: TreatmentModality, 
  modality2: TreatmentModality
): number {
  // Full conflicts get high severity
  if (modality1 === 'rest' && modality2 === 'activity') return 0.9;
  if (modality1 === 'activity' && modality2 === 'rest') return 0.9;
  
  // Partial conflicts get medium severity
  if (modality1 === 'rest' && modality2 === 'cardio') return 0.7;
  if (modality1 === 'rest' && modality2 === 'strength-training') return 0.6;
  
  // Default moderate conflict
  return 0.5;
}

/**
 * Determine resolution strategy based on medical priority
 */
function determineResolutionStrategy(
  condition1: string, 
  condition2: string, 
  service1: ServiceCategory, 
  service2: ServiceCategory
): string {
  // Calculate priority scores
  const priority1 = getConditionPriorityScore(condition1);
  const priority2 = getConditionPriorityScore(condition2);
  
  if (priority1 > priority2 + 2) {
    return `Prioritize treatment for ${condition1} due to higher medical urgency`;
  } else if (priority2 > priority1 + 2) {
    return `Prioritize treatment for ${condition2} due to higher medical urgency`;
  } else {
    return `Address both conditions with modified treatment approaches`;
  }
}

/**
 * Generate specific recommended action to resolve conflict
 */
function generateRecommendedAction(
  condition1: string, 
  condition2: string, 
  service1: ServiceCategory, 
  service2: ServiceCategory,
  modality1: TreatmentModality, 
  modality2: TreatmentModality
): string {
  // Check for rest vs. activity conflict
  if ((modality1 === 'rest' && modality2 === 'activity') || 
      (modality1 === 'activity' && modality2 === 'rest')) {
    
    const restCondition = modality1 === 'rest' ? condition1 : condition2;
    const activityCondition = modality1 === 'activity' ? condition1 : condition2;
    const restService = modality1 === 'rest' ? service1 : service2;
    const activityService = modality1 === 'activity' ? service1 : service2;
    
    return `Schedule ${activityService} sessions to follow adequate rest periods for ${restCondition}. Consult with ${restService} to determine safe activity levels and modifications for ${activityCondition}.`;
  }
  
  // Generic strategy for other conflicts
  return `Coordinate treatment plans between ${service1} and ${service2} to ensure compatible approaches for ${condition1} and ${condition2}.`;
}

/**
 * Get priority score for a condition based on medical urgency
 */
function getConditionPriorityScore(condition: string): number {
  // Look for exact matches
  if (CONDITION_PRIORITY_SCORES[condition.toLowerCase()]) {
    return CONDITION_PRIORITY_SCORES[condition.toLowerCase()];
  }
  
  // Look for partial keyword matches
  let highestScore = 2; // Default priority for general conditions
  
  Object.entries(CONDITION_PRIORITY_SCORES).forEach(([key, score]) => {
    if (condition.toLowerCase().includes(key)) {
      if (score > highestScore) {
        highestScore = score;
      }
    }
  });
  
  return highestScore;
}

/**
 * Prioritize conditions based on medical urgency
 * 
 * @param conditions Array of conditions to prioritize
 * @param severityScores User-reported severity scores (0-1)
 * @returns Prioritized conditions with medical urgency scores
 */
export function prioritizeConditionsByMedicalUrgency(
  conditions: string[],
  severityScores: Record<string, number>
): Array<{condition: string, urgencyScore: number, recommended: boolean}> {
  return conditions.map(condition => {
    const basePriority = getConditionPriorityScore(condition);
    const severityMultiplier = (severityScores[condition] || 0.5) * 2;
    
    return {
      condition,
      urgencyScore: basePriority * severityMultiplier,
      recommended: basePriority > 5 || severityScores[condition] > 0.7
    };
  }).sort((a, b) => b.urgencyScore - a.urgencyScore);
}

/**
 * Resolve conflicts and generate a modified treatment plan
 * 
 * @param conflicts Detected conflicts
 * @param sessionAllocations Original session allocations
 * @returns Modified session allocations with conflict resolution
 */
export function resolveConflictsInPlan(
  conflicts: TreatmentConflict[],
  sessionAllocations: Record<ServiceCategory, number>
): {
  modifiedAllocations: Record<ServiceCategory, number>;
  resolutionNotes: string[];
} {
  // Start with original allocations
  const modifiedAllocations = { ...sessionAllocations };
  const resolutionNotes: string[] = [];
  
  // Process each conflict
  conflicts.forEach(conflict => {
    // For high-severity conflicts, adjust the session allocations
    if (conflict.conflictSeverity > 0.7) {
      // Get condition priorities
      const priority1 = getConditionPriorityScore(conflict.condition1);
      const priority2 = getConditionPriorityScore(conflict.condition2);
      
      if (priority1 > priority2) {
        // Prioritize first condition's service
        modifiedAllocations[conflict.service1] = Math.max(
          (modifiedAllocations[conflict.service1] || 0) + 1, 
          2
        );
        resolutionNotes.push(
          `Increased sessions for ${conflict.service1} to address higher priority condition: ${conflict.condition1}`
        );
      } else if (priority2 > priority1) {
        // Prioritize second condition's service
        modifiedAllocations[conflict.service2] = Math.max(
          (modifiedAllocations[conflict.service2] || 0) + 1, 
          2
        );
        resolutionNotes.push(
          `Increased sessions for ${conflict.service2} to address higher priority condition: ${conflict.condition2}`
        );
      } else {
        // Equal priority - add joint consultation recommendation
        resolutionNotes.push(
          `Added recommendation for joint consultation between ${conflict.service1} and ${conflict.service2} to coordinate treatment for ${conflict.condition1} and ${conflict.condition2}`
        );
      }
    }
    
    // Always add the conflict resolution note
    resolutionNotes.push(conflict.recommendedAction);
  });
  
  return {
    modifiedAllocations,
    resolutionNotes
  };
}
