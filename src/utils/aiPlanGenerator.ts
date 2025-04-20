
import { AIHealthPlan, ServiceCategory, Practitioner, UserCriteria } from "@/types";
import { PRACTITIONERS } from '@/data/mockData';

interface PlanOptions {
  costFactor?: number;
  intensity?: "low" | "medium" | "high";
  timeframe?: string;
  focus?: ServiceCategory[];
  preferOnline?: boolean;
  budget?: number;
  goal?: string;
  obstacle?: string;
  location?: string;
}

// Budget tiers for plan generation
enum BudgetTier {
  Low = "low",         // R500-R1,000/month
  Medium = "medium",   // R1,500-R2,500/month
  High = "high"        // R3,500-R5,000/month
}

// Goal categories to help with professional allocation
enum GoalCategory {
  WeightLoss = "weight loss",
  MuscleGain = "muscle gain",
  GeneralFitness = "general fitness",
  Rehabilitation = "rehabilitation",
  ChronicCondition = "chronic condition",
  Performance = "performance",
  Running = "running"
}

const healthKeywords = [
  { term: "injured", category: "physiotherapist", priority: 2 },
  { term: "injury", category: "physiotherapist", priority: 2 },
  { term: "pain", category: "physiotherapist", priority: 2 },
  { term: "recover", category: "physiotherapist", priority: 1 },
  { term: "rehabilitation", category: "physiotherapist", priority: 2 },
  { term: "physio", category: "physiotherapist", priority: 3 },
  { term: "back pain", category: "physiotherapist", priority: 3 },
  { term: "neck pain", category: "physiotherapist", priority: 3 },
  { term: "knee", category: "physiotherapist", priority: 2 },
  { term: "posture", category: "physiotherapist", priority: 2 },
  { term: "shoulder", category: "physiotherapist", priority: 2 },
  { term: "wrist", category: "physiotherapist", priority: 2 },
  { term: "ankle", category: "physiotherapist", priority: 2 },
  
  { term: "running", category: "coaching", priority: 2 },
  { term: "marathon", category: "coaching", priority: 3 },
  { term: "half-marathon", category: "coaching", priority: 3 },
  { term: "cardio", category: "coaching", priority: 2 },
  { term: "run", category: "coaching", priority: 2 },
  { term: "runner", category: "coaching", priority: 2 },
  { term: "jog", category: "coaching", priority: 2 },
  
  { term: "strength", category: "personal-trainer", priority: 2 },
  { term: "muscle", category: "personal-trainer", priority: 1 },
  { term: "gym", category: "personal-trainer", priority: 1 },
  { term: "training", category: "personal-trainer", priority: 1 },
  { term: "exercise", category: "personal-trainer", priority: 1 },
  { term: "fitness", category: "personal-trainer", priority: 1 },
  { term: "toned", category: "personal-trainer", priority: 2 },
  { term: "strong", category: "personal-trainer", priority: 2 },
  { term: "weights", category: "personal-trainer", priority: 2 },
  { term: "lifting", category: "personal-trainer", priority: 2 },
  
  { term: "weight loss", category: "dietician", priority: 2 },
  { term: "nutrition", category: "dietician", priority: 2 },
  { term: "diet", category: "dietician", priority: 2 },
  { term: "eating", category: "dietician", priority: 1 },
  { term: "food", category: "dietician", priority: 1 },
  { term: "weight gain", category: "dietician", priority: 3 },
  { term: "energy", category: "dietician", priority: 1 },
  { term: "meal", category: "dietician", priority: 2 },
  { term: "vegan", category: "dietician", priority: 2 },
  { term: "vegetarian", category: "dietician", priority: 2 },
  { term: "protein", category: "dietician", priority: 2 },
  
  { term: "mental", category: "coaching", priority: 2 },
  { term: "motivation", category: "coaching", priority: 2 },
  { term: "goals", category: "coaching", priority: 1 },
  { term: "stress", category: "coaching", priority: 2 },
  { term: "anxiety", category: "coaching", priority: 2 },
  { term: "mindset", category: "coaching", priority: 2 },
  { term: "routine", category: "coaching", priority: 1 },
  
  { term: "mobility", category: "biokineticist", priority: 2 },
  { term: "rehabilitation", category: "biokineticist", priority: 2 },
  { term: "movement", category: "biokineticist", priority: 1 },
  { term: "assessment", category: "biokineticist", priority: 1 },
  { term: "chronic", category: "biokineticist", priority: 2 },
  { term: "conditioning", category: "biokineticist", priority: 2 },
  
  { term: "diabetes", category: "family-medicine", priority: 3 },
  { term: "blood pressure", category: "family-medicine", priority: 3 },
  { term: "hypertension", category: "family-medicine", priority: 3 },
  { term: "asthma", category: "family-medicine", priority: 3 },
  { term: "thyroid", category: "family-medicine", priority: 3 },
  { term: "chronic fatigue", category: "family-medicine", priority: 3 },
  { term: "cholesterol", category: "family-medicine", priority: 3 },
  { term: "heart", category: "family-medicine", priority: 3 },
  { term: "doctor", category: "family-medicine", priority: 2 },
  { term: "medical", category: "family-medicine", priority: 2 },
];

