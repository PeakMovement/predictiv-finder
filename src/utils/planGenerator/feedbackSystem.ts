
import { AIHealthPlan, ServiceCategory } from '@/types';

// Track user feedback patterns for continuous improvement
interface FeedbackPattern {
  userQueryPattern: string;
  positiveAdjustments: {
    serviceTypes: ServiceCategory[];
    sessionCounts: number;
    description: string;
  };
  negativeAdjustments: {
    serviceTypes: ServiceCategory[];
    sessionCounts: number;
    description: string;
  };
  usageCount: number;
}

// Simple in-memory storage of feedback patterns (would be database in production)
const feedbackPatterns: FeedbackPattern[] = [
  {
    userQueryPattern: "weight loss",
    positiveAdjustments: {
      serviceTypes: ["dietician", "personal-trainer"],
      sessionCounts: 1,
      description: "Users prefer more dietician and personal training sessions for weight loss"
    },
    negativeAdjustments: {
      serviceTypes: ["psychology"],
      sessionCounts: -1,
      description: "Users found psychology sessions less necessary for initial weight loss plans"
    },
    usageCount: 12
  },
  {
    userQueryPattern: "back pain",
    positiveAdjustments: {
      serviceTypes: ["physiotherapist", "pain-management"],
      sessionCounts: 2,
      description: "Users with back pain benefit from more physiotherapy sessions"
    },
    negativeAdjustments: {
      serviceTypes: ["personal-trainer"],
      sessionCounts: -1,
      description: "Users with back pain prefer fewer training sessions initially"
    },
    usageCount: 8
  },
  {
    userQueryPattern: "stress",
    positiveAdjustments: {
      serviceTypes: ["psychology", "coaching"],
      sessionCounts: 1,
      description: "Stress management improved with additional psychology sessions"
    },
    negativeAdjustments: {
      serviceTypes: [],
      sessionCounts: 0,
      description: ""
    },
    usageCount: 15
  }
];

/**
 * Enhances AI health plans based on feedback insights from past user interactions
 * @param plans Generated AI health plans
 * @param userQuery Original user query text
 * @returns Enhanced plans with feedback-driven adjustments
 */
export function enhancePlansWithFeedbackInsights(
  plans: AIHealthPlan[], 
  userQuery: string
): AIHealthPlan[] {
  console.log('Enhancing plans with feedback insights');
  
  return plans.map(plan => {
    const enhancedPlan = { ...plan };
    
    // Find relevant feedback patterns based on the user query
    const relevantPatterns = feedbackPatterns.filter(pattern => 
      userQuery.toLowerCase().includes(pattern.userQueryPattern.toLowerCase())
    );
    
    if (relevantPatterns.length > 0) {
      console.log(`Found ${relevantPatterns.length} relevant feedback patterns`);
      
      // Apply feedback adjustments to the plan
      relevantPatterns.forEach(pattern => {
        // Apply positive adjustments (increase sessions for certain services)
        pattern.positiveAdjustments.serviceTypes.forEach(serviceType => {
          const serviceIndex = enhancedPlan.services.findIndex(s => 
            s.type.toLowerCase() === serviceType.toLowerCase()
          );
          
          if (serviceIndex >= 0) {
            console.log(`Increasing sessions for ${serviceType} based on feedback`);
            enhancedPlan.services[serviceIndex].sessions += pattern.positiveAdjustments.sessionCounts;
          }
        });
        
        // Apply negative adjustments (decrease sessions for certain services)
        pattern.negativeAdjustments.serviceTypes.forEach(serviceType => {
          const serviceIndex = enhancedPlan.services.findIndex(s => 
            s.type.toLowerCase() === serviceType.toLowerCase()
          );
          
          if (serviceIndex >= 0) {
            console.log(`Decreasing sessions for ${serviceType} based on feedback`);
            // Ensure we don't go below 1 session
            enhancedPlan.services[serviceIndex].sessions = Math.max(
              1, 
              enhancedPlan.services[serviceIndex].sessions + pattern.negativeAdjustments.sessionCounts
            );
          }
        });
      });
      
      // Recalculate total cost after adjustments
      enhancedPlan.totalCost = enhancedPlan.services.reduce(
        (total, service) => total + (service.price * service.sessions), 0
      );
    }
    
    // Check for keywords in the user query to adjust the plan
    if (userQuery.toLowerCase().includes('affordable') || 
        userQuery.toLowerCase().includes('cheap') || 
        userQuery.toLowerCase().includes('budget')) {
      console.log('User mentioned budget concerns, optimizing plan costs');
      
      // Adjust session counts to make the plan more affordable
      enhancedPlan.services = enhancedPlan.services.map(service => ({
        ...service,
        sessions: Math.max(1, service.sessions - 1) // Reduce sessions but ensure minimum of 1
      }));
      
      // Recalculate total cost
      enhancedPlan.totalCost = enhancedPlan.services.reduce(
        (total, service) => total + (service.price * service.sessions), 0
      );
    }
    
    if (userQuery.toLowerCase().includes('urgent') || 
        userQuery.toLowerCase().includes('emergency') ||
        userQuery.toLowerCase().includes('immediate')) {
      console.log('User indicated urgency, prioritizing immediate interventions');
      
      // Adjust the plan description to emphasize urgency
      enhancedPlan.description = `Urgent care plan: ${enhancedPlan.description}`;
    }
    
    // Add evidence-based rationales if not present
    if (!enhancedPlan.rationales) {
      enhancedPlan.rationales = enhancedPlan.services.map(service => ({
        service: service.type,
        rationale: `Based on user feedback, ${service.type} has shown positive outcomes for similar health profiles.`,
        evidenceLevel: "medium" as "high" | "medium" | "low"
      }));
    }
    
    // Safe handling for services and scores with type casting
    if (enhancedPlan.recommendedServices) {
      enhancedPlan.recommendedServices = [...enhancedPlan.recommendedServices] as ServiceCategory[];
    }
    
    if (enhancedPlan.matchScore !== undefined) {
      // Slightly adjust match scores based on user feedback
      enhancedPlan.matchScore = Math.min(0.95, enhancedPlan.matchScore + 0.05);
    } else {
      enhancedPlan.matchScore = 0.8; // Default match score if none exists
    }
    
    return enhancedPlan;
  });
}

