
import { ServiceCategory } from "../types";
import { prioritizeConditionsByMedicalUrgency } from "./conflictResolution";

/**
 * Treatment dependency relationship indicating one condition should be addressed 
 * before another for optimal results
 */
export interface TreatmentDependency {
  primaryCondition: string;
  dependentCondition: string;
  rationale: string;
  dependencyStrength: number; // 0-1 scale
}

/**
 * Known treatment dependencies for common condition pairs
 */
const KNOWN_DEPENDENCIES: TreatmentDependency[] = [
  {
    primaryCondition: 'anxiety',
    dependentCondition: 'insomnia',
    rationale: 'Treating anxiety often improves sleep issues',
    dependencyStrength: 0.8
  },
  {
    primaryCondition: 'depression',
    dependentCondition: 'chronic fatigue',
    rationale: 'Addressing depression typically improves energy levels',
    dependencyStrength: 0.7
  },
  {
    primaryCondition: 'obesity',
    dependentCondition: 'joint pain',
    rationale: 'Weight loss can reduce stress on joints and decrease pain',
    dependencyStrength: 0.7
  },
  {
    primaryCondition: 'muscle weakness',
    dependentCondition: 'balance issues',
    rationale: 'Strengthening muscles improves stability and balance',
    dependencyStrength: 0.6
  },
  {
    primaryCondition: 'stress',
    dependentCondition: 'headaches',
    rationale: 'Managing stress often reduces tension headaches',
    dependencyStrength: 0.7
  },
  {
    primaryCondition: 'inflammation',
    dependentCondition: 'pain',
    rationale: 'Reducing inflammation typically helps alleviate pain',
    dependencyStrength: 0.8
  },
  {
    primaryCondition: 'posture problems',
    dependentCondition: 'back pain',
    rationale: 'Correcting posture often reduces back pain',
    dependencyStrength: 0.6
  }
];

/**
 * Represents a phase in the treatment timeline
 */
export interface TreatmentPhase {
  name: string;
  conditions: string[];
  services: ServiceCategory[];
  durationWeeks: number;
  objectives: string[];
}

/**
 * Detect dependencies between conditions to determine optimal treatment order
 * 
 * @param conditions Array of conditions to be treated
 * @returns Array of dependencies between conditions
 */
export function detectTreatmentDependencies(
  conditions: string[]
): TreatmentDependency[] {
  const dependencies: TreatmentDependency[] = [];
  
  // Check each condition against known dependencies
  for (let i = 0; i < conditions.length; i++) {
    for (let j = 0; j < conditions.length; j++) {
      if (i === j) continue;
      
      const condition1 = conditions[i].toLowerCase();
      const condition2 = conditions[j].toLowerCase();
      
      // Check against known dependencies
      KNOWN_DEPENDENCIES.forEach(dependency => {
        const primary = dependency.primaryCondition.toLowerCase();
        const dependent = dependency.dependentCondition.toLowerCase();
        
        if ((condition1.includes(primary) && condition2.includes(dependent)) ||
            (condition1 === primary && condition2.includes(dependent)) ||
            (condition1.includes(primary) && condition2 === dependent)) {
          
          dependencies.push({
            primaryCondition: conditions[i],
            dependentCondition: conditions[j],
            rationale: dependency.rationale,
            dependencyStrength: dependency.dependencyStrength
          });
        }
      });
    }
  }
  
  return dependencies;
}

/**
 * Generate an optimized treatment timeline with sequential phases
 * 
 * @param conditions Array of conditions to be treated
 * @param conditionServiceMap Mapping of conditions to services
 * @param severityScores Severity scores for conditions
 * @returns Optimized treatment phases
 */
export function generateOptimizedTreatmentTimeline(
  conditions: string[],
  conditionServiceMap: Record<string, ServiceCategory[]>,
  severityScores: Record<string, number>
): {
  phases: TreatmentPhase[];
  dependencies: TreatmentDependency[];
} {
  // Detect dependencies between conditions
  const dependencies = detectTreatmentDependencies(conditions);
  
  // Prioritize conditions by medical urgency
  const prioritizedConditions = prioritizeConditionsByMedicalUrgency(
    conditions,
    severityScores
  );
  
  // Build dependency graph
  const dependencyGraph: Record<string, string[]> = {};
  conditions.forEach(condition => {
    dependencyGraph[condition] = [];
  });
  
  dependencies.forEach(dep => {
    if (dependencyGraph[dep.dependentCondition]) {
      dependencyGraph[dep.dependentCondition].push(dep.primaryCondition);
    } else {
      dependencyGraph[dep.dependentCondition] = [dep.primaryCondition];
    }
  });
  
  // Topologically sort conditions based on dependencies and priorities
  const sortedConditions = topologicalSort(
    conditions,
    dependencyGraph,
    prioritizedConditions.map(p => p.condition)
  );
  
  // Group conditions into phases
  const phases = createTreatmentPhases(sortedConditions, conditionServiceMap);
  
  return {
    phases,
    dependencies
  };
}

/**
 * Topologically sort conditions based on dependency graph and priorities
 */
function topologicalSort(
  conditions: string[],
  dependencyGraph: Record<string, string[]>,
  prioritizedOrder: string[]
): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  
  // First handle conditions with medical urgency priority
  prioritizedOrder.forEach(condition => {
    if (!visited.has(condition)) {
      visit(condition);
    }
  });
  
  // Then handle any remaining conditions
  conditions.forEach(condition => {
    if (!visited.has(condition)) {
      visit(condition);
    }
  });
  
  function visit(condition: string) {
    // If already visited during recursion, we have a cycle - break it
    if (visited.has(condition)) return;
    
    visited.add(condition);
    
    // Visit dependencies first (this ensures we address conditions that need to be treated first)
    const dependencies = dependencyGraph[condition] || [];
    dependencies.forEach(dep => {
      if (!visited.has(dep)) {
        visit(dep);
      }
    });
    
    result.push(condition);
  }
  
  return result;
}