const budgetKeywords = [
  { term: "cheap", factor: 0.5 },
  { term: "affordable", factor: 0.6 },
  { term: "budget", factor: 0.7 },
  { term: "expensive", factor: 1.4 },
  { term: "premium", factor: 1.4 },
  { term: "high-end", factor: 1.5 },
];

const intensityKeywords = [
  { term: "gentle", intensity: "low" as const },
  { term: "easy", intensity: "low" as const },
  { term: "beginner", intensity: "low" as const },
  { term: "moderate", intensity: "medium" as const },
  { term: "regular", intensity: "medium" as const },
  { term: "intermediate", intensity: "medium" as const },
  { term: "intense", intensity: "high" as const },
  { term: "advanced", intensity: "high" as const },
  { term: "hardcore", intensity: "high" as const },
];

const timeframeKeywords = [
  { term: "quick", timeframe: "4 weeks" },
  { term: "fast", timeframe: "4 weeks" },
  { term: "long term", timeframe: "12 weeks" },
  { term: "long-term", timeframe: "12 weeks" },
  { term: "sustainable", timeframe: "12 weeks" },
  { term: "months", timeframe: "12 weeks" },
  { term: "month", timeframe: "4 weeks" },
  { term: "weeks", timeframe: "4 weeks" },
  { term: "weekly", timeframe: "4 weeks" },
  { term: "6 months", timeframe: "24 weeks" },
  { term: "3 months", timeframe: "12 weeks" },
];

const onlineKeywords = [
  { term: "online", preference: true },
  { term: "virtual", preference: true },
  { term: "remote", preference: true },
  { term: "in-person", preference: false },
  { term: "face to face", preference: false },
];

const locationKeywords = [
  { term: "sea point", location: "Sea Point" },
  { term: "camps bay", location: "Camps Bay" },
  { term: "observatory", location: "Observatory" },
  { term: "claremont", location: "Claremont" },
  { term: "constantia", location: "Constantia" },
  { term: "mitchells plain", location: "Mitchell's Plain" },
  { term: "woodstock", location: "Woodstock" },
  { term: "table view", location: "Table View" },
  { term: "bellville", location: "Bellville" },
  { term: "durbanville", location: "Durbanville" },
];

const goalKeywords = [
  { term: "lose weight", goal: "weight loss" },
  { term: "weight loss", goal: "weight loss" },
  { term: "get stronger", goal: "strength improvement" },
  { term: "build muscle", goal: "muscle building" },
  { term: "tone up", goal: "body toning" },
  { term: "run", goal: "running performance" },
  { term: "marathon", goal: "marathon training" },
  { term: "half-marathon", goal: "half-marathon training" },
  { term: "back pain", goal: "back pain relief" },
  { term: "stress", goal: "stress management" },
  { term: "anxiety", goal: "anxiety reduction" },
  { term: "posture", goal: "posture improvement" },
  { term: "mobility", goal: "improved mobility" },
  { term: "energy", goal: "increased energy" },
  { term: "rehabilitation", goal: "rehabilitation" },
  { term: "recovery", goal: "injury recovery" },
  { term: "chronic fatigue", goal: "fatigue management" },
  { term: "diabetes", goal: "diabetes management" },
  { term: "blood pressure", goal: "blood pressure control" },
  { term: "asthma", goal: "asthma management" },
];

const healthConditionKeywords = [
  { term: "knee", condition: "knee issue" },
  { term: "back pain", condition: "back pain" },
  { term: "diabetes", condition: "diabetes" },
  { term: "asthma", condition: "asthma" },
  { term: "blood pressure", condition: "hypertension" },
  { term: "hypertension", condition: "hypertension" },
  { term: "anxiety", condition: "anxiety" },
  { term: "depression", condition: "depression" },
  { term: "shoulder", condition: "shoulder issue" },
  { term: "wrist", condition: "wrist issue" },
  { term: "ankle", condition: "ankle issue" },
  { term: "chronic fatigue", condition: "chronic fatigue" },
  { term: "thyroid", condition: "thyroid issue" },
];

