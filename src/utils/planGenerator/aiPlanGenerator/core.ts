
import { AIHealthPlan, ServiceCategory } from '@/types';
import { findAlternativeCategories } from '../categoryMatcher';
import { calculateBudgetTiers } from '../planStructure';
import { generatePlan, analyzeUserInput } from '../planGenerator';
import { handleSpecialCases } from './complexity';
import { analyzeUserForPlanning } from './userAnalysis';
import { buildHealthPlans } from './planBuilder';

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
    categories = categories.filter(cat => !analysis.contraindicated.includes(cat));
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
  );
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Build the health plans based on our analysis
  return buildHealthPlans(
    userQuery,
    analysis,
    categories,
    complexityScore,
    budgetTiers
  );
};

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