/**
 * Create treatment phases from sorted conditions
 */
function createTreatmentPhases(
  sortedConditions: string[],
  conditionServiceMap: Record<string, ServiceCategory[]>
): TreatmentPhase[] {
  const phases: TreatmentPhase[] = [];
  
  // Check if we need phasing at all
  if (sortedConditions.length <= 2) {
    // Simple case: all conditions in one phase
    const allServices = new Set<ServiceCategory>();
    sortedConditions.forEach(condition => {
      const services = conditionServiceMap[condition] || [];
      services.forEach(service => allServices.add(service));
    });
    
    phases.push({
      name: "Comprehensive Treatment Phase",
      conditions: [...sortedConditions],
      services: Array.from(allServices),
      durationWeeks: 4 * Math.min(3, sortedConditions.length),
      objectives: sortedConditions.map(condition => `Address ${condition}`)
    });
  } else {
    // Complex case: multiple phases needed
    
    // Phase 1: Urgent conditions (first 1-2 conditions from sorted list)
    const phase1Conditions = sortedConditions.slice(0, Math.min(2, Math.ceil(sortedConditions.length / 3)));
    const phase1Services = new Set<ServiceCategory>();
    phase1Conditions.forEach(condition => {
      const services = conditionServiceMap[condition] || [];
      services.forEach(service => phase1Services.add(service));
    });
    
    phases.push({
      name: "Initial Treatment Phase",
      conditions: phase1Conditions,
      services: Array.from(phase1Services),
      durationWeeks: 4,
      objectives: phase1Conditions.map(condition => `Address ${condition}`)
    });
    
    // Phase 2: Secondary conditions
    if (sortedConditions.length > 2) {
      const remainingConditions = sortedConditions.slice(phase1Conditions.length);
      const phase2EndIndex = Math.min(3, Math.ceil(remainingConditions.length / 2));
      const phase2Conditions = remainingConditions.slice(0, phase2EndIndex);
      const phase2Services = new Set<ServiceCategory>();
      
      phase2Conditions.forEach(condition => {
        const services = conditionServiceMap[condition] || [];
        services.forEach(service => phase2Services.add(service));
      });
      
      phases.push({
        name: "Secondary Treatment Phase",
        conditions: phase2Conditions,
        services: Array.from(phase2Services),
        durationWeeks: 4,
        objectives: phase2Conditions.map(condition => `Address ${condition}`)
      });
      
      // Phase 3: Remaining conditions & maintenance
      if (remainingConditions.length > phase2EndIndex) {
        const phase3Conditions = remainingConditions.slice(phase2EndIndex);
        const phase3Services = new Set<ServiceCategory>();
        
        phase3Conditions.forEach(condition => {
          const services = conditionServiceMap[condition] || [];
          services.forEach(service => phase3Services.add(service));
        });
        
        phases.push({
          name: "Maintenance & Final Treatment Phase",
          conditions: phase3Conditions,
          services: Array.from(phase3Services),
          durationWeeks: 4,
          objectives: phase3Conditions.map(condition => `Address ${condition}`)
        });
      }
    }
  }
  
  return phases;
}

/**
 * Generate projected outcomes for the optimized timeline phases
 * 
 * @param phases Treatment phases
 * @param conditionSeverity Severity scores for conditions
 * @returns Projected outcomes for each phase
 */
export function generateProjectedOutcomes(
  phases: TreatmentPhase[],
  conditionSeverity: Record<string, number>
): Array<{
  phase: string;
  weekNumber: number;
  projectedImprovements: Record<string, number>;
  milestones: string[];
}> {
  const outcomes: Array<{
    phase: string;
    weekNumber: number;
    projectedImprovements: Record<string, number>;
    milestones: string[];
  }> = [];
  
  let currentWeek = 0;
  
  phases.forEach((phase, phaseIndex) => {
    const phaseResults = {
      phase: phase.name,
      weekNumber: currentWeek + phase.durationWeeks,
      projectedImprovements: {} as Record<string, number>,
      milestones: [] as string[]
    };
    
    // Calculate improvement for each condition in this phase
    phase.conditions.forEach(condition => {
      const severity = conditionSeverity[condition] || 0.5;
      const baseImprovement = 0.3; // 30% improvement is the baseline
      
      // More severe conditions have more room for improvement
      const improvementFactor = severity * 0.5;
      
      // Adjustment for phase (earlier phases focus on more urgent conditions)
      const phaseAdjustment = phaseIndex === 0 ? 0.2 : 0.1;
      
      // Calculate total projected improvement
      const totalImprovement = Math.min(0.8, baseImprovement + improvementFactor + phaseAdjustment);
      
      phaseResults.projectedImprovements[condition] = totalImprovement;
      
      // Generate milestone based on improvement
      if (totalImprovement > 0.5) {
        phaseResults.milestones.push(`Significant improvement in ${condition}`);
      } else {
        phaseResults.milestones.push(`Moderate improvement in ${condition}`);
      }
    });
    
    outcomes.push(phaseResults);
    currentWeek += phase.durationWeeks;
  });
  
  return outcomes;
}
