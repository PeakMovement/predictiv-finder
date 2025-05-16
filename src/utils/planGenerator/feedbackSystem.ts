import { ServiceCategory } from "./types";
import { AIHealthPlan } from '@/types';

// Storage interface for user feedback data
export interface UserFeedback {
  queryId: string;
  userQuery: string;
  selectedPlanId?: string; 
  rejectedPlanIds?: string[];
  selectedServices?: ServiceCategory[];
  rejectedServices?: ServiceCategory[];
  explicitFeedback?: {
    rating: number;
    comments?: string;
  };
  timestamp: number;
}

// In-memory store of feedback for the session
// In a production app, this would be stored in a database
const feedbackStore: UserFeedback[] = [];

/**
 * Records user selection of a specific plan
 * @param queryId Unique ID for the user query
 * @param userQuery Original user query text
 * @param selectedPlanId ID of the selected plan
 * @param rejectedPlanIds IDs of plans that were shown but not selected
 */
export function recordPlanSelection(
  queryId: string,
  userQuery: string,
  selectedPlanId: string,
  rejectedPlanIds: string[]
): void {
  const feedback: UserFeedback = {
    queryId,
    userQuery,
    selectedPlanId,
    rejectedPlanIds,
    timestamp: Date.now()
  };
  
  // Save to our store
  feedbackStore.push(feedback);
  
  console.log(`Recorded plan selection feedback for query: ${queryId}`);
}

/**
 * Records user selection of specific services
 * @param queryId Unique ID for the user query
 * @param userQuery Original user query text
 * @param selectedServices Services that were selected
 * @param rejectedServices Services that were explicitly rejected
 */
export function recordServiceSelection(
  queryId: string,
  userQuery: string,
  selectedServices: ServiceCategory[],
  rejectedServices: ServiceCategory[] = []
): void {
  // Check if we already have an entry for this query
  const existingFeedbackIndex = feedbackStore.findIndex(f => f.queryId === queryId);
  
  if (existingFeedbackIndex >= 0) {
    // Update existing record
    feedbackStore[existingFeedbackIndex] = {
      ...feedbackStore[existingFeedbackIndex],
      selectedServices,
      rejectedServices
    };
  } else {
    // Create new record
    const feedback: UserFeedback = {
      queryId,
      userQuery,
      selectedServices,
      rejectedServices,
      timestamp: Date.now()
    };
    feedbackStore.push(feedback);
  }
  
  console.log(`Recorded service selection feedback for query: ${queryId}`);
}

/**
 * Records explicit user feedback about recommendations
 * @param queryId Unique ID for the user query
 * @param rating User rating (1-5)
 * @param comments Optional user comments
 */
export function recordExplicitFeedback(
  queryId: string,
  rating: number,
  comments?: string
): void {
  // Find existing feedback
  const existingFeedbackIndex = feedbackStore.findIndex(f => f.queryId === queryId);
  
  if (existingFeedbackIndex >= 0) {
    // Update existing record
    feedbackStore[existingFeedbackIndex].explicitFeedback = {
      rating,
      comments
    };
  }
  
  console.log(`Recorded explicit feedback (${rating}/5) for query: ${queryId}`);
}

/**
 * Analyzes feedback to improve future recommendations
 * @returns Insights that can be used to adjust recommendation algorithms
 */