const obstacleKeywords = [
  { term: "busy", obstacle: "time constraints" },
  { term: "no time", obstacle: "time constraints" },
  { term: "little time", obstacle: "time constraints" },
  { term: "limited time", obstacle: "time constraints" },
  { term: "motivation", obstacle: "lack of motivation" },
  { term: "budget", obstacle: "budget constraints" },
  { term: "cheap", obstacle: "budget constraints" },
  { term: "affordable", obstacle: "budget constraints" },
  { term: "injury", obstacle: "injury" },
  { term: "pain", obstacle: "pain" },
  { term: "distance", obstacle: "location limitations" },
  { term: "far", obstacle: "location limitations" },
  { term: "knowledge", obstacle: "lack of knowledge" },
  { term: "not sure", obstacle: "lack of knowledge" },
  { term: "limited access", obstacle: "access limitations" },
  { term: "discipline", obstacle: "lack of discipline" },
  { term: "consistency", obstacle: "consistency challenges" },
];

// Function to determine budget tier based on monthly budget
const determineBudgetTier = (budget: number): BudgetTier => {
  if (budget <= 1000) return BudgetTier.Low;
  if (budget <= 2500) return BudgetTier.Medium;
  return BudgetTier.High;
};

// Function to determine appropriate service types based on goal category and budget tier
const determineServiceTypes = (
  goalCategory: string,
  budgetTier: BudgetTier,
  healthConditions: string[] = []
): {category: ServiceCategory, priority: number}[] => {
  const services: {category: ServiceCategory, priority: number}[] = [];
  
  switch (goalCategory) {
    case GoalCategory.WeightLoss:
      services.push({category: "dietician", priority: 5});
      services.push({category: "personal-trainer", priority: 4});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "coaching", priority: 3});
      }
      if (budgetTier === BudgetTier.High) {
        services.push({category: "family-medicine", priority: 2});
      }
      break;
      
    case GoalCategory.MuscleGain:
      services.push({category: "personal-trainer", priority: 5});
      services.push({category: "dietician", priority: 4});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "physiotherapist", priority: 2});
      }
      break;
      
    case GoalCategory.Rehabilitation:
      services.push({category: "physiotherapist", priority: 5});
      services.push({category: "biokineticist", priority: 4});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "personal-trainer", priority: 3});
      }
      if (budgetTier === BudgetTier.High) {
        services.push({category: "family-medicine", priority: 2});
      }
      break;
      
    case GoalCategory.Running:
      services.push({category: "coaching", priority: 5});
      services.push({category: "personal-trainer", priority: 3});
      services.push({category: "dietician", priority: 2});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "physiotherapist", priority: 3});
      }
      break;
      
    case GoalCategory.ChronicCondition:
      services.push({category: "family-medicine", priority: 5});
      services.push({category: "dietician", priority: 4});
      services.push({category: "personal-trainer", priority: 3});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "physiotherapist", priority: 2});
      }
      break;
      
    case GoalCategory.Performance:
      services.push({category: "personal-trainer", priority: 5});
      services.push({category: "coaching", priority: 4});
      services.push({category: "dietician", priority: 3});
      if (budgetTier === BudgetTier.High) {
        services.push({category: "physiotherapist", priority: 2});
      }
      break;
      
    case GoalCategory.GeneralFitness:
    default:
      services.push({category: "personal-trainer", priority: 5});
      services.push({category: "dietician", priority: 3});
      if (budgetTier === BudgetTier.Medium || budgetTier === BudgetTier.High) {
        services.push({category: "coaching", priority: 2});
      }
      if (budgetTier === BudgetTier.High) {
        services.push({category: "physiotherapist", priority: 1});
      }
      break;
  }
  
  // Add health condition-specific services
  for (const condition of healthConditions) {
    if (condition.includes("knee") || condition.includes("shoulder") || 
        condition.includes("back") || condition.includes("ankle") || 
        condition.includes("wrist")) {
      if (!services.some(s => s.category === "physiotherapist")) {
        services.push({category: "physiotherapist", priority: 4});
      }
    }
    
    if (condition.includes("diabetes") || condition.includes("hypertension") || 
        condition.includes("asthma") || condition.includes("thyroid") ||
        condition.includes("chronic fatigue")) {
      if (!services.some(s => s.category === "family-medicine")) {
        services.push({category: "family-medicine", priority: 4});
      }
      if (!services.some(s => s.category === "dietician")) {
        services.push({category: "dietician", priority: 3});
      }
    }
    
    if (condition.includes("anxiety") || condition.includes("depression")) {
      if (!services.some(s => s.category === "coaching")) {
        services.push({category: "coaching", priority: 4});
      }
    }
  }
  
  // Sort by priority
  return services.sort((a, b) => b.priority - a.priority);
};

