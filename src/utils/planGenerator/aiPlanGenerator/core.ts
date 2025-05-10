
import { AIHealthPlan, ServiceCategory } from '@/types';
import { findAlternativeCategories } from '../categoryMatcher';
import { calculateBudgetTiers } from '../planStructure';
import { generatePlan } from '../planGenerator';
// Import analyzeUserInput from the correct module
import { analyzeUserInput } from '../inputAnalyzer';
import { handleSpecialCases } from './complexity';
import { analyzeUserForPlanning } from './userAnalysis';
import { buildHealthPlan } from './planBuilder';
import { BudgetTier } from '../types';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  console.log("Generating AI plans for query:", userQuery);
  
  // Analyze user input to extract key information
  const { analysis, complexityScore, needsMultidisciplinary, coMorbidityServices } = analyzeUserForPlanning(userQuery);
  
  // Ensure we have the right categories based on the analysis
  let categories = [...analysis.suggestedCategories];
  
  // Add specialized services for co-morbidities
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service as ServiceCategory) && 
        analysis.contraindicated && !analysis.contraindicated.includes(service as ServiceCategory)) {
      categories.push(service as ServiceCategory);
      console.log(`Added ${service} due to co-morbidity detection`);
    }
  });
  
  // Remove contraindicated services
  if (analysis.contraindicated) {
    categories = categories.filter(cat => !analysis.contraindicated!.includes(cat));
  }
  console.log("Final service categories after filtering:", categories);
  
  // Apply special case handling
  categories = handleSpecialCases(
    categories,
    analysis.medicalConditions,
    userQuery, 
    analysis.servicePriorities ? analysis.servicePriorities : {},
    analysis.primaryIssue
  );
  
  // Calculate budget tiers based on user input and context
  const budgetTiers = calculateBudgetTiers(
    analysis.budget, 
    userQuery, 
    analysis.preferences ? analysis.preferences : {}, 
    analysis.userType, 
    analysis.contextualFactors ? (Array.isArray(analysis.contextualFactors) ? analysis.contextualFactors : []) : []
  ) as BudgetTier[];
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Build the health plans based on our analysis
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

// Export our original functions for compatibility
export {
  generatePlan,
  findAlternativeCategories
};
