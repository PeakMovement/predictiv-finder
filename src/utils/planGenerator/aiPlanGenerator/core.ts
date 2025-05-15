
import { AIHealthPlan, ServiceCategory } from '@/types';
import { findAlternativeCategories } from '../categoryMatcher';
import { calculateBudgetTiers } from '../planStructure';
import { generatePlan } from '../planGenerator';
import { analyzeUserInput } from '../inputAnalyzer';
import { handleSpecialCases } from './complexity';
import { analyzeUserForPlanning } from './userAnalysis';
import { buildPlan } from './planBuilder';
import { BudgetTier } from '../types';
import {
  generateIntegratedServicePlan,
  detectTreatmentConflicts,
  resolveConflictsInPlan,
  generateOptimizedTreatmentTimeline,
  distributeBudgetAcrossConditions,
  createPhasedBudgetPlan
} from '../multiProblemCoordination';

// Function to build a health plan based on optimized services
const buildHealthPlan = (
  optimizedServices: any[],
  options: {
    planType: 'best-fit' | 'high-impact' | 'progressive';
    timeFrame: string;
    customName?: string;
    includePractitioners?: boolean;
    notes?: string[];
    phases?: any[];
  }
): AIHealthPlan => {
  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: options.customName || "Custom Health Plan",
    description: "A personalized health plan designed for your specific needs",
    services: optimizedServices.map(service => ({
      type: service.type,
      price: service.costPerSession || 500,
      sessions: service.sessions || 4,
      description: service.description || `Professional ${service.type.replace('-', ' ')} service`,
      recommendedPractitioners: []
    })),
    totalCost: optimizedServices.reduce((total, service) => 
      total + ((service.totalCost) || service.costPerSession * service.sessions || 2000), 0),
    planType: options.planType,
    timeFrame: options.timeFrame,
    
    // Add additional information from multi-problem coordination if available
    ...(options.notes && { rationales: options.notes.map(note => ({ 
      service: "all" as ServiceCategory, 
      rationale: note,
      evidenceLevel: "medium" 
    }))}),
    
    ...(options.phases && { progressTimeline: options.phases.map((phase, index) => ({ 
      week: index * 4 + 4, 
      milestone: phase.name,
      focus: phase.conditions.join(', ')
    }))})
  };
};

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  console.log("Generating AI plans for query:", userQuery);
  
  // Analyze user input to extract key information
  const { analysis, complexityScore, needsMultidisciplinary, coMorbidityServices } = analyzeUserForPlanning(userQuery);
  
  // Ensure we have the right categories based on the analysis
  let categories = [...analysis.suggestedCategories];
  
  // Add specialized services for co-morbidities
  coMorbidityServices.forEach(service => {
    // Safe check for contraindicated property
    const contraindicated = analysis.contraindicated || [];
    if (!categories.includes(service as ServiceCategory) && !contraindicated.includes(service as ServiceCategory)) {
      categories.push(service as ServiceCategory);
      console.log(`Added ${service} due to co-morbidity detection`);
    }
  });
  
  // Remove contraindicated services if they exist
  if (analysis.contraindicated && Array.isArray(analysis.contraindicated)) {
    categories = categories.filter(cat => !analysis.contraindicated!.includes(cat));
  }
  console.log("Final service categories after filtering:", categories);
  
  // Apply special case handling
  categories = handleSpecialCases(
    categories,
    analysis.medicalConditions,
    userQuery, 
    analysis.servicePriorities || {},
    analysis.primaryIssue
  );
  
  // Handle preferences and user type safely
  const preferences = analysis.preferences || {};
  const userType = analysis.userType || 'general';
  const contextualFactors = Array.isArray(analysis.contextualFactors) 
    ? analysis.contextualFactors 
    : (analysis.contextualFactors ? [analysis.contextualFactors] : []);
  
  // Calculate budget tiers based on user input and context
  const budgetTiers = calculateBudgetTiers(
    analysis.budget, 
    userQuery, 
    preferences, 
    userType, 
    contextualFactors
  ) as BudgetTier[];
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Use multi-problem coordination system if we have multiple conditions
  if (analysis.medicalConditions.length > 1) {
    console.log("Using multi-problem coordination for multiple conditions:", analysis.medicalConditions);
    return generateMultiProblemPlans(analysis, budgetTiers);
  }
  
  // Build the health plans based on our analysis for single condition
  // Create multiple plans based on budget tiers and complexity
  const plans: AIHealthPlan[] = [];
  
  // Generate a plan for each budget tier
  budgetTiers.forEach(tier => {
    try {
      // Create plan options with different focuses based on complexity
      const baseOptions = {
        planType: 'best-fit' as const,
        timeFrame: `${Math.max(4, analysis.timeAvailability || 4)} weeks`,
        includePractitioners: true
      };
      
      // Basic plan focused on essential services
      const basicPlan = buildHealthPlan(
        // Mock optimized services for now - in real implementation this would use actual optimization logic
        categories.slice(0, 2).map(category => ({
          type: category,
          sessions: tier.maxSessions || 4,
          cost: analysis.budget ? (analysis.budget / 4) : 500,
          costPerSession: analysis.budget ? (analysis.budget / 4 / (tier.maxSessions || 4)) : 125,
          totalCost: analysis.budget ? analysis.budget / 2 : 500
        })),
        {
          ...baseOptions,
          planType: 'best-fit' as const,
          customName: `${tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} Essential Plan`
        }
      );
      
      plans.push(basicPlan);
      
      // Add more comprehensive plan for medium/high budgets
      if (tier.name !== 'low') {
        const comprehensivePlan = buildHealthPlan(
          // More comprehensive service mix for higher tiers
          categories.slice(0, 4).map(category => ({
            type: category,
            sessions: tier.maxSessions || 4,
            cost: analysis.budget ? (analysis.budget / 8) : 300,
            costPerSession: analysis.budget ? (analysis.budget / 8 / (tier.maxSessions || 4)) : 75,
            totalCost: analysis.budget ? analysis.budget / 2 : 1200
          })),
          {
            ...baseOptions,
            planType: 'high-impact' as const,
            customName: `${tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} Comprehensive Plan`
          }
        );
        
        plans.push(comprehensivePlan);
      }
    } catch (error) {
      console.error(`Failed to generate plan for ${tier.name} tier:`, error);
    }
  });
  
  return plans.length > 0 ? plans : [
    // Fallback plan if no plans were generated
    buildHealthPlan(
      [
        {
          type: 'general-practitioner',
          sessions: 2,
          cost: 800,
          costPerSession: 400,
          totalCost: 800
        },
        {
          type: 'personal-trainer',
          sessions: 4,
          cost: 2000,
          costPerSession: 500,
          totalCost: 2000
        }
      ],
      {
        planType: 'best-fit' as const,
        timeFrame: '4 weeks',
        customName: 'Standard Wellness Plan',
        includePractitioners: true
      }
    )
  ];
};

