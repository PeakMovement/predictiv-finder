
import { AIHealthPlan, ServiceCategory } from "@/types";

interface PlanOptions {
  costFactor?: number;
  intensity?: "low" | "medium" | "high";
  timeframe?: string;
  focus?: ServiceCategory[];
  preferOnline?: boolean;
}

// Keywords to detect in user input
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
  { term: "weight loss", category: "dietician", priority: 2 },
  { term: "nutrition", category: "dietician", priority: 2 },
  { term: "diet", category: "dietician", priority: 2 },
  { term: "eating", category: "dietician", priority: 1 },
  { term: "food", category: "dietician", priority: 1 },
  { term: "mental", category: "coaching", priority: 2 },
  { term: "motivation", category: "coaching", priority: 2 },
  { term: "goals", category: "coaching", priority: 1 },
  { term: "weight gain", category: "dietician", priority: 3 },
  { term: "energy", category: "dietician", priority: 1 },
];

// Budget-related keywords with more precise factors
const budgetKeywords = [
  { term: "cheap", factor: 0.5 },
  { term: "affordable", factor: 0.6 },
  { term: "budget", factor: 0.7 },
  { term: "expensive", factor: 1.4 },
  { term: "premium", factor: 1.4 },
  { term: "high-end", factor: 1.5 },
];

// Intensity-related keywords
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

// Timeframe keywords
const timeframeKeywords = [
  { term: "quick", timeframe: "4 weeks" },
  { term: "fast", timeframe: "4 weeks" },
  { term: "long term", timeframe: "12 weeks" },
  { term: "long-term", timeframe: "12 weeks" },
  { term: "sustainable", timeframe: "12 weeks" },
];

// Online preference keywords
const onlineKeywords = [
  { term: "online", preference: true },
  { term: "virtual", preference: true },
  { term: "remote", preference: true },
  { term: "in-person", preference: false },
  { term: "face to face", preference: false },
];

// Analyze user input and determine plan options
export const analyzeUserInput = (input: string): PlanOptions => {
  const lowerInput = input.toLowerCase();
  const options: PlanOptions = {
    costFactor: 1.0,
    intensity: "medium",
    timeframe: "8 weeks",
    focus: [],
    preferOnline: false
  };

  // Detect focus areas by category
  const categoryScores: Record<ServiceCategory, number> = {
    'dietician': 0,
    'personal-trainer': 0,
    'biokineticist': 0,
    'physiotherapist': 0,
    'coaching': 0
  };

  // Check for health keywords
  healthKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      const category = keyword.category as ServiceCategory;
      categoryScores[category] += keyword.priority;
    }
  });

  // Get top 2 categories based on scores
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
    .map(([category]) => category as ServiceCategory);

  options.focus = sortedCategories.length > 0 ? 
    sortedCategories.slice(0, 2) : 
    ['personal-trainer', 'dietician']; // Default if no clear focus

  // Check for budget keywords
  budgetKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.costFactor = keyword.factor;
    }
  });

  // Check for intensity keywords
  intensityKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.intensity = keyword.intensity;
    }
  });

  // Check for timeframe keywords
  timeframeKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.timeframe = keyword.timeframe;
    }
  });

  // Check for online preference
  onlineKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword.term)) {
      options.preferOnline = keyword.preference;
    }
  });

  // Extract specific budget amount if mentioned (e.g., R1000, 1200, etc.)
  const budgetMatch = input.match(/R?(\d+)(?:\s*(?:per|a|\/)\s*(?:month|session|week))?/i);
  if (budgetMatch) {
    const extractedBudget = parseInt(budgetMatch[1]);
    if (extractedBudget > 0) {
      options.costFactor = extractedBudget < 500 ? 0.6 : extractedBudget > 1000 ? 1.3 : 1.0;
    }
  }

  return options;
};

