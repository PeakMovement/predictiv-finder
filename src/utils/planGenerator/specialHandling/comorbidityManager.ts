
import { ServiceCategory, ComorbidityGroup } from "../types";
import { detectComorbidities } from "../serviceMatching/advancedServiceMatcher";

/**
 * Enhanced comorbidity detection and management system
 */
export interface ComorbidityManagementPlan {
  comorbidityGroup: ComorbidityGroup;
  integratedApproach: string;
  serviceRecommendations: {
    service: ServiceCategory;
    recommendationReason: string;
    priority: number; // 0-1 scale
  }[];
  careCoordinationNotes: string[];
  expectedChallenges: string[];
  successStrategies: string[];
}

/**
 * Specialized management plans for different comorbidity groups
 */
const COMORBIDITY_MANAGEMENT_PLANS: Record<string, ComorbidityManagementPlan> = {
  'Cardiometabolic Syndrome': {
    comorbidityGroup: {
      name: 'Cardiometabolic Syndrome',
      conditions: ['diabetes', 'hypertension', 'obesity', 'cardiovascular'],
      recommendedServices: ['cardiology', 'endocrinology', 'dietician']
    },
    integratedApproach: 'Coordinated management of metabolic and cardiovascular health through lifestyle modification and specialized medical care.',
    serviceRecommendations: [
      {
        service: 'cardiology',
        recommendationReason: 'Cardiovascular monitoring and risk management',
        priority: 0.9
      },
      {
        service: 'endocrinology',
        recommendationReason: 'Metabolic assessment and medication management',
        priority: 0.85
      },
      {
        service: 'dietician',
        recommendationReason: 'Therapeutic nutrition plan addressing multiple condition requirements',
        priority: 0.8
      },
      {
        service: 'personal-trainer',
        recommendationReason: 'Supervised exercise modified for cardiovascular safety',
        priority: 0.7
      }
    ],
    careCoordinationNotes: [
      'Regular communication between cardiology and endocrinology is essential',
      'Nutritional plan should address both glycemic control and heart-healthy principles',
      'Medication review needed to address potential interactions',
      'Vital signs monitoring across all services'
    ],
    expectedChallenges: [
      'Managing multiple medication regimens',
      'Prioritizing lifestyle changes without overwhelming the patient',
      'Addressing potential contradictory dietary recommendations'
    ],
    successStrategies: [
      'Phased approach to lifestyle changes',
      'Unified treatment goals across all providers',
      'Patient education on condition interconnections',
      'Regular reassessment of overall metabolic and cardiovascular status'
    ]
  },
  'Musculoskeletal Pain Complex': {
    comorbidityGroup: {
      name: 'Musculoskeletal Pain Complex',
      conditions: ['back pain', 'knee pain', 'joint pain', 'arthritis', 'fibromyalgia'],
      recommendedServices: ['physiotherapist', 'pain-management', 'rheumatology']
    },
    integratedApproach: 'Multi-modal pain management approach addressing multiple pain sites with coordinated physical and medical interventions.',
    serviceRecommendations: [
      {
        service: 'physiotherapist',
        recommendationReason: 'Comprehensive physical assessment and treatment of interrelated movement patterns',
        priority: 0.9
      },
      {
        service: 'pain-management',
        recommendationReason: 'Integrated approach to multiple pain generators',
        priority: 0.85
      },
      {
        service: 'rheumatology',
        recommendationReason: 'Assessment for systemic inflammatory conditions',
        priority: 0.7
      },
      {
        service: 'psychology',
        recommendationReason: 'Pain coping strategies and addressing psychological impact of chronic pain',
        priority: 0.6
      }
    ],
    careCoordinationNotes: [
      'Global movement assessment rather than isolated joint approach',
      'Coordinated medication strategy to avoid conflicting pain management approaches',
      'Shared treatment plan addressing functional limitations',
      'Pacing strategies across all activities'
    ],
    expectedChallenges: [
      'Difficulty isolating primary pain generators',
      'Treatment prioritization with multiple painful sites',
      'Potential medication interactions with multiple analgesics',
      'Activity limitations affecting treatment compliance'
    ],
    successStrategies: [
      'Whole-body approach to movement assessment',
      'Prioritizing functional goals over pain elimination',
      'Graded activity progression with monitoring across all affected areas',
      'Regular team communication regarding pain pattern changes'
    ]
  },
  'Mental Health and Chronic Pain': {
    comorbidityGroup: {
      name: 'Mental Health and Chronic Pain',
      conditions: ['anxiety', 'depression', 'chronic pain', 'back pain'],
      recommendedServices: ['psychology', 'psychiatry', 'pain-management', 'physiotherapist']
    },
    integratedApproach: 'Biopsychosocial approach addressing the interrelationship between psychological factors and physical pain experience.',
    serviceRecommendations: [
      {
        service: 'psychology',
        recommendationReason: 'Assessment and treatment of psychological factors affecting pain experience',
        priority: 0.9
      },
      {
        service: 'pain-management',
        recommendationReason: 'Integrated pain management considering psychological factors',
        priority: 0.85
      },
      {
        service: 'psychiatry',
        recommendationReason: 'Medication management for mood disorders affecting pain perception',
        priority: 0.75
      },
      {
        service: 'physiotherapist',
        recommendationReason: 'Physical interventions with awareness of psychological impacts',
        priority: 0.7
      }
    ],
    careCoordinationNotes: [
      'Shared understanding of pain neuroscience across providers',
      'Coordinated approach to activity pacing',
      'Cognitive-behavioral strategies integrated into physical therapy',
      'Regular assessment of both psychological and pain status'
    ],
    expectedChallenges: [
      'Distinguishing between physical and psychological pain contributions',
      'Medication effects on motivation and engagement',
      'Addressing fear-avoidance behaviors in physical therapy',
      'Managing flare-ups affecting both pain and mood'
    ],
    successStrategies: [
      'Education on pain neuroscience and psychological connections',
      'Graded exposure to feared movements and activities',
      'Consistent messaging about pain mechanisms across providers',
      'Developing self-management strategies addressing both physical and psychological aspects'
    ]
  },
  'Digestive and Stress Disorders': {
    comorbidityGroup: {
      name: 'Digestive and Stress Disorders',
      conditions: ['digestive issues', 'ibs', 'anxiety', 'stress'],
      recommendedServices: ['gastroenterology', 'psychology', 'dietician']
    },
    integratedApproach: 'Gut-brain focused approach addressing the bidirectional relationship between digestive function and stress response.',
    serviceRecommendations: [
      {
        service: 'gastroenterology',
        recommendationReason: 'Medical assessment and treatment of digestive disorders',
        priority: 0.9
      },
      {
        service: 'psychology',
        recommendationReason: 'Stress management and gut-directed psychological interventions',
        priority: 0.85
      },
      {
        service: 'dietician',
        recommendationReason: 'Dietary management considering both gut sensitivities and stress impacts',
        priority: 0.8
      },
      {
        service: 'psychiatry',
        recommendationReason: 'Assessment for anxiety disorders affecting gut function',
        priority: 0.6
      }
    ],
    careCoordinationNotes: [
      'Recognition of gut-brain axis in all treatments',
      'Coordination between dietary changes and stress management',
      'Monitoring of digestive symptoms in relation to stress levels',
      'Careful medication management to avoid exacerbating digestive issues'
    ],
    expectedChallenges: [
      'Differentiating between primary gut issues and stress-induced symptoms',
      'Managing dietary restrictions while maintaining nutritional adequacy',
      'Breaking the cycle of symptom-related anxiety',
      'Treatment prioritization during symptom flares'
    ],
    successStrategies: [
      'Patient education on gut-brain connection',
      'Combined dietary and stress management approach',
      'Symptom monitoring to identify triggers across domains',
      'Gradual introduction of dietary challenges with stress management support'
    ]
  }
};

