import { AIHealthPlan, ServiceCategory, Practitioner } from "@/types";
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
  
  { term: "running", category: "personal-trainer", priority: 2 },
  { term: "strength", category: "personal-trainer", priority: 2 },
  { term: "muscle", category: "personal-trainer", priority: 1 },
  { term: "gym", category: "personal-trainer", priority: 1 },
  { term: "training", category: "personal-trainer", priority: 1 },
  { term: "exercise", category: "personal-trainer", priority: 1 },
  { term: "fitness", category: "personal-trainer", priority: 1 },
  { term: "toned", category: "personal-trainer", priority: 2 },
  { term: "marathon", category: "personal-trainer", priority: 3 },
  
  { term: "weight loss", category: "dietician", priority: 2 },
  { term: "nutrition", category: "dietician", priority: 2 },
  { term: "diet", category: "dietician", priority: 2 },
  { term: "eating", category: "dietician", priority: 1 },
  { term: "food", category: "dietician", priority: 1 },
  { term: "weight gain", category: "dietician", priority: 3 },
  { term: "energy", category: "dietician", priority: 1 },
  { term: "meal", category: "dietician", priority: 2 },
  
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
];

const onlineKeywords = [
  { term: "online", preference: true },
  { term: "virtual", preference: true },
  { term: "remote", preference: true },
  { term: "in-person", preference: false },
  { term: "face to face", preference: false },
];

const goalKeywords = [
  { term: "lose weight", goal: "weight loss" },
  { term: "weight loss", goal: "weight loss" },
  { term: "get stronger", goal: "strength improvement" },
  { term: "build muscle", goal: "muscle building" },
  { term: "tone up", goal: "body toning" },
  { term: "run", goal: "running performance" },
  { term: "marathon", goal: "marathon training" },
  { term: "back pain", goal: "back pain relief" },
  { term: "stress", goal: "stress management" },
  { term: "anxiety", goal: "anxiety reduction" },
  { term: "posture", goal: "posture improvement" },
  { term: "mobility", goal: "improved mobility" },
  { term: "energy", goal: "increased energy" },
  { term: "rehabilitation", goal: "rehabilitation" },
  { term: "recovery", goal: "injury recovery" },
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
    obstacle: undefined
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
  obstacle?: string,
  preferOnline?: boolean,
  budget?: number
): Practitioner[] => {
  let practitioners = PRACTITIONERS.filter(p => p.serviceType === serviceCategory);
  
  if (budget) {
    practitioners = practitioners.filter(p => p.pricePerSession <= budget);
  }
  
  if (preferOnline !== undefined) {
    practitioners = practitioners.filter(p => preferOnline === p.isOnline);
  }
  
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
  
  return practitioners.slice(0, 3);
};