// Function to calculate session distribution based on budget tier and service priorities
const calculateSessionDistribution = (
  budget: number, 
  services: {category: ServiceCategory, priority: number}[],
  location?: string,
  preferOnline?: boolean
): {
  type: ServiceCategory,
  price: number,
  sessions: number,
  description: string,
  isHighEnd: boolean
}[] => {
  if (services.length === 0) return [];
  
  const budgetTier = determineBudgetTier(budget);
  const totalPriority = services.reduce((sum, service) => sum + service.priority, 0);
  const plan: {
    type: ServiceCategory,
    price: number,
    sessions: number,
    description: string,
    isHighEnd: boolean
  }[] = [];
  
  // Price ranges by service category and budget tier
  const priceRanges: Record<ServiceCategory, Record<BudgetTier, {affordable: number, highEnd: number}>> = {
    "dietician": {
      "low": {affordable: 200, highEnd: 350},
      "medium": {affordable: 300, highEnd: 600},
      "high": {affordable: 400, highEnd: 800}
    },
    "personal-trainer": {
      "low": {affordable: 150, highEnd: 300},
      "medium": {affordable: 250, highEnd: 500},
      "high": {affordable: 400, highEnd: 800}
    },
    "physiotherapist": {
      "low": {affordable: 350, highEnd: 500},
      "medium": {affordable: 450, highEnd: 800},
      "high": {affordable: 600, highEnd: 1200}
    },
    "biokineticist": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 600, highEnd: 1000}
    },
    "coaching": {
      "low": {affordable: 150, highEnd: 300},
      "medium": {affordable: 250, highEnd: 500},
      "high": {affordable: 350, highEnd: 800}
    },
    "family-medicine": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 500, highEnd: 1200}
    },
    "internal-medicine": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 600, highEnd: 1200}
    },
    // Default values for other service categories
    "pediatrics": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 500, highEnd: 900}
    },
    "cardiology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "dermatology": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 500, highEnd: 900}
    },
    "orthopedics": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "neurology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "gastroenterology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "obstetrics-gynecology": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 500, highEnd: 900}
    },
    "emergency-medicine": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "psychiatry": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "anesthesiology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "endocrinology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "urology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "oncology": {
      "low": {affordable: 500, highEnd: 700},
      "medium": {affordable: 600, highEnd: 900},
      "high": {affordable: 800, highEnd: 1400}
    },
    "neurosurgery": {
      "low": {affordable: 500, highEnd: 700},
      "medium": {affordable: 600, highEnd: 900},
      "high": {affordable: 800, highEnd: 1400}
    },
    "infectious-disease": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "radiology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "geriatric-medicine": {
      "low": {affordable: 300, highEnd: 500},
      "medium": {affordable: 400, highEnd: 700},
      "high": {affordable: 500, highEnd: 900}
    },
    "plastic-surgery": {
      "low": {affordable: 500, highEnd: 800},
      "medium": {affordable: 700, highEnd: 1200},
      "high": {affordable: 1000, highEnd: 2000}
    },
    "rheumatology": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    },
    "pain-management": {
      "low": {affordable: 400, highEnd: 600},
      "medium": {affordable: 500, highEnd: 800},
      "high": {affordable: 700, highEnd: 1200}
    }
  };
  
  // Session description templates by service type
  const sessionDescriptions: Record<ServiceCategory, {
    affordable: string,
    highEnd: string
  }> = {
    "dietician": {
      affordable: "Group nutrition workshop with diet guidance",
      highEnd: "One-on-one comprehensive nutritional assessment and personalized meal planning"
    },
    "personal-trainer": {
      affordable: "Group fitness training session with strength and cardio focus",
      highEnd: "Personalized one-on-one training session with customized exercise programming"
    },
    "physiotherapist": {
      affordable: "Clinical assessment and therapeutic exercises for recovery",
      highEnd: "Comprehensive manual therapy and rehabilitation with personalized home exercise program"
    },
    "biokineticist": {
      affordable: "Functional movement assessment and corrective exercise guidance",
      highEnd: "In-depth biomechanical analysis and specialized rehabilitation programming"
    },
    "coaching": {
      affordable: "Group coaching session with technique guidance and motivation",
      highEnd: "Private coaching with personalized training plan and performance analysis"
    },
    "family-medicine": {
      affordable: "Clinical consultation with basic health assessment",
      highEnd: "Comprehensive medical evaluation with detailed health recommendations"
    },
    "internal-medicine": {
      affordable: "Medical assessment focusing on internal health systems",
      highEnd: "Specialized internal medicine consultation with comprehensive testing"
    },
    // Default values for other categories
    "pediatrics": {
      affordable: "Standard pediatric check-up and assessment",
      highEnd: "Comprehensive pediatric health evaluation and development plan"
    },
    "cardiology": {
      affordable: "Basic heart health assessment and monitoring",
      highEnd: "Comprehensive cardiac evaluation with advanced diagnostics"
    },
    "dermatology": {
      affordable: "Standard skin assessment and treatment recommendations",
      highEnd: "Advanced dermatological consultation with specialized treatment plan"
    },
    "orthopedics": {
      affordable: "Basic orthopedic assessment and treatment guidance",
      highEnd: "Comprehensive orthopedic evaluation with specialized therapy recommendations"
    },
    "neurology": {
      affordable: "Basic neurological assessment and monitoring",
      highEnd: "Comprehensive neurological evaluation with detailed treatment plan"
    },
    "gastroenterology": {
      affordable: "Digestive health assessment and diet recommendations",
      highEnd: "Comprehensive gastroenterological evaluation and specialized treatment plan"
    },
    "obstetrics-gynecology": {
      affordable: "Standard gynecological check-up and health guidance",
      highEnd: "Comprehensive women's health evaluation and personalized care plan"
    },
    "emergency-medicine": {
      affordable: "Urgent care assessment and treatment planning",
      highEnd: "Comprehensive emergency medicine consultation with follow-up care plan"
    },
    "psychiatry": {
      affordable: "Mental health assessment and basic care recommendations",
      highEnd: "In-depth psychiatric evaluation and personalized treatment planning"
    },
    "anesthesiology": {
      affordable: "Pre-operative assessment and anesthesia planning",
      highEnd: "Comprehensive anesthesia consultation with detailed risk assessment"
    },
    "endocrinology": {
      affordable: "Hormonal health assessment and basic treatment guidance",
      highEnd: "Comprehensive endocrine evaluation with specialized treatment plan"
    },
    "urology": {
      affordable: "Basic urological health assessment and recommendations",
      highEnd: "Comprehensive urological evaluation and personalized treatment plan"
    },
    "oncology": {
      affordable: "Cancer screening and prevention counseling",
      highEnd: "Comprehensive oncological evaluation and specialized treatment planning"
    },
    "neurosurgery": {
      affordable: "Neurosurgical assessment and treatment options",
      highEnd: "Comprehensive neurosurgical consultation with detailed intervention planning"
    },
    "infectious-disease": {
      affordable: "Infection assessment and treatment guidance",
      highEnd: "Comprehensive infectious disease evaluation and specialized treatment plan"
    },
    "radiology": {
      affordable: "Basic imaging assessment and interpretation",
      highEnd: "Comprehensive radiological evaluation with detailed findings analysis"
    },
    "geriatric-medicine": {
      affordable: "Senior health assessment and basic care recommendations",
      highEnd: "Comprehensive geriatric evaluation and personalized care planning"
    },
    "plastic-surgery": {
      affordable: "Cosmetic assessment and procedural options discussion",
      highEnd: "Comprehensive cosmetic evaluation and detailed treatment planning"
    },
    "rheumatology": {
      affordable: "Rheumatological assessment and treatment guidance",
      highEnd: "Comprehensive evaluation of joint health with specialized treatment plan"
    },
    "pain-management": {
      affordable: "Pain assessment and basic management strategies",
      highEnd: "Comprehensive pain evaluation and multimodal treatment approach"
    }
  };
  
  // Calculate budget allocation per service based on priority
  let remainingBudget = budget;
  
  for (const service of services) {
    if (remainingBudget <= 0) break;
    
    const allocation = (service.priority / totalPriority) * budget;
    const priceRange = priceRanges[service.category][budgetTier];
    
    // Determine if we should use high-end or affordable sessions based on budget tier
    let isHighEnd = false;
    if (budgetTier === BudgetTier.High) {
      isHighEnd = true;
    } else if (budgetTier === BudgetTier.Medium) {
      isHighEnd = service === services[0]; // High-end only for primary service in medium tier
    }
    
    const sessionPrice = isHighEnd ? priceRange.highEnd : priceRange.affordable;
    const sessionDescription = isHighEnd ? 
      sessionDescriptions[service.category].highEnd : 
      sessionDescriptions[service.category].affordable;
    
    let sessions = Math.floor(allocation / sessionPrice);
    
    // Ensure at least 1 session if this is a high-priority service
    if (sessions === 0 && service.priority >= 4) {
      sessions = 1;
    }
    
    // Cap sessions based on budget tier and service type
    const maxSessions = {
      "low": 2,
      "medium": 3,
      "high": 4
    }[budgetTier];
    
    sessions = Math.min(sessions, maxSessions);
    
    if (sessions > 0) {
      plan.push({
        type: service.category,
        price: sessionPrice,
        sessions: sessions,
        description: sessionDescription,
        isHighEnd: isHighEnd
      });
      
      remainingBudget -= sessionPrice * sessions;
    }
  }
  
  // If we have budget left and less than 3 services, add more sessions to existing services
  if (remainingBudget > 0 && plan.length > 0 && plan.length < 3) {
    // Add an extra session to the highest priority service
    const primaryService = plan[0];
    if (remainingBudget >= primaryService.price) {
      primaryService.sessions += 1;
      remainingBudget -= primaryService.price;
    }
  }
  
  return plan;
};