export function analyzeUserFeedback(): {
  servicePreferenceScores: Record<ServiceCategory, number>;
  queryPatternInsights: Array<{pattern: string, preferredServices: ServiceCategory[]}>;
  rejectionInsights: Array<{service: ServiceCategory, rejectionRate: number}>;
} {
  // Default return if not enough feedback
  if (feedbackStore.length < 3) {
    return {
      servicePreferenceScores: {} as Record<ServiceCategory, number>,
      queryPatternInsights: [],
      rejectionInsights: []
    };
  }
  
  // Calculate service preference scores
  const serviceSelections: Record<ServiceCategory, {selected: number, shown: number}> = {} as any;
  const serviceRejections: Record<ServiceCategory, number> = {} as any;
  const queryPatterns: Record<string, {count: number, services: Record<ServiceCategory, number>}> = {};
  
  // Process each feedback item
  feedbackStore.forEach(feedback => {
    // Track selected services
    if (feedback.selectedServices) {
      feedback.selectedServices.forEach(service => {
        if (!serviceSelections[service]) {
          serviceSelections[service] = {selected: 0, shown: 0};
        }
        serviceSelections[service].selected += 1;
      });
    }
    
    // Track rejected services
    if (feedback.rejectedServices) {
      feedback.rejectedServices.forEach(service => {
        if (!serviceRejections[service]) {
          serviceRejections[service] = 0;
        }
        serviceRejections[service] += 1;
      });
    }
    
    // Find query patterns (keywords) and associate with selections
    if (feedback.userQuery && feedback.selectedServices) {
      // Extract key terms (simple approach - would be more sophisticated in production)
      const terms = extractKeyTerms(feedback.userQuery);
      
      terms.forEach(term => {
        if (!queryPatterns[term]) {
          queryPatterns[term] = {count: 0, services: {} as Record<ServiceCategory, number>};
        }
        
        queryPatterns[term].count += 1;
        
        // Record which services were selected for this term
        feedback.selectedServices.forEach(service => {
          if (!queryPatterns[term].services[service]) {
            queryPatterns[term].services[service] = 0;
          }
          queryPatterns[term].services[service] += 1;
        });
      });
    }
  });
  
  // Calculate preference scores (selected / shown ratio)
  const servicePreferenceScores: Record<ServiceCategory, number> = {} as any;
  Object.entries(serviceSelections).forEach(([service, data]) => {
    const selectionRate = data.selected / Math.max(1, data.shown);
    servicePreferenceScores[service as ServiceCategory] = selectionRate;
  });
  
  // Calculate rejection insights
  const rejectionInsights = Object.entries(serviceRejections)
    .map(([service, count]) => ({
      service: service as ServiceCategory,
      rejectionRate: count / Math.max(1, 
        (serviceSelections[service as ServiceCategory]?.shown || 0) + count)
    }))
    .filter(insight => insight.rejectionRate > 0.3) // Only include significant rejection rates
    .sort((a, b) => b.rejectionRate - a.rejectionRate);
  
  // Extract query pattern insights
  const queryPatternInsights = Object.entries(queryPatterns)
    .filter(([_, data]) => data.count >= 2) // Only include patterns seen multiple times
    .map(([pattern, data]) => {
      // Find preferred services for this pattern
      const preferredServices = Object.entries(data.services)
        .map(([service, count]) => ({
          service: service as ServiceCategory,
          count,
          rate: count / data.count
        }))
        .filter(s => s.rate > 0.5) // Only include services selected in majority of cases
        .sort((a, b) => b.rate - a.rate)
        .map(s => s.service);
      
      return {
        pattern,
        preferredServices
      };
    })
    .filter(insight => insight.preferredServices.length > 0);
  
  return {
    servicePreferenceScores,
    queryPatternInsights,
    rejectionInsights
  };
}

/**
 * Apply feedback insights to enhance plan generation
 * @param plans Generated health plans
 * @param userQuery Original user query
 * @returns Enhanced plans with insights applied
 */
export function enhancePlansWithFeedbackInsights(
  plans: AIHealthPlan[],
  userQuery: string
): AIHealthPlan[] {
  // Get current feedback insights
  const insights = analyzeUserFeedback();
  
  // If we don't have enough feedback data yet, return plans unchanged
  if (Object.keys(insights.servicePreferenceScores).length === 0) {
    return plans;
  }
  
  // Extract key terms from user query
  const queryTerms = extractKeyTerms(userQuery);
  
  // Find relevant query pattern insights
  const relevantPatternInsights = insights.queryPatternInsights
    .filter(insight => queryTerms.includes(insight.pattern));
  
  // Apply insights to adjust plans
  const enhancedPlans = plans.map(plan => {
    const enhancedPlan = { ...plan };
    
    // Adjust services based on query pattern insights
    if (relevantPatternInsights.length > 0) {
      const preferredServicesForQuery = new Set<ServiceCategory>();
      relevantPatternInsights.forEach(insight => {
        insight.preferredServices.forEach(service => preferredServicesForQuery.add(service));
      });
      
      // Boost plans that include preferred services
      if (enhancedPlan.recommendedServices) {
        const hasPreferredServices = enhancedPlan.recommendedServices
          .some(service => preferredServicesForQuery.has(service as ServiceCategory));
        
        if (hasPreferredServices) {
          enhancedPlan.matchScore = (enhancedPlan.matchScore || 0.5) * 1.2;
        }
      }
    }
    
    return enhancedPlan;
  });
  
  // Sort based on updated match scores
  return enhancedPlans.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/**
 * Simple keyword extraction function
 * In a production system, this would use more sophisticated NLP techniques
 */
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should', 'shall',
    'may', 'might', 'must', 'of', 'from', 'with', 'about', 'between'
  ]);
  
  return text.toLowerCase()
    .replace(/[^\w\s]/gi, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 3) // Only keep words with length > 3
    .filter(word => !stopWords.has(word)) // Remove stop words
    .slice(0, 10); // Limit to top 10 terms
}
