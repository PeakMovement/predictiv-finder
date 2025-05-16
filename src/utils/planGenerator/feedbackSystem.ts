import { AIHealthPlan, ServiceCategory } from "./types";

// Track user selections for learning
interface UserSelection {
  userInput: string;
  selectedPlan: string;
  rejectedPlans: string[];
  timestamp: number;
}

// In-memory storage for feedback data (would be DB in production)
const userSelections: UserSelection[] = [];
const servicePreferenceScores: Record<ServiceCategory, number> = {} as Record<ServiceCategory, number>;
const keywordCorrelations: Record<string, Record<ServiceCategory, number>> = {};

/**
 * Record user selection for feedback learning
 * @param userInput Original query from user
 * @param selectedPlan ID of the plan the user selected
 * @param allPlans All plans that were generated
 */
export function recordUserSelection(
  userInput: string, 
  selectedPlan: string,
  allPlans: AIHealthPlan[]
): void {
  const selectedPlanObj = allPlans.find(plan => plan.id === selectedPlan);
  if (!selectedPlanObj) return;
  
  // Record this selection
  const rejectedPlans = allPlans
    .filter(plan => plan.id !== selectedPlan)
    .map(plan => plan.id);
  
  userSelections.push({
    userInput,
    selectedPlan,
    rejectedPlans,
    timestamp: Date.now()
  });
  
  // Update service preference scores based on this selection
  const selectedServices = selectedPlanObj.services.map(service => service.type);
  
  selectedServices.forEach(service => {
    if (!servicePreferenceScores[service]) {
      servicePreferenceScores[service] = 0;
    }
    servicePreferenceScores[service] += 1;
  });
  
  // Update keyword correlations
  const words = userInput.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  
  words.forEach(word => {
    if (!keywordCorrelations[word]) {
      keywordCorrelations[word] = {} as Record<ServiceCategory, number>;
    }
    
    selectedServices.forEach(service => {
      if (!keywordCorrelations[word][service]) {
        keywordCorrelations[word][service] = 0;
      }
      keywordCorrelations[word][service] += 1;
    });
  });
  
  console.log("User selection recorded for learning algorithm");
}

/**
 * Apply learned insights to enhance generated plans
 * @param plans Original generated plans
 * @param userInput Current user query
 * @returns Enhanced plans with feedback insights applied
 */
export function enhancePlansWithFeedbackInsights(
  plans: AIHealthPlan[],
  userInput: string
): AIHealthPlan[] {
  if (plans.length === 0 || !userInput) {
    return plans;
  }
  
  try {
    // Analyze input for keywords
    const words = userInput.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    
    // Get service correlations for these keywords
    const serviceCorrelations: Record<ServiceCategory, number> = {};
    
    words.forEach(word => {
      if (keywordCorrelations[word]) {
        Object.entries(keywordCorrelations[word]).forEach(([service, score]) => {
          const serviceKey = service as ServiceCategory;
          if (!serviceCorrelations[serviceKey]) {
            serviceCorrelations[serviceKey] = 0;
          }
          serviceCorrelations[serviceKey] += score;
        });
      }
    });
    
    // Apply insights to enhance plans
    return plans.map(plan => {
      // Deep clone to avoid mutations
      const enhancedPlan = JSON.parse(JSON.stringify(plan)) as AIHealthPlan;
      
      // Calculate how well this plan matches our learned preferences
      let matchScore = 0;
      const planServices = plan.services.map(s => s.type);
      
      // Score based on service correlations with the input
      planServices.forEach(service => {
        if (serviceCorrelations[service]) {
          matchScore += serviceCorrelations[service];
        }
      });
      
      // Score based on global service preference
      planServices.forEach(service => {
        if (servicePreferenceScores[service]) {
          matchScore += servicePreferenceScores[service] * 0.5;
        }
      });
      
      // Normalize score
      if (planServices.length > 0) {
        matchScore = matchScore / planServices.length;
      }
      
      // Set match score (capped at 0.95 to avoid overconfidence)
      if (enhancedPlan.matchScore !== undefined) {
        enhancedPlan.matchScore = Math.min(0.95, (enhancedPlan.matchScore + matchScore) / 2);
      } else {
        enhancedPlan.matchScore = Math.min(0.8, 0.5 + matchScore);
      }
      
      return enhancedPlan;
    }).sort((a, b) => ((b.matchScore || 0) - (a.matchScore || 0)));
  } catch (error) {
    console.error("Error applying feedback insights:", error);
    return plans;
  }
}

/**
 * Get recommendations for services based on similar past queries
 * @param userInput Current user query
 * @returns Recommended service categories
 */
export function getRecommendationsFromSimilarQueries(userInput: string): ServiceCategory[] {
  if (!userInput || userSelections.length === 0) {
    return [];
  }
  
  // Find similar past queries using simple text similarity
  const similarSelections = userSelections.filter(selection => {
    const similarity = calculateTextSimilarity(selection.userInput, userInput);
    return similarity > 0.5; // Threshold for considering similar
  });
  
  if (similarSelections.length === 0) {
    return [];
  }
  
  // Get service counts from similar selections
  const serviceCounts: Record<ServiceCategory, number> = {} as Record<ServiceCategory, number>;
  
  similarSelections.forEach(selection => {
    const selectedPlanData = userSelections.find(s => s.selectedPlan === selection.selectedPlan);
    if (!selectedPlanData) return;
    
    // In a real system, we'd look up the plan details from a database
    // For this prototype, we'll use keyword correlation as a proxy
    const words = userInput.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    words.forEach(word => {
      if (keywordCorrelations[word]) {
        Object.entries(keywordCorrelations[word]).forEach(([service, count]) => {
          const serviceKey = service as ServiceCategory;
          if (!serviceCounts[serviceKey]) {
            serviceCounts[serviceKey] = 0;
          }
          serviceCounts[serviceKey] += count;
        });
      }
    });
  });
  
  // Convert to array, sort by count, and take top results
  return Object.entries(serviceCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 3)
    .map(([service]) => service as ServiceCategory);
}

/**
 * Calculate simple text similarity between two strings
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score (0-1)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Simple Jaccard similarity for demonstration
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