/**
 * Analyzes conditions for comorbidity patterns and generates management recommendations
 */
export function analyzeComorbidities(
  conditions: string[],
  userInput: string
): {
  detectedComorbidities: ComorbidityGroup[];
  managementPlans: ComorbidityManagementPlan[];
  recommendedServices: ServiceCategory[];
  combinedApproach: string;
} {
  // Detect comorbidity patterns
  const detectedComorbidities = detectComorbidities(conditions);
  
  // Get management plans for detected comorbidities
  const managementPlans = detectedComorbidities.map(comorbidity => 
    COMORBIDITY_MANAGEMENT_PLANS[comorbidity.name]
  ).filter(Boolean);
  
  // Collect unique recommended services across all comorbidities
  const recommendedServices = Array.from(new Set(
    managementPlans.flatMap(plan => 
      plan.serviceRecommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3) // Take top 3 services from each plan
        .map(rec => rec.service)
    )
  ));
  
  // Generate a combined approach description
  let combinedApproach = "";
  if (managementPlans.length > 0) {
    combinedApproach = "Your health plan addresses multiple interconnected conditions with a coordinated care approach. ";
    combinedApproach += managementPlans.map(plan => plan.integratedApproach).join(" ");
  }
  
  return {
    detectedComorbidities,
    managementPlans,
    recommendedServices,
    combinedApproach
  };
}

/**
 * Generates detailed explanations for comorbidity management
 */
export function generateComorbidityExplanation(
  comorbidityName: string
): string {
  const plan = COMORBIDITY_MANAGEMENT_PLANS[comorbidityName];
  
  if (!plan) {
    return "";
  }
  
  return `${plan.comorbidityGroup.name}: ${plan.integratedApproach} ${plan.successStrategies[0]}`;
}

/**
 * Identifies which services should be prioritized for comorbidity management
 */
export function prioritizeComorbidityServices(
  detectedComorbidities: ComorbidityGroup[],
  availableServices: ServiceCategory[]
): {
  priorityServices: ServiceCategory[];
  priorityReasons: Record<ServiceCategory, string>;
  recommendedSessionsMultiplier: Record<ServiceCategory, number>;
} {
  const priorityServices: ServiceCategory[] = [];
  const priorityReasons: Record<ServiceCategory, string> = {};
  const recommendedSessionsMultiplier: Record<ServiceCategory, number> = {};
  
  // Process each comorbidity to find priorities
  detectedComorbidities.forEach(comorbidity => {
    const plan = COMORBIDITY_MANAGEMENT_PLANS[comorbidity.name];
    
    if (plan) {
      // Get top priority services from this plan
      const topServices = plan.serviceRecommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3); // Top 3 services
      
      topServices.forEach(recommendation => {
        const service = recommendation.service;
        
        // Only include services that are available
        if (availableServices.includes(service)) {
          // Add to priority list if not already there
          if (!priorityServices.includes(service)) {
            priorityServices.push(service);
          }
          
          // Add priority reason
          priorityReasons[service] = recommendation.recommendationReason;
          
          // Recommend more sessions for comorbidity management
          recommendedSessionsMultiplier[service] = 1.5; // 50% more sessions
        }
      });
    }
  });
  
  return {
    priorityServices,
    priorityReasons,
    recommendedSessionsMultiplier
  };
}
