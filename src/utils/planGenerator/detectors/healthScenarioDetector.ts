
import { ServiceCategory } from "../types";

export interface HealthScenario {
  scenarioName: string;
  description: string;
  keywords: string[];
  recommendedServices: ServiceCategory[];
  typicalTimeframe: string;
  expectedOutcomes: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface DetectedScenario {
  scenarioName: string;
  confidence: number;
  recommendedServices: ServiceCategory[];
  timeframe: string;
  expectedOutcomes: string[];
  scenario: HealthScenario;
}

// Define common health scenarios
const HEALTH_SCENARIOS: HealthScenario[] = [
  {
    scenarioName: "Sports Injury Recovery",
    description: "Rehabilitation from sports-related injuries",
    keywords: ["sports injury", "sprain", "strain", "tear", "pulled muscle", "game", "match", "competition", "athlete"],
    recommendedServices: ["physiotherapist", "personal-trainer", "biokineticist", "sports-medicine"],
    typicalTimeframe: "4-12 weeks",
    expectedOutcomes: ["Pain reduction", "Return to sport", "Restored mobility", "Prevention of re-injury"],
    priority: "medium"
  },
  {
    scenarioName: "Weight Loss Program",
    description: "Comprehensive weight loss and management",
    keywords: ["weight loss", "lose weight", "overweight", "fat", "diet", "slim", "obesity", "kg", "pounds", "BMI"],
    recommendedServices: ["dietician", "personal-trainer", "coaching", "endocrinology"],
    typicalTimeframe: "3-6 months",
    expectedOutcomes: ["Reduced body weight", "Better eating habits", "Improved energy levels", "Sustainable lifestyle changes"],
    priority: "medium"
  },
  {
    scenarioName: "Chronic Pain Management",
    description: "Management of persistent pain conditions",
    keywords: ["chronic pain", "persistent pain", "long-term pain", "pain management", "always hurts", "constant pain"],
    recommendedServices: ["pain-management", "physiotherapist", "psychology", "family-medicine"],
    typicalTimeframe: "Ongoing",
    expectedOutcomes: ["Reduced pain levels", "Improved functionality", "Better coping strategies", "Enhanced quality of life"],
    priority: "high"
  },
  {
    scenarioName: "Stress and Anxiety Relief",
    description: "Management of stress, anxiety and related conditions",
    keywords: ["stress", "anxiety", "panic", "overwhelmed", "burnout", "mental health", "worry", "tension"],
    recommendedServices: ["psychology", "psychiatry", "coaching"],
    typicalTimeframe: "2-6 months",
    expectedOutcomes: ["Reduced anxiety symptoms", "Better stress management", "Improved sleep", "Enhanced well-being"],
    priority: "high"
  },
  {
    scenarioName: "Post-Surgery Rehabilitation",
    description: "Recovery after surgical procedures",
    keywords: ["surgery", "post-op", "operation", "recovery", "surgical", "procedure", "after surgery"],
    recommendedServices: ["physiotherapist", "occupational-therapy", "pain-management"],
    typicalTimeframe: "1-3 months",
    expectedOutcomes: ["Restored function", "Pain management", "Return to daily activities", "Proper healing"],
    priority: "high"
  },
  {
    scenarioName: "Athletic Performance Enhancement",
    description: "Improving sports and athletic performance",
    keywords: ["performance", "athlete", "competition", "marathon", "race", "improve", "sport", "strength", "endurance"],
    recommendedServices: ["personal-trainer", "sports-medicine", "dietician", "biokineticist"],
    typicalTimeframe: "3-6 months",
    expectedOutcomes: ["Improved performance", "Enhanced technique", "Increased strength/endurance", "Better recovery"],
    priority: "medium"
  },
  {
    scenarioName: "Pregnancy and Postpartum Care",
    description: "Health support during and after pregnancy",
    keywords: ["pregnancy", "pregnant", "postpartum", "baby", "birth", "maternity", "prenatal", "after giving birth"],
    recommendedServices: ["physiotherapist", "dietician", "psychology", "obstetrics-gynecology"],
    typicalTimeframe: "During pregnancy and 6-12 months postpartum",
    expectedOutcomes: ["Reduced discomfort", "Safe exercise program", "Nutritional support", "Mental wellbeing"],
    priority: "medium"
  },
  {
    scenarioName: "Digestive Health Improvement",
    description: "Management of digestive and gastrointestinal conditions",
    keywords: ["digestive", "stomach", "gut", "IBS", "bloating", "indigestion", "bowel", "constipation", "diarrhea"],
    recommendedServices: ["gastroenterology", "dietician", "family-medicine"],
    typicalTimeframe: "1-6 months",
    expectedOutcomes: ["Reduced symptoms", "Dietary management", "Improved comfort", "Better quality of life"],
    priority: "medium"
  },
  {
    scenarioName: "Diabetes Management",
    description: "Managing diabetes and blood sugar control",
    keywords: ["diabetes", "blood sugar", "glucose", "insulin", "diabetic", "type 1", "type 2", "sugar levels"],
    recommendedServices: ["endocrinology", "dietician", "personal-trainer", "family-medicine"],
    typicalTimeframe: "Ongoing",
    expectedOutcomes: ["Stable blood sugar", "Weight management", "Reduced complications", "Healthy lifestyle"],
    priority: "high"
  },
  {
    scenarioName: "Senior Mobility Program",
    description: "Maintaining and improving mobility for older adults",
    keywords: ["elderly", "senior", "aging", "older adult", "retirement", "fall prevention", "mobility issues", "geriatric"],
    recommendedServices: ["physiotherapist", "occupational-therapy", "geriatric-medicine"],
    typicalTimeframe: "Ongoing",
    expectedOutcomes: ["Improved mobility", "Fall prevention", "Maintained independence", "Better quality of life"],
    priority: "medium"
  }
];

/**
 * Detect health scenarios from user input
 * @param userInput User's description of their health needs
 * @returns Array of detected scenarios with confidence scores
 */
export function detectHealthScenarios(userInput: string): DetectedScenario[] {
  const inputLower = userInput.toLowerCase();
  const detectedScenarios: DetectedScenario[] = [];
  
  // Process each scenario
  HEALTH_SCENARIOS.forEach(scenario => {
    // Calculate confidence based on keyword matches
    let matchCount = 0;
    let weightedScore = 0;
    
    scenario.keywords.forEach(keyword => {
      if (inputLower.includes(keyword.toLowerCase())) {
        matchCount++;
        // Weight matches based on keyword specificity
        const keywordLength = keyword.split(' ').length;
        weightedScore += 0.1 * keywordLength; // More specific keywords add more confidence
      }
    });
    
    // Calculate confidence score
    const baseConfidence = matchCount / scenario.keywords.length;
    let confidenceScore = baseConfidence;
    
    // Add weighted score
    confidenceScore += weightedScore;
    
    // Add priority boost for high priority scenarios
    if (scenario.priority === 'high' && confidenceScore > 0) {
      confidenceScore += 0.1;
    }
    
    // Only include scenarios with some confidence
    if (confidenceScore > 0.2) {
      detectedScenarios.push({
        scenarioName: scenario.scenarioName,
        confidence: Math.min(confidenceScore, 0.95), // Cap at 0.95
        recommendedServices: scenario.recommendedServices,
        timeframe: scenario.typicalTimeframe,
        expectedOutcomes: scenario.expectedOutcomes,
        scenario
      });
    }
  });
  
  // Sort by confidence score
  return detectedScenarios.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate expected timeline based on detected scenario
 */
export function generateTimelineFromScenario(scenario: DetectedScenario): {
  week: number;
  milestone: string;
  focus: string;
}[] {
  // Process timeframe to estimate duration in weeks
  let totalWeeks = 12; // Default to 12 weeks
  
  if (scenario.timeframe.includes("month")) {
    const months = parseInt(scenario.timeframe.match(/\d+/)?.[0] || "3");
    totalWeeks = months * 4;
  } else if (scenario.timeframe.includes("week")) {
    totalWeeks = parseInt(scenario.timeframe.match(/\d+/)?.[0] || "12");
  }
  
  // Generate milestones based on the scenario and duration
  const timeline = [];
  
  // Initial assessment phase
  timeline.push({
    week: 1,
    milestone: "Initial Assessment",
    focus: `Begin ${scenario.scenarioName.toLowerCase()} with professional evaluation`
  });
  
  // Early progress (about 25% through)
  const earlyWeek = Math.max(2, Math.floor(totalWeeks * 0.25));
  timeline.push({
    week: earlyWeek,
    milestone: "Early Progress",
    focus: scenario.expectedOutcomes[0] || "First measurable improvements"
  });
  
  // Mid-point assessment (50% through)
  const midWeek = Math.floor(totalWeeks * 0.5);
  timeline.push({
    week: midWeek,
    milestone: "Mid-Program Assessment",
    focus: scenario.expectedOutcomes[1] || "Progress evaluation and program adjustment"
  });
  
  // Advanced progress (75% through)
  const lateWeek = Math.floor(totalWeeks * 0.75);
  timeline.push({
    week: lateWeek,
    milestone: "Advanced Progress",
    focus: scenario.expectedOutcomes[2] || "Significant improvement and skill development"
  });
  
  // Final assessment
  timeline.push({
    week: totalWeeks,
    milestone: "Program Completion",
    focus: "Final assessment and maintenance plan development"
  });
  
  return timeline;
}
