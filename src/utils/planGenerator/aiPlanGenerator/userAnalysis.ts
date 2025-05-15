
import { UserCriteria } from '@/types';

/**
 * Analyzes a user query to extract criteria for health plan creation
 * 
 * @param query The user's input query
 * @returns Extracted user criteria for plan generation
 */
export function analyzeUserQuery(query: string): Partial<UserCriteria> {
  // This is a simplified version for demonstration
  const criteria: Partial<UserCriteria> = {};
  
  // Extract goal from query if present
  if (query.toLowerCase().includes('weight loss')) {
    criteria.goal = 'Weight loss';
  } else if (query.toLowerCase().includes('fitness') || query.toLowerCase().includes('stronger')) {
    criteria.goal = 'Improve fitness';
  } else if (query.toLowerCase().includes('injury') || query.toLowerCase().includes('pain')) {
    criteria.goal = 'Recover from injury';
  } else if (query.toLowerCase().includes('performance')) {
    criteria.goal = 'Improve performance';
  }
  
  // Extract budget information
  const budgetMatch = query.match(/budget.*?(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    const budgetAmount = parseInt(budgetMatch[1]);
    criteria.budget = {
      monthly: budgetAmount,
      oneTime: budgetAmount * 3 // Assume 3 months worth for one-time budget
    };
  }
  
  // Extract location preference
  if (query.toLowerCase().includes('cape town')) {
    criteria.location = 'Cape Town';
  } else if (query.toLowerCase().includes('johannesburg')) {
    criteria.location = 'Johannesburg';
  } else if (query.toLowerCase().includes('durban')) {
    criteria.location = 'Durban';
  } else if (query.toLowerCase().includes('pretoria')) {
    criteria.location = 'Pretoria';
  }
  
  // Extract service categories
  if (query.toLowerCase().includes('dietician') || query.toLowerCase().includes('nutrition')) {
    criteria.categories = ['dietician'];
  } else if (query.toLowerCase().includes('physio') || query.toLowerCase().includes('therapy')) {
    criteria.categories = ['physiotherapist'];
  } else if (query.toLowerCase().includes('doctor') || query.toLowerCase().includes('gp')) {
    criteria.categories = ['family-medicine'];
  } else if (query.toLowerCase().includes('personal trainer') || query.toLowerCase().includes('fitness')) {
    criteria.categories = ['personal-trainer'];
  } else if (query.toLowerCase().includes('running') || query.toLowerCase().includes('marathon')) {
    criteria.categories = ['run-coaches'];
  }
  
  return criteria;
}