export const analyzeUserInput = (input: string): PlanOptions => {
  const lowerInput = input.toLowerCase();
  const options: PlanOptions = {
    costFactor: 1.0,
    intensity: "medium",
    timeframe: "8 weeks",
    focus: [],
    preferOnline: false,
    budget: 1000,
    goal: undefined,
    obstacle: undefined,
    location: undefined
  };

  const categoryScores: Record<ServiceCategory, number> = {
    'dietician': 0,
    'personal-trainer': 0,
    'biokineticist': 0,
    'physiotherapist': 0,
    'coaching': 0,
    'family-medicine': 0,
    'internal-medicine': 0,
    'pediatrics': 0,
    'cardiology': 0,
    'dermatology': 0,
    'orthopedics': 0,
    'neurology': 0,
    'gastroenterology': 0,
    'obstetrics-gynecology': 0,
    'emergency-medicine': 0,
    'psychiatry': 0,
    'anesthesiology': 0,
    'endocrinology': 0,
    'urology': 0,
    'oncology': 0,
    'neurosurgery': 0,
    'infectious-disease': 0,
    'radiology': 0,
    'geriatric-medicine': 0,
    'plastic-surgery': 0,
    'rheumatology': 0,
    'pain-management': 0
  };

  healthKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      const category = keyword.category as ServiceCategory;
      categoryScores[category] += keyword.priority;
    }
  });

  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .map(([category]) => category as ServiceCategory);

  options.focus = sortedCategories.length > 0 ? 
    sortedCategories.slice(0, 3) : 
    ['personal-trainer', 'dietician', 'coaching'];

  budgetKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.costFactor = keyword.factor;
    }
  });

  intensityKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.intensity = keyword.intensity;
    }
  });

  timeframeKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.timeframe = keyword.timeframe;
    }
  });

  onlineKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.preferOnline = keyword.preference;
    }
  });
  
  locationKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.location = keyword.location;
    }
  });

  const budgetMatch = input.match(/R?(\d+)(?:\s*(?:per|a|\/)\s*(?:month|session|week))?/i);
  if (budgetMatch) {
    const extractedBudget = parseInt(budgetMatch[1]);
    if (extractedBudget > 0) {
      options.budget = extractedBudget;
      options.costFactor = extractedBudget < 500 ? 0.6 : extractedBudget > 1500 ? 1.3 : 1.0;
    }
  }

  for (const keyword of goalKeywords) {
    if (lowerInput.includes(keyword.term)) {
      options.goal = keyword.goal;
      break;
    }
  }

  for (const keyword of obstacleKeywords) {
    if (lowerInput.includes(keyword.term)) {
      options.obstacle = keyword.obstacle;
      break;
    }
  }

  return options;
};

