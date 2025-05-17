
import { ServiceCategory } from "../types";
import { 
  ProfessionalRecommendation, 
  CategoryRecommendation,
  ProfessionalRecommendationResult
} from "./types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Generate professional recommendations based on user input
 * @param userQuery The user's query about their health needs
 * @param options Additional options to customize recommendation generation
 * @returns Professional recommendation result with primary and complementary recommendations
 */
export function generateProfessionalRecommendations(
  userQuery: string,
  options: {
    budget?: number;
    preferOnline?: boolean;
    location?: string;
    preferredGender?: string;
  } = {}
): ProfessionalRecommendationResult {
  try {
    // Extract key health issues from the query
    const { 
      symptoms, 
      goals,
      containsMedicalCondition,
      severity
    } = extractHealthIssues(userQuery);
    
    // Calculate severity for each condition
    const severityScores = createServiceCategoryRecord(0);
    
    symptoms.forEach(symptom => {
      // Apply a default severity if none detected
      severityScores[symptom as ServiceCategory] = severity || 0.5;
    });
    
    // Create primary recommendations
    const primaryRecommendations: ProfessionalRecommendation[] = [];
    
    // Always recommend general practitioner for medical conditions
    if (containsMedicalCondition) {
      primaryRecommendations.push({
        category: 'general-practitioner',
        sessions: 1,
        priority: 'high',
        reasoning: 'Recommended for initial medical assessment'
      });
    }
    
    // Add appropriate specialists based on detected symptoms
    if (symptoms.includes('pain') || symptoms.includes('injury')) {
      primaryRecommendations.push({
        category: 'physiotherapist',
        sessions: 4,
        priority: 'high',
        reasoning: 'Recommended for pain or injury treatment'
      });
    }
    
    if (symptoms.includes('stress') || symptoms.includes('anxiety')) {
      primaryRecommendations.push({
        category: 'psychology',
        sessions: 3,
        priority: 'medium',
        reasoning: 'Recommended for mental health support'
      });
    }
    
    if (symptoms.includes('nutrition') || symptoms.includes('diet') || symptoms.includes('weight')) {
      primaryRecommendations.push({
        category: 'dietician',
        sessions: 2,
        priority: 'medium',
        reasoning: 'Recommended for nutrition guidance'
      });
    }
    
    // Add recommendations based on goals
    if (goals.includes('fitness') || goals.includes('strength')) {
      primaryRecommendations.push({
        category: 'personal-trainer',
        sessions: 8,
        priority: 'medium',
        reasoning: 'Recommended for fitness and strength training'
      });
    }
    
    if (goals.includes('running') || goals.includes('endurance')) {
      primaryRecommendations.push({
        category: 'coaching',
        sessions: 4,
        priority: 'medium',
        reasoning: 'Recommended for running and endurance coaching'
      });
    }
    
    // Ensure we have at least one recommendation
    if (primaryRecommendations.length === 0) {
      primaryRecommendations.push({
        category: 'general-practitioner',
        sessions: 1,
        priority: 'high',
        reasoning: 'Recommended for general health assessment'
      });
    }
    
    // Build result
    const result: ProfessionalRecommendationResult = {
      primaryRecommendations
    };
    
    // Add budget allocation if budget is provided
    if (options.budget) {
      result.budgetAllocation = {
        total: options.budget,
        breakdown: createServiceCategoryRecord(0)
      };
      
      // Simple budget allocation based on priority
      let remainingBudget = options.budget;
      primaryRecommendations
        .sort((a, b) => (a.priority === 'high' ? -1 : 1))
        .forEach(rec => {
          // Allocate budget based on priority
          const allocationPercent = rec.priority === 'high' ? 0.5 : 
                                   rec.priority === 'medium' ? 0.3 : 0.2;
          
          const allocation = Math.min(options.budget! * allocationPercent, remainingBudget);
          result.budgetAllocation!.breakdown[rec.category] = allocation;
          remainingBudget -= allocation;
        });
    }
    
    return result;
  } catch (error) {
    console.error("Error generating professional recommendations:", error);
    
    // Return a basic recommendation if an error occurs
    return {
      primaryRecommendations: [
        {
          category: 'general-practitioner',
          sessions: 1,
          priority: 'high',
          reasoning: 'Recommended for general health assessment'
        }
      ]
    };
  }
}

/**
 * Extract health issues from user query
 */
function extractHealthIssues(query: string): {
  symptoms: string[];
  goals: string[];
  containsMedicalCondition: boolean;
  severity?: number;
} {
  const lowerQuery = query.toLowerCase();
  
  // Extract symptoms
  const symptoms: string[] = [];
  const symptomKeywords = ['pain', 'injury', 'stress', 'anxiety', 'nutrition', 'diet', 'weight'];
  
  symptomKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      symptoms.push(keyword);
    }
  });
  
  // Extract goals
  const goals: string[] = [];
  const goalKeywords = ['fitness', 'strength', 'running', 'endurance', 'weight loss'];
  
  goalKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) {
      goals.push(keyword);
    }
  });
  
  // Check for medical conditions
  const medicalKeywords = ['medical', 'doctor', 'condition', 'disease', 'chronic', 'diagnosed'];
  const containsMedicalCondition = medicalKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Detect severity
  let severity: number | undefined;
  
  if (lowerQuery.includes('severe') || lowerQuery.includes('extreme')) {
    severity = 0.9;
  } else if (lowerQuery.includes('moderate')) {
    severity = 0.6;
  } else if (lowerQuery.includes('mild') || lowerQuery.includes('slight')) {
    severity = 0.3;
  }
  
  return {
    symptoms,
    goals,
    containsMedicalCondition,
    severity
  };
}
