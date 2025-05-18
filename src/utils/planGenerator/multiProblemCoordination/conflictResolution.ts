
import { ServiceCategory, TreatmentModality } from "../types";
import { createServiceCategoryRecord, createServiceCategoryRecordWithFactory } from "../helpers/serviceRecordInitializer";

/**
 * Handles conflicts between different treatment modalities for multiple conditions
 */

/**
 * Maps service categories to their compatible treatment modalities
 */
export const SERVICE_TREATMENT_MODALITIES: Record<ServiceCategory, TreatmentModality[]> = createServiceCategoryRecordWithFactory<TreatmentModality[]>(() => []);

// Initialize specific entries
SERVICE_TREATMENT_MODALITIES['physiotherapist'] = ['stretching', 'strength-training', 'rest'];
SERVICE_TREATMENT_MODALITIES['biokineticist'] = ['stretching', 'strength-training', 'activity'];
SERVICE_TREATMENT_MODALITIES['dietician'] = ['diet-restriction'];
SERVICE_TREATMENT_MODALITIES['personal-trainer'] = ['strength-training', 'cardio', 'activity'];
SERVICE_TREATMENT_MODALITIES['pain-management'] = ['medication', 'rest', 'activity-modification'];
SERVICE_TREATMENT_MODALITIES['psychology'] = ['cognitive-behavioral', 'relaxation'];

/**
 * Identifies conflicts between different treatment modalities
 * @returns Map of conflicting treatment pairs
 */
export function getConflictingTreatmentModalities(): Map<TreatmentModality, TreatmentModality[]> {
  const conflictMap = new Map<TreatmentModality, TreatmentModality[]>();
  
  // Define conflicting pairs
  conflictMap.set('rest', ['activity', 'strength-training', 'cardio']);
  conflictMap.set('activity', ['rest']);
  conflictMap.set('diet-restriction', ['performance-nutrition']);
  conflictMap.set('stretching', []);
  conflictMap.set('strength-training', []);
  conflictMap.set('cardio', []);
  conflictMap.set('medication', []);
  conflictMap.set('activity-modification', []);
  conflictMap.set('cognitive-behavioral', []);
  conflictMap.set('relaxation', []);
  conflictMap.set('performance-nutrition', ['diet-restriction']);
  conflictMap.set('isometric-exercise', []);
  conflictMap.set('light-activity', []);
  conflictMap.set('portion-control', []);
  conflictMap.set('meal-timing', []);
  
  return conflictMap;
}

/**
 * Resolves conflicts between treatment modalities for multiple conditions
 * 
 * @param conditionTreatments Record of treatments by condition
 * @returns Optimized treatments with conflicts resolved
 */
export function resolveTreatmentConflicts(
  conditionTreatments: Record<string, TreatmentModality[]>
): {
  resolvedTreatments: Record<string, TreatmentModality[]>;
  conflicts: Array<{
    condition1: string;
    condition2: string;
    treatment1: TreatmentModality;
    treatment2: TreatmentModality;
    resolution: 'removed' | 'modified';
  }>;
} {
  // Get conflict mapping
  const conflictMap = getConflictingTreatmentModalities();
  
  // Initialize result
  const resolvedTreatments: Record<string, TreatmentModality[]> = {};
  const conflicts: Array<{
    condition1: string;
    condition2: string;
    treatment1: TreatmentModality;
    treatment2: TreatmentModality;
    resolution: 'removed' | 'modified';
  }> = [];
  
  // First, copy all treatments to the result
  for (const condition in conditionTreatments) {
    resolvedTreatments[condition] = [...conditionTreatments[condition]];
  }
  
  // Check for conflicts between each pair of conditions
  const conditions = Object.keys(conditionTreatments);
  
  for (let i = 0; i < conditions.length; i++) {
    for (let j = i + 1; j < conditions.length; j++) {
      const condition1 = conditions[i];
      const condition2 = conditions[j];
      
      const treatments1 = conditionTreatments[condition1];
      const treatments2 = conditionTreatments[condition2];
      
      // Check each pair of treatments for conflicts
      for (const treatment1 of treatments1) {
        for (const treatment2 of treatments2) {
          // Check if these treatments conflict
          const conflicting1 = conflictMap.get(treatment1)?.includes(treatment2);
          const conflicting2 = conflictMap.get(treatment2)?.includes(treatment1);
          
          if (conflicting1 || conflicting2) {
            // Record the conflict
            conflicts.push({
              condition1,
              condition2,
              treatment1,
              treatment2,
              resolution: 'removed'
            });
            
            // Resolve conflict - in this simple version, just remove the treatment
            // from the condition with the lower priority
            // This could be made more sophisticated
            resolvedTreatments[condition2] = resolvedTreatments[condition2].filter(
              t => t !== treatment2
            );
          }
        }
      }
    }
  }
  
  return {
    resolvedTreatments,
    conflicts
  };
}

/**
 * Generates alternative treatment options when conflicts are detected
 * 
 * @param condition The condition needing alternatives
 * @param conflictingTreatments Treatments that conflict with other conditions
 * @returns List of alternative treatments
 */
export function generateTreatmentAlternatives(
  condition: string,
  conflictingTreatments: TreatmentModality[]
): TreatmentModality[] {
  // This is a simplified implementation
  // In a real system, this would use more sophisticated mapping
  const alternatives: Record<TreatmentModality, TreatmentModality[]> = {
    'rest': ['activity-modification', 'relaxation'],
    'activity': ['stretching', 'activity-modification'],
    'strength-training': ['stretching', 'isometric-exercise'],
    'cardio': ['light-activity', 'activity-modification'],
    'diet-restriction': ['portion-control', 'meal-timing'],
    'medication': ['relaxation', 'cognitive-behavioral'],
    'stretching': ['relaxation', 'activity-modification'],
    'activity-modification': ['stretching', 'light-activity'],
    'cognitive-behavioral': ['relaxation', 'light-activity'],
    'relaxation': ['cognitive-behavioral', 'stretching'],
    'performance-nutrition': ['meal-timing', 'portion-control'],
    'isometric-exercise': ['stretching', 'activity-modification'],
    'light-activity': ['stretching', 'activity-modification'],
    'portion-control': ['meal-timing', 'diet-restriction'],
    'meal-timing': ['portion-control', 'diet-restriction']
  };
  
  // Gather all alternatives
  const result = new Set<TreatmentModality>();
  
  conflictingTreatments.forEach(treatment => {
    const alts = alternatives[treatment] || [];
    alts.forEach(alt => result.add(alt));
  });
  
  return Array.from(result);
}