export const findAlternativeCategories = (selectedCategories: ServiceCategory[]): ServiceCategory[] => {
  const complementaryPairs: Partial<Record<ServiceCategory, ServiceCategory[]>> = {
    'dietician': ['personal-trainer', 'coaching'],
    'personal-trainer': ['dietician', 'physiotherapist'],
    'physiotherapist': ['personal-trainer', 'biokineticist'],
    'biokineticist': ['physiotherapist', 'coaching'],
    'coaching': ['dietician', 'personal-trainer']
  };

  if (selectedCategories.length === 0) {
    return ['coaching', 'dietician'];
  }

  const alternatives: ServiceCategory[] = [];
  selectedCategories.forEach(category => {
    const complements = complementaryPairs[category] || [];
    complements.forEach(complement => {
      if (!selectedCategories.includes(complement) && !alternatives.includes(complement)) {
        alternatives.push(complement);
      }
    });
  });

  return alternatives.slice(0, 2);
};

const getSuitablePractitioners = (
  serviceCategory: ServiceCategory,
  goal?: string,
  location?: string,
  preferOnline?: boolean,
  budget?: number,
  isHighEnd?: boolean
): Practitioner[] => {
  let practitioners = PRACTITIONERS.filter(p => p.serviceType === serviceCategory);
  
  // Filter by price based on high-end preference and budget
  if (budget) {
    if (isHighEnd) {
      practitioners = practitioners.filter(p => 
        p.pricePerSession <= budget && 
        // Higher price range for high-end
        p.pricePerSession >= budget * 0.6
      );
    } else {
      practitioners = practitioners.filter(p => 
        p.pricePerSession <= budget && 
        // Lower price range for affordable
        p.pricePerSession <= budget * 0.6
      );
    }
  }
  
  // Filter by location if specified
  if (location) {
    // First try exact location match
    const exactLocationMatches = practitioners.filter(p => 
      p.location.toLowerCase().includes(location.toLowerCase())
    );
    
    if (exactLocationMatches.length > 0) {
      practitioners = exactLocationMatches;
    } else {
      // Locations and their nearby areas (simplified implementation)
      const nearbyLocations: Record<string, string[]> = {
        "Sea Point": ["Green Point", "Bantry Bay", "Mouille Point"],
        "Camps Bay": ["Clifton", "Bantry Bay", "Sea Point"],
        "Observatory": ["Woodstock", "Mowbray", "Salt River"],
        "Claremont": ["Newlands", "Kenilworth", "Rondebosch"],
        "Constantia": ["Tokai", "Wynberg", "Bishopscourt"],
        "Table View": ["Bloubergstrand", "Milnerton", "Parklands"],
        "Mitchell's Plain": ["Athlone", "Strandfontein", "Philippi"]
      };
      
      const nearbyAreas = nearbyLocations[location] || [];
      const nearbyMatches = practitioners.filter(p => 
        nearbyAreas.some(area => p.location.toLowerCase().includes(area.toLowerCase()))
      );
      
      if (nearbyMatches.length > 0) {
        practitioners = nearbyMatches;
      }
    }
  }
  
  // Filter by online preference if specified
  if (preferOnline !== undefined) {
    practitioners = practitioners.filter(p => p.isOnline === preferOnline);
  }
  
  // Sort by relevance to goal if specified
  if (goal) {
    practitioners = practitioners.sort((a, b) => {
      const aRelevance = a.serviceTags.some(tag => 
        goal.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(goal.toLowerCase())
      ) ? 1 : 0;
      
      const bRelevance = b.serviceTags.some(tag => 
        goal.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(goal.toLowerCase())
      ) ? 1 : 0;
      
      return bRelevance - aRelevance;
    });
  }
  
  // Secondary sort by rating
  practitioners = practitioners.sort((a, b) => b.rating - a.rating);
  
  return practitioners.slice(0, 3);
};