/**
 * Generate plans specifically for multiple conditions using the multi-problem coordination system
 */
function generateMultiProblemPlans(analysis: any, budgetTiers: BudgetTier[]): AIHealthPlan[] {
  const plans: AIHealthPlan[] = [];
  
  // Create severity scores record
  const conditionSeverity: Record<string, number> = {};
  analysis.medicalConditions.forEach((condition: string) => {
    conditionSeverity[condition] = analysis.severity?.[condition] || 0.5;
  });
  
  // Process each budget tier
  budgetTiers.forEach(tier => {
    try {
      // Step 1: Generate integrated service plan for all conditions
      const integratedPlan = generateIntegratedServicePlan(
        analysis.medicalConditions,
        conditionSeverity,
        tier.budget
      );
      
      // Step 2: Detect and resolve treatment conflicts
      const conflicts = detectTreatmentConflicts(integratedPlan.conditionServiceMap);
      const { modifiedAllocations, resolutionNotes } = resolveConflictsInPlan(
        conflicts,
        integratedPlan.sessionAllocations
      );
      
      // Step 3: Generate optimized timeline with phases
      const { phases, dependencies } = generateOptimizedTreatmentTimeline(
        analysis.medicalConditions,
        integratedPlan.conditionServiceMap,
        conditionSeverity
      );
      
      // Step 4: Distribute budget optimally across conditions
      const budgetAllocation = distributeBudgetAcrossConditions(
        tier.budget,
        analysis.medicalConditions,
        conditionSeverity,
        integratedPlan.conditionServiceMap
      );
      
      // Create optimized services array for the plan
      const optimizedServices = Object.entries(budgetAllocation.serviceAllocations)
        .map(([service, allocation]) => ({
          type: service,
          sessions: allocation.sessions,
          costPerSession: allocation.costPerSession,
          totalCost: allocation.totalCost,
          description: `${service.replace('-', ' ')} for ${allocation.conditions.join(', ')}`
        }));
      
      // Create notes from resolution and budget allocation
      const planNotes = [
        ...resolutionNotes,
        ...budgetAllocation.notes,
        ...dependencies.map(dep => 
          `${dep.primaryCondition} treatment will help with ${dep.dependentCondition}: ${dep.rationale}`
        )
      ];
      
      // Add integrated plan
      plans.push(buildHealthPlan(
        optimizedServices,
        {
          planType: 'best-fit' as const,
          timeFrame: `${phases.reduce((sum, phase) => sum + phase.durationWeeks, 0)} weeks`,
          customName: `${tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} Integrated Health Plan`,
          notes: planNotes,
          phases: phases
        }
      ));
      
      // Check if phased approach is needed
      if (analysis.budget && analysis.budget < 3000 && analysis.medicalConditions.length > 2) {
        const phasedPlan = createPhasedBudgetPlan(
          tier.budget,
          analysis.medicalConditions,
          conditionSeverity,
          integratedPlan.conditionServiceMap
        );
        
        // Create a plan for each phase
        phasedPlan.phases.forEach((phase, index) => {
          const phasedServices = Object.entries(phase.serviceAllocations)
            .map(([service, allocation]) => ({
              type: service,
              sessions: allocation.sessions,
              costPerSession: allocation.costPerSession,
              totalCost: allocation.totalCost,
              description: `${service.replace('-', ' ')} for ${phase.conditions.join(', ')}`
            }));
          
          plans.push(buildHealthPlan(
            phasedServices,
            {
              planType: index === 0 ? 'best-fit' as const : 'progressive' as const,
              timeFrame: `${4 + (index * 4)} weeks`,
              customName: `${tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} ${phase.name}`,
              notes: [
                `This is phase ${index + 1} of a multi-phase treatment approach.`,
                `Focus conditions: ${phase.conditions.join(', ')}`
              ]
            }
          ));
        });
      }
    } catch (error) {
      console.error(`Failed to generate multi-problem plan for ${tier.name} tier:`, error);
    }
  });
  
  return plans.length > 0 ? plans : [
    // Fallback plan if no multi-problem plans were generated
    buildHealthPlan(
      [
        {
          type: 'general-practitioner',
          sessions: 3,
          cost: 1200,
          costPerSession: 400,
          totalCost: 1200,
          description: "General practitioner consultation for multiple health concerns"
        },
        {
          type: 'psychology',
          sessions: 2,
          cost: 1600,
          costPerSession: 800,
          totalCost: 1600,
          description: "Psychology sessions to address multiple health factors"
        }
      ],
      {
        planType: 'best-fit' as const,
        timeFrame: '8 weeks',
        customName: 'Multiple Issues Management Plan',
        includePractitioners: true
      }
    )
  ];
}

// Export our original functions for compatibility
export {
  generatePlan,
  findAlternativeCategories,
  buildHealthPlan
};
