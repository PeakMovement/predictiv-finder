
import { ServiceCategory, TreatmentModality } from "../types";
import { getConflictingTreatmentModalities } from "./conflictResolution";

/**
 * Prioritize conditions by medical urgency
 * @param conditions List of medical conditions to prioritize
 * @returns Prioritized list of conditions
 */
export function prioritizeConditionsByMedicalUrgency(
  conditions: string[]
): {
  condition: string;
  priority: number;
  urgency: 'high' | 'medium' | 'low';
}[] {
  // High priority conditions requiring immediate attention
  const highUrgency = ['chest pain', 'stroke', 'severe bleeding', 'difficulty breathing', 
    'severe head injury', 'seizure', 'severe allergic reaction', 'heart attack', 
    'severe burn', 'poisoning'];
  
  // Medium priority conditions requiring timely but not immediate attention
  const mediumUrgency = ['fracture', 'moderate pain', 'infection', 'fever', 
    'dehydration', 'moderate injury', 'persistent vomiting', 'migraine',
    'moderate bleeding', 'asthma attack'];
  
  // Calculate priority and urgency for each condition
  return conditions.map(condition => {
    const conditionLower = condition.toLowerCase();
    
    // Check if condition contains high urgency keywords
    if (highUrgency.some(urgent => conditionLower.includes(urgent))) {
      return { condition, priority: 1, urgency: 'high' as const };
    }
    
    // Check if condition contains medium urgency keywords
    if (mediumUrgency.some(urgent => conditionLower.includes(urgent))) {
      return { condition, priority: 0.7, urgency: 'medium' as const };
    }
    
    // Default to low urgency
    return { condition, priority: 0.4, urgency: 'low' as const };
  }).sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
}

/**
 * Optimize treatment timeline based on medical conditions
 * @param conditions List of medical conditions
 * @param treatments Map of treatments by condition
 * @returns Optimized timeline of treatments 
 */
export function optimizeTreatmentTimeline(
  conditions: string[],
  treatments: Record<string, TreatmentModality[]>
): {
  phase: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  treatments: Array<{ condition: string; modality: TreatmentModality }>;
}[] {
  // Prioritize conditions by urgency
  const prioritizedConditions = prioritizeConditionsByMedicalUrgency(conditions);
  
  // Get conflict map to avoid scheduling conflicting treatments together
  const conflictMap = getConflictingTreatmentModalities();
  
  // Initialize timeline phases
  const timeline = [
    { phase: 'immediate' as const, treatments: [] as Array<{ condition: string; modality: TreatmentModality }> },
    { phase: 'short-term' as const, treatments: [] as Array<{ condition: string; modality: TreatmentModality }> },
    { phase: 'medium-term' as const, treatments: [] as Array<{ condition: string; modality: TreatmentModality }> },
    { phase: 'long-term' as const, treatments: [] as Array<{ condition: string; modality: TreatmentModality }> }
  ];
  
  // Assign treatments to phases based on priority
  prioritizedConditions.forEach(({ condition, urgency }) => {
    const conditionTreatments = treatments[condition] || [];
    
    conditionTreatments.forEach(modality => {
      if (urgency === 'high') {
        timeline[0].treatments.push({ condition, modality });
      } else if (urgency === 'medium') {
        timeline[1].treatments.push({ condition, modality });
      } else {
        // Split low urgency treatments between medium and long-term
        if (timeline[2].treatments.length <= timeline[3].treatments.length) {
          timeline[2].treatments.push({ condition, modality });
        } else {
          timeline[3].treatments.push({ condition, modality });
        }
      }
    });
  });
  
  // Ensure each phase has at least one treatment if possible
  if (timeline[0].treatments.length === 0 && timeline[1].treatments.length > 0) {
    timeline[0].treatments.push(timeline[1].treatments.shift()!);
  }
  
  if (timeline[2].treatments.length === 0 && timeline[3].treatments.length > 0) {
    timeline[2].treatments.push(timeline[3].treatments.shift()!);
  }
  
  // Remove empty phases
  return timeline.filter(phase => phase.treatments.length > 0);
}

/**
 * Create a service schedule based on optimized timeline
 * @param timeline Optimized treatment timeline
 * @returns Schedule of services
 */
export function createServiceSchedule(
  timeline: {
    phase: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
    treatments: Array<{ condition: string; modality: TreatmentModality }>;
  }[]
): {
  timeframe: string;
  services: ServiceCategory[];
  frequency: string;
  description: string;
}[] {
  // Map treatment modalities to service categories
  const modalityToService: Record<TreatmentModality, ServiceCategory[]> = {
    'stretching': ['physiotherapist', 'physical-therapy'],
    'strength-training': ['personal-trainer', 'biokineticist'],
    'cardio': ['personal-trainer', 'sport-physician'],
    'rest': ['general-practitioner'],
    'diet-restriction': ['dietician', 'nutrition-coaching'],
    'activity': ['personal-trainer', 'biokineticist'],
    'medication': ['general-practitioner', 'pain-management'],
    'activity-modification': ['physiotherapist', 'occupational-therapy'],
    'cognitive-behavioral': ['psychology'],
    'relaxation': ['psychology', 'massage-therapy'],
    'performance-nutrition': ['dietician', 'nutrition-coaching'],
    'isometric-exercise': ['physiotherapist', 'personal-trainer'],
    'light-activity': ['personal-trainer', 'physiotherapist'],
    'portion-control': ['dietician', 'nutrition-coaching'],
    'meal-timing': ['dietician', 'nutrition-coaching']
  };
  
  // Map phases to timeframes
  const phaseTimeframes = {
    'immediate': '1-2 weeks',
    'short-term': '2-4 weeks',
    'medium-term': '1-3 months',
    'long-term': '3-6 months'
  };
  
  // Map phases to frequencies
  const phaseFrequencies = {
    'immediate': '2-3 sessions per week',
    'short-term': '1-2 sessions per week',
    'medium-term': '2-4 sessions per month',
    'long-term': '1-2 sessions per month'
  };
  
  // Create schedule
  return timeline.map(phase => {
    // Collect all required services for this phase
    const allServices = phase.treatments.flatMap(treatment => 
      modalityToService[treatment.modality] || []
    );
    
    // Remove duplicates
    const uniqueServices = Array.from(new Set(allServices));
    
    // Create description based on conditions and treatments
    const conditionsText = Array.from(
      new Set(phase.treatments.map(t => t.condition))
    ).join(', ');
    
    return {
      timeframe: phaseTimeframes[phase.phase],
      services: uniqueServices,
      frequency: phaseFrequencies[phase.phase],
      description: `Focus on ${conditionsText} with ${uniqueServices.slice(0, 3).join(', ')} sessions`
    };
  });
}