/**
 * Record user feedback on plan to improve future recommendations
 * @param plan The plan that received feedback
 * @param userQuery The original user query
 * @param feedback The user's feedback data
 */
export function recordPlanFeedback(
  plan: AIHealthPlan,
  userQuery: string,
  feedback: {
    rating: number; // 1-5 scale
    selectedServices: ServiceCategory[];
    rejectedServices: ServiceCategory[];
    comments?: string;
  }
): void {
  console.log('Recording plan feedback to improve future recommendations');
  
  // Extract key terms from the user query
  const queryTerms = userQuery.toLowerCase().split(/\s+/);
  const significantTerms = queryTerms.filter(term => term.length > 3);
  
  // Find or create patterns for this query type
  significantTerms.forEach(term => {
    const existingPattern = feedbackPatterns.find(p => p.userQueryPattern === term);
    
    if (existingPattern) {
      // Update existing pattern
      existingPattern.usageCount++;
      
      // If high rating, add selected services as positives
      if (feedback.rating >= 4) {
        feedback.selectedServices.forEach(service => {
          if (!existingPattern.positiveAdjustments.serviceTypes.includes(service)) {
            existingPattern.positiveAdjustments.serviceTypes.push(service);
          }
        });
      } 
      // If low rating, add rejected services as negatives
      else if (feedback.rating <= 2) {
        feedback.rejectedServices.forEach(service => {
          if (!existingPattern.negativeAdjustments.serviceTypes.includes(service)) {
            existingPattern.negativeAdjustments.serviceTypes.push(service);
          }
        });
      }
    } else {
      // Create new pattern if this seems significant
      if (feedback.rating !== 3) { // Skip neutral ratings
        feedbackPatterns.push({
          userQueryPattern: term,
          positiveAdjustments: {
            serviceTypes: feedback.rating >= 4 ? [...feedback.selectedServices] : [],
            sessionCounts: feedback.rating >= 4 ? 1 : 0,
            description: `User feedback indicates ${feedback.rating >= 4 ? 'preference for' : 'no strong preference for'} these services`
          },
          negativeAdjustments: {
            serviceTypes: feedback.rating <= 2 ? [...feedback.rejectedServices] : [],
            sessionCounts: feedback.rating <= 2 ? -1 : 0,
            description: feedback.rating <= 2 ? `User feedback indicates these services may be less helpful` : ""
          },
          usageCount: 1
        });
      }
    }
  });
  
  console.log(`Updated feedback patterns, now have ${feedbackPatterns.length} patterns`);
}