export const findAlternativeCategories = (selectedCategories: ServiceCategory[]): ServiceCategory[] => {
  const complementaryPairs: Record<ServiceCategory, ServiceCategory[]> = {
    'dietician': ['personal-trainer', 'coaching'],
    'personal-trainer': ['dietician', 'physiotherapist'],
    'physiotherapist': ['personal-trainer', 'biokineticist'],
    'biokineticist': ['physiotherapist', 'coaching'],
    'coaching': ['dietician', 'personal-trainer']
  };

  if (selectedCategories.length === 0) {
    return ['coaching', 'dietician']; // Default holistic health approach
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

  return alternatives.slice(0, 2); // Return top 2 alternatives
};

export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  const options = analyzeUserInput(userQuery);
  const plans: AIHealthPlan[] = [];

  // Adjust base prices based on budget factor
  const basePrices = {
    'dietician': 300,
    'personal-trainer': 350,
    'biokineticist': 400,
    'physiotherapist': 400,
    'coaching': 250
  };

  // Extract budget from query if mentioned
  const budgetMatch = userQuery.match(/R?(\d+)(?:\s*(?:per|a|\/)\s*(?:month|session|week))?/i);
  const userBudget = budgetMatch ? parseInt(budgetMatch[1]) : 1000; // Default budget

  // Calculate adjusted prices based on user's budget
  const adjustPriceForBudget = (basePrice: number, planType: string) => {
    switch(planType) {
      case 'best-fit':
        return Math.min(basePrice, userBudget / 4); // Ensure it fits within 25% of budget
      case 'high-impact':
        return Math.min(basePrice * 1.2, userBudget / 2); // Premium but within 50% of budget
      case 'progressive':
        return Math.min(basePrice * 0.8, userBudget / 3); // Most affordable option
      default:
        return basePrice;
    }
  };

  // Plan types
  const planTypes: ('best-fit' | 'high-impact' | 'progressive')[] = ['best-fit', 'high-impact', 'progressive'];

  // Session counts optimized for each plan type
  const sessionCounts = {
    low: { primary: 2, secondary: 1 },
    medium: { primary: 4, secondary: 2 },
    high: { primary: 6, secondary: 4 }
  };

  // Description templates updated for holistic health approach
  const descTemplates = {
    'best-fit': "Budget-optimized wellness plan focusing on {focus} over {timeframe}.",
    'high-impact': "Accelerated wellness program with intensive {focus} over {timeframe}.",
    'progressive': "Long-term holistic health journey emphasizing {focus} over {timeframe}."
  };

  // Service descriptions
  const serviceDesc: Record<ServiceCategory, string> = {
    'dietician': "Personalized nutrition guidance and meal planning",
    'personal-trainer': "Customized exercise sessions focused on your goals",
    'biokineticist': "Specialized movement therapy and rehabilitation",
    'physiotherapist': "Targeted therapy for pain relief and recovery",
    'coaching': "Motivation and wellness strategy sessions"
  };

  // Generate the three plan types
  planTypes.forEach((planType, index) => {
    // Determine which categories to include
    let planCategories = [...options.focus];

    // If not enough categories, add a complementary one
    if (planCategories.length < 2 && planType !== 'progressive') {
      const complementaryCategories: Record<ServiceCategory, ServiceCategory> = {
        'dietician': 'personal-trainer',
        'personal-trainer': 'dietician',
        'biokineticist': 'physiotherapist',
        'physiotherapist': 'personal-trainer',
        'coaching': 'dietician'
      };

      const primaryCategory = planCategories[0];
      if (primaryCategory) {
        planCategories.push(complementaryCategories[primaryCategory]);
      }
    }

    // For progressive plan, focus on primary category first, then add others
    if (planType === 'progressive' && planCategories.length > 1) {
      planCategories = [planCategories[0]];
    }

    // Calculate session counts
    const counts = sessionCounts[options.intensity || 'medium'];

    // Build services array
    const services = planCategories.map((category, idx) => {
      const isMainFocus = idx === 0;
      const basePrice = basePrices[category];
      const adjustedPrice = adjustPriceForBudget(basePrice, planType);
      
      return {
        type: category,
        price: Math.round(adjustedPrice),
        sessions: isMainFocus ? 
          (planType === 'high-impact' ? 6 : planType === 'progressive' ? 3 : 4) :
          (planType === 'high-impact' ? 4 : 2),
        description: serviceDesc[category]
      };
    });

    // Calculate total cost
    const totalCost = services.reduce((sum, service) => 
      sum + (service.price * service.sessions), 0);

    // Create plan description
    const planFocus = services.map(s => s.type.replace('-', ' ')).join(' and ');
    const planDesc = descTemplates[planType]
      .replace('{focus}', planFocus)
      .replace('{intensity}', options.intensity || 'medium')
      .replace('{timeframe}', options.timeframe || '8 weeks');

    // Create plan name
    const planName = planType === 'best-fit' 
      ? 'Tailored Wellness Plan' 
      : planType === 'high-impact' 
        ? 'Accelerated Results Plan' 
        : 'Progressive Development Plan';

    // Create the plan
    plans.push({
      id: `plan-${index + 1}`,
      name: planName,
      description: planDesc,
      services: services,
      totalCost: totalCost,
      planType: planType,
      timeFrame: options.timeframe || '8 weeks'
    });
  });

  return plans;
};