export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  const options = analyzeUserInput(userQuery);
  const plans: AIHealthPlan[] = [];

  // Extract health conditions based on user query
  const lowerQuery = userQuery.toLowerCase();
  const healthConditions: string[] = [];
  
  healthConditionKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword.term)) {
      healthConditions.push(keyword.condition);
    }
  });

  // Categorize the goal for better service matching
  let goalCategory = GoalCategory.GeneralFitness;
  if (options.goal) {
    if (options.goal.includes("weight loss")) {
      goalCategory = GoalCategory.WeightLoss;
    } else if (options.goal.includes("muscle") || options.goal.includes("strength")) {
      goalCategory = GoalCategory.MuscleGain;
    } else if (options.goal.includes("run") || options.goal.includes("marathon")) {
      goalCategory = GoalCategory.Running;
    } else if (options.goal.includes("rehab") || options.goal.includes("recover") || 
               options.goal.includes("injury") || options.goal.includes("pain")) {
      goalCategory = GoalCategory.Rehabilitation;
    } else if (options.goal.includes("diabetes") || options.goal.includes("blood pressure") || 
               options.goal.includes("asthma") || options.goal.includes("fatigue")) {
      goalCategory = GoalCategory.ChronicCondition;
    }
  }

  // Determine budget tier
  const budgetTier = determineBudgetTier(options.budget || 1000);
  
  // Get appropriate service types based on goal and budget
  const requiredServices = determineServiceTypes(goalCategory, budgetTier, healthConditions);

  const planTypes: ('best-fit' | 'high-impact' | 'progressive')[] = ['best-fit', 'high-impact', 'progressive'];

  const descTemplates = {
    'best-fit': "Comprehensive wellness plan combining {focus} over {timeframe}, with balanced sessions to achieve {goal}.",
    'high-impact': "Intensive program featuring {focus} over {timeframe}, prioritizing results-focused services for {goal}.",
    'progressive': "Gradual approach with {focus} over {timeframe}, starting with essentials and building toward {goal}."
  };

  planTypes.forEach((planType, index) => {
    // Adjust service allocations based on plan type
    let adjustedServices = [...requiredServices];
    if (planType === 'high-impact') {
      // For high-impact, boost primary service priority
      if (adjustedServices.length > 0) {
        adjustedServices[0].priority += 2;
      }
    } else if (planType === 'progressive') {
      // For progressive, focus on fewer services
      adjustedServices = adjustedServices.slice(0, 2);
    }
    
    // Generate service distribution based on adjusted priorities
    const serviceTypes = adjustedServices.map(s => s.category);
    
    // Calculate session distribution
    const sessionDistribution = calculateSessionDistribution(
      options.budget || 1000,
      adjustedServices,
      options.location,
      options.preferOnline
    );
    
    // Enhance with practitioner recommendations
    const services = sessionDistribution.map(service => {
      const practitioners = getSuitablePractitioners(
        service.type,
        options.goal,
        options.location,
        options.preferOnline,
        service.price,
        service.isHighEnd
      );
      
      return {
        type: service.type,
        price: service.price,
        sessions: service.sessions,
        description: service.description,
        recommendedPractitioners: practitioners
      };
    });

    const totalCost = services.reduce((sum, service) => 
      sum + (service.price * service.sessions), 0);

    const goalDescription = options.goal || 
      (options.focus?.length ? `${options.focus[0].replace('-', ' ')} improvement` : "overall wellness");

    const planFocus = services.map(s => s.type.replace('-', ' ')).join(', ');
    const planDesc = descTemplates[planType]
      .replace('{focus}', planFocus)
      .replace('{timeframe}', options.timeframe || '8 weeks')
      .replace('{goal}', goalDescription);

    // Generate dynamic plan names based on goal and plan type
    let planName = "";
    if (planType === 'best-fit') {
      planName = `Balanced ${goalCategory.charAt(0).toUpperCase() + goalCategory.slice(1)} Plan`;
    } else if (planType === 'high-impact') {
      planName = `Intensive ${goalCategory.charAt(0).toUpperCase() + goalCategory.slice(1)} Program`;
    } else {
      planName = `Progressive ${goalCategory.charAt(0).toUpperCase() + goalCategory.slice(1)} Journey`;
    }

    plans.push({
      id: `plan-${index + 1}`,
      name: planName,
      description: planDesc,
      services: services.map(({ recommendedPractitioners, ...service }) => service),
      totalCost: totalCost,
      planType: planType,
      timeFrame: options.timeframe || '8 weeks'
    });
  });

  return plans;
};