const createBalancedServiceCombination = (
  categories: ServiceCategory[],
  budget: number,
  planType: 'best-fit' | 'high-impact' | 'progressive',
  goal?: string,
  obstacle?: string,
  preferOnline?: boolean
): {
  type: ServiceCategory,
  price: number,
  sessions: number,
  description: string,
  recommendedPractitioners?: Practitioner[]
}[] => {
  const serviceInfo: Partial<Record<ServiceCategory, {
    basePrice: number;
    minSessions: number;
    maxSessions: number;
    digitalOption?: { price: number; description: string };
  }>> = {
    'dietician': {
      basePrice: 350,
      minSessions: 1,
      maxSessions: 4,
      digitalOption: {
        price: 250,
        description: "Personalized meal plan & nutrition guide"
      }
    },
    'personal-trainer': {
      basePrice: 300,
      minSessions: 1,
      maxSessions: 8,
      digitalOption: {
        price: 200,
        description: "Custom workout program with video tutorials"
      }
    },
    'physiotherapist': {
      basePrice: 400,
      minSessions: 1,
      maxSessions: 4,
      digitalOption: {
        price: 250,
        description: "Rehab program with exercise videos"
      }
    },
    'biokineticist': {
      basePrice: 450,
      minSessions: 1,
      maxSessions: 4,
      digitalOption: {
        price: 300,
        description: "Specialized movement program"
      }
    },
    'coaching': {
      basePrice: 300,
      minSessions: 1,
      maxSessions: 4,
      digitalOption: {
        price: 200,
        description: "Guided mindset & accountability program"
      }
    },
    'family-medicine': {
      basePrice: 400,
      minSessions: 1,
      maxSessions: 2,
      digitalOption: {
        price: 300,
        description: "Virtual consultation and follow-up plan"
      }
    },
    'internal-medicine': {
      basePrice: 500,
      minSessions: 1,
      maxSessions: 2,
      digitalOption: {
        price: 400,
        description: "Comprehensive health assessment"
      }
    }
  };

  const distributionRatios = {
    'best-fit': {primary: 0.4, secondary: 0.3, tertiary: 0.3},
    'high-impact': {primary: 0.5, secondary: 0.3, tertiary: 0.2},
    'progressive': {primary: 0.6, secondary: 0.4, tertiary: 0}
  };

  const ratio = distributionRatios[planType];
  
  if (goal) {
    const goalRelevance: Partial<Record<string, ServiceCategory[]>> = {
      'weight loss': ['personal-trainer', 'dietician', 'coaching'],
      'muscle building': ['personal-trainer', 'coaching', 'dietician'],
      'rehabilitation': ['physiotherapist', 'biokineticist', 'coaching'],
      'back pain relief': ['physiotherapist', 'biokineticist', 'coaching'],
      'running performance': ['coaching', 'personal-trainer', 'physiotherapist'],
      'marathon training': ['coaching', 'personal-trainer', 'dietician'],
      'stress management': ['coaching', 'personal-trainer', 'dietician'],
      'strength improvement': ['personal-trainer', 'coaching', 'biokineticist'],
      'posture improvement': ['physiotherapist', 'biokineticist', 'coaching'],
      'injury recovery': ['physiotherapist', 'biokineticist', 'coaching'],
      'general fitness': ['personal-trainer', 'coaching', 'dietician'],
      'strength training': ['personal-trainer', 'coaching', 'biokineticist'],
      'online coaching': ['coaching', 'personal-trainer', 'dietician'],
      'knee pain': ['physiotherapist', 'biokineticist', 'coaching'],
      'chronic condition': ['family-medicine', 'internal-medicine', 'dietician'],
      'digestive issues': ['dietician', 'internal-medicine', 'coaching'],
      'heart health': ['internal-medicine', 'dietician', 'biokineticist']
    };

    const relevantOrder = goalRelevance[goal];
    if (relevantOrder) {
      categories = [...categories].sort((a, b) => {
        const aIndex = relevantOrder.indexOf(a);
        const bIndex = relevantOrder.indexOf(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
  }

  if (categories.length < 2) {
    const alternatives = findAlternativeCategories(categories);
    categories = [...categories, ...alternatives].slice(0, 3);
  }

  const services = [];
  let remainingBudget = budget;
  
  const getServiceDescription = (category: ServiceCategory, isSession: boolean, goal?: string, obstacle?: string): string => {
    const baseDescriptions: Partial<Record<ServiceCategory, string>> = {
      'dietician': isSession ? "Nutrition consultation & diet planning" : "Personalized meal plan",
      'personal-trainer': isSession ? "Guided workout session" : "Custom workout program",
      'physiotherapist': isSession ? "Therapeutic assessment & treatment" : "Rehabilitation program",
      'biokineticist': isSession ? "Movement therapy session" : "Movement optimization plan",
      'coaching': isSession ? "Wellness strategy & motivation session" : "Mindset & accountability program",
      'family-medicine': isSession ? "Medical consultation & diagnosis" : "Health assessment & care plan",
      'internal-medicine': isSession ? "Comprehensive medical evaluation" : "Specialized treatment protocol",
      'pediatrics': isSession ? "Child health assessment" : "Child wellness plan",
      'cardiology': isSession ? "Heart health evaluation" : "Cardiac care protocol",
      'psychiatry': isSession ? "Mental health consultation" : "Psychological support plan"
    };
    
    if (goal && category) {
      const goalDescriptions: Record<string, Partial<Record<ServiceCategory, string>>> = {
        'weight loss': {
          'dietician': isSession ? "Weight loss nutrition consultation" : "Customized weight loss meal plan",
          'personal-trainer': isSession ? "Fat-burning workout session" : "Progressive weight loss training program"
        },
        'back pain': {
          'physiotherapist': isSession ? "Back pain assessment & treatment" : "Back pain relief program", 
          'biokineticist': isSession ? "Spine mobility & strength session" : "Back strengthening program"
        },
        'marathon training': {
          'personal-trainer': isSession ? "Runner's conditioning session" : "Marathon preparation program",
          'physiotherapist': isSession ? "Runner's biomechanics assessment" : "Running form optimization guide"
        },
        'stress management': {
          'coaching': isSession ? "Stress reduction coaching session" : "Comprehensive stress management plan"
        }
      };
      
      if (goalDescriptions[goal] && goalDescriptions[goal][category]) {
        return goalDescriptions[goal][category] as string;
      }
    }
    
    return baseDescriptions[category] || 
           (isSession ? "Professional consultation session" : "Personalized health program");
  };
  
  const primaryCategory = categories[0];
  const primaryBudget = Math.floor(budget * ratio.primary);
  const primaryServiceInfo = serviceInfo[primaryCategory];
  
  let primaryIsDigital = false;
  
  if (obstacle && (obstacle === 'location limitations' || obstacle === 'time constraints')) {
    primaryIsDigital = true;
  }
  
  if (primaryServiceInfo && primaryServiceInfo.basePrice <= primaryBudget && !primaryIsDigital) {
    const possibleSessions = Math.min(
      Math.floor(primaryBudget / primaryServiceInfo.basePrice),
      primaryServiceInfo.maxSessions
    );
    
    const sessions = Math.max(primaryServiceInfo.minSessions, possibleSessions);
    const cost = sessions * primaryServiceInfo.basePrice;
    
    services.push({
      type: primaryCategory,
      price: primaryServiceInfo.basePrice,
      sessions: sessions,
      description: getServiceDescription(primaryCategory, true, goal, obstacle),
      recommendedPractitioners: getSuitablePractitioners(primaryCategory, goal, obstacle, preferOnline, primaryServiceInfo.basePrice)
    });
    
    remainingBudget -= cost;
  } 
  else if (primaryServiceInfo && primaryServiceInfo.digitalOption) {
    services.push({
      type: primaryCategory,
      price: primaryServiceInfo.digitalOption.price,
      sessions: 1,
      description: primaryServiceInfo.digitalOption.description,
      recommendedPractitioners: getSuitablePractitioners(primaryCategory, goal, obstacle, true, primaryServiceInfo.digitalOption.price)
    });
    
    remainingBudget -= primaryServiceInfo.digitalOption.price;
  }
  
  if (remainingBudget > 0 && categories.length > 1) {
    const secondaryCategory = categories[1];
    const secondaryBudget = Math.floor(budget * ratio.secondary);
    const secondaryServiceInfo = serviceInfo[secondaryCategory];
    
    if (secondaryServiceInfo && secondaryServiceInfo.basePrice <= secondaryBudget) {
      const possibleSessions = Math.min(
        Math.floor(secondaryBudget / secondaryServiceInfo.basePrice),
        secondaryServiceInfo.maxSessions
      );
      
      const sessions = Math.max(1, possibleSessions);
      const cost = sessions * secondaryServiceInfo.basePrice;
      
      services.push({
        type: secondaryCategory,
        price: secondaryServiceInfo.basePrice,
        sessions: sessions,
        description: getServiceDescription(secondaryCategory, true, goal, obstacle),
        recommendedPractitioners: getSuitablePractitioners(secondaryCategory, goal, obstacle, preferOnline, secondaryServiceInfo.basePrice)
      });
      
      remainingBudget -= cost;
    } 
    else if (secondaryServiceInfo && secondaryServiceInfo.digitalOption && secondaryServiceInfo.digitalOption.price <= remainingBudget) {
      services.push({
        type: secondaryCategory,
        price: secondaryServiceInfo.digitalOption.price,
        sessions: 1,
        description: secondaryServiceInfo.digitalOption.description,
        recommendedPractitioners: getSuitablePractitioners(secondaryCategory, goal, obstacle, true, secondaryServiceInfo.digitalOption.price)
      });
      
      remainingBudget -= secondaryServiceInfo.digitalOption.price;
    }
  }
  
  if (remainingBudget > 200 && categories.length > 2 && planType !== 'progressive') {
    const tertiaryCategory = categories[2];
    const tertiaryServiceInfo = serviceInfo[tertiaryCategory];
    
    if (tertiaryServiceInfo && tertiaryServiceInfo.basePrice <= remainingBudget) {
      services.push({
        type: tertiaryCategory,
        price: tertiaryServiceInfo.basePrice,
        sessions: 1,
        description: getServiceDescription(tertiaryCategory, true, goal, obstacle),
        recommendedPractitioners: getSuitablePractitioners(tertiaryCategory, goal, obstacle, preferOnline, tertiaryServiceInfo.basePrice)
      });
    } 
    else if (tertiaryServiceInfo && tertiaryServiceInfo.digitalOption && tertiaryServiceInfo.digitalOption.price <= remainingBudget) {
      services.push({
        type: tertiaryCategory,
        price: tertiaryServiceInfo.digitalOption.price,
        sessions: 1,
        description: tertiaryServiceInfo.digitalOption.description,
        recommendedPractitioners: getSuitablePractitioners(tertiaryCategory, goal, obstacle, true, tertiaryServiceInfo.digitalOption.price)
      });
    }
  }
  
  return services;
};

export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  const options = analyzeUserInput(userQuery);
  const plans: AIHealthPlan[] = [];

  const planTypes: ('best-fit' | 'high-impact' | 'progressive')[] = ['best-fit', 'high-impact', 'progressive'];

  const descTemplates = {
    'best-fit': "Comprehensive wellness plan combining {focus} over {timeframe}, with flexible in-person and online options to achieve {goal}.",
    'high-impact': "Intensive program featuring {focus} over {timeframe}, utilizing both virtual and in-person sessions for {goal}.",
    'progressive': "Gradual approach with {focus} over {timeframe}, mixing online coaching and in-person support for {goal}."
  };

  planTypes.forEach((planType, index) => {
    const services = createBalancedServiceCombination(
      options.focus || [], 
      options.budget || 1000, 
      planType,
      options.goal,
      options.obstacle,
      options.preferOnline
    );

    const totalCost = services.reduce((sum, service) => 
      sum + (service.price * service.sessions), 0);

    const goalDescription = options.goal || 
      (options.focus?.length ? `${options.focus[0].replace('-', ' ')} improvement` : "overall wellness");

    const planFocus = services.map(s => s.type.replace('-', ' ')).join(', ');
    const planDesc = descTemplates[planType]
      .replace('{focus}', planFocus)
      .replace('{timeframe}', options.timeframe || '8 weeks')
      .replace('{goal}', goalDescription);

    const planName = planType === 'best-fit' 
      ? 'Integrated Wellness Plan' 
      : planType === 'high-impact' 
        ? 'Accelerated Results Plan' 
        : 'Progressive Development Plan';

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
  const commonConditions: Record<string, ServiceCategory[]> = {
    'diabetes': ['family-medicine', 'dietician', 'personal-trainer'],
    'hypertension': ['family-medicine', 'dietician', 'biokineticist'],
    'back pain': ['physiotherapist', 'biokineticist', 'coaching'],
    'obesity': ['dietician', 'personal-trainer', 'family-medicine'],
    'depression': ['psychiatry', 'coaching', 'personal-trainer'],
    'anxiety': ['psychiatry', 'coaching', 'biokineticist'],
    'heart disease': ['cardiology', 'dietician', 'biokineticist'],
    'stroke recovery': ['physiotherapist', 'coaching', 'dietician'],
    'arthritis': ['rheumatology', 'physiotherapist', 'biokineticist'],
    'chronic pain': ['pain-management', 'physiotherapist', 'psychiatry'],
    'injury recovery': ['physiotherapist', 'biokineticist', 'coaching']
  };

  let categories: ServiceCategory[] = ['family-medicine', 'physiotherapist', 'dietician'];

  for (const [knownCondition, categoryList] of Object.entries(commonConditions)) {
    if (condition.toLowerCase().includes(knownCondition)) {
      categories = categoryList;
      break;
    }
  }

  const services = createBalancedServiceCombination(
    categories,
    budget,
    'best-fit',
    condition
  );

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
