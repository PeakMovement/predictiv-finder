
import { ServiceCategory } from "../types";

export const extractBudget = (inputLower: string): number | undefined => {
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/pay\s*r?\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    const extractedBudget = parseInt(budgetMatches[1], 10);
    console.log("Extracted budget:", extractedBudget);
    return extractedBudget;
  }
  
  // Detect budget constraints even if no specific number is mentioned
  const hasBudgetConstraint = detectBudgetConstraints(inputLower);
  if (hasBudgetConstraint) {
    // Set a default modest budget when constraints are mentioned
    const defaultBudget = 1000;
    console.log("Budget constraint detected, setting default budget:", defaultBudget);
    return defaultBudget;
  }
  
  return undefined;
};

export const detectBudgetConstraints = (inputLower: string): boolean => {
  const budgetConstraintTerms = [
    'tight budget', 'limited budget', 'cheap', 'affordable', 
    'low cost', "can't afford", 'budget constraint', 'expensive',
    'low price', 'reasonable price'
  ];
  
  return budgetConstraintTerms.some(term => inputLower.includes(term));
};