export const generateMedicalManagementPlan = (
  condition: string,
  budget: number,
  timeframe: string = "12 weeks"
): AIHealthPlan => {
  // Determine appropriate services for the condition
  const lowerCondition = condition.toLowerCase();
  const healthConditions = [condition];
  
  // Map condition to goal category
  let goalCategory = GoalCategory.ChronicCondition;
  
  if (lowerCondition.includes("pain") || lowerCondition.includes("injury") || 
      lowerCondition.includes("sprain") || lowerCondition.includes("strain")) {
    goalCategory = GoalCategory.Rehabilitation;
  }
  
  // Determine budget tier
  const budgetTier = determineBudgetTier(budget);
  
  // Get appropriate service types
  const requiredServices = determineServiceTypes(goalCategory, budgetTier, healthConditions);
  
  // Calculate session distribution
  const sessionDistribution = calculateSessionDistribution(
    budget,
    requiredServices
  );
  
  // Enhance with practitioner recommendations
  const services = sessionDistribution.map(service => {
    const practitioners = getSuitablePractitioners(
      service.type,
      condition,
      undefined,
      false,
      service.price,
      service.isHighEnd
    );
    
    return {
      type: service.type,
      price: service.price,
      sessions: service.sessions,
      description: service.description,
      recommendedPractitioners: practitioners
    };
  });

  const totalCost = services.reduce((sum, service) => 
    sum + (service.price * service.sessions), 0);

  const planFocus = services.map(s => s.type.replace('-', ' ')).join(', ');
  
  return {
    id: `medical-plan-${Date.now().toString(36)}`,
    name: `Comprehensive ${condition} Management Plan`,
    description: `Integrated healthcare approach combining ${planFocus} over ${timeframe} to effectively manage ${condition} with personalized professional support.`,
    services: services.map(({ recommendedPractitioners, ...service }) => service),
    totalCost: totalCost,
    planType: 'best-fit',
    timeFrame: timeframe
  };
};
