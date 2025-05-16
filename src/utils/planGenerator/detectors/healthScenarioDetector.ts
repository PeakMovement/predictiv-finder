
import { ServiceCategory } from "../types";

interface HealthScenario {
  scenarioName: string;
  patterns: string[];
  confidence: number;
  recommendedServices: ServiceCategory[];
  description: string;
  timeframe?: string;
}

/**
 * Detects common health scenarios from user input
 * This helps the system understand complex health situations and provide better recommendations
 * 
 * @param userInput User's description of their health needs
 * @returns Array of detected scenarios with confidence scores
 */
export function detectHealthScenarios(userInput: string): HealthScenario[] {
  const inputLower = userInput.toLowerCase();
  const detectedScenarios: HealthScenario[] = [];
  
  // Define common health scenarios
  const scenarios: HealthScenario[] = [
    {
      scenarioName: "Weight Management",
      patterns: [
        "lose weight", "overweight", "obesity", "weight loss",
        "diet plan", "body fat", "get leaner", "slim down"
      ],
      confidence: 0.8,
      recommendedServices: ["dietician", "personal-trainer", "coaching"],
      description: "Comprehensive weight management plan focusing on nutrition and exercise",
      timeframe: "3-6 months"
    },
    {
      scenarioName: "Sports Injury Recovery",
      patterns: [
        "sports injury", "torn", "sprain", "strain", "pulled muscle",
        "sports accident", "during practice", "during game", "while playing"
      ],
      confidence: 0.85,
      recommendedServices: ["physiotherapist", "sports-medicine", "orthopedics"],
      description: "Specialized recovery plan for sports-related injuries"
    },
    {
      scenarioName: "Chronic Pain Management",
      patterns: [
        "chronic pain", "persistent pain", "long-term pain",
        "pain management", "constant ache", "pain for years"
      ],
      confidence: 0.9,
      recommendedServices: ["pain-management", "physiotherapist", "psychology"],
      description: "Multi-disciplinary approach to managing chronic pain"
    },
    {
      scenarioName: "Stress and Anxiety",
      patterns: [
        "anxiety", "stress", "overwhelmed", "panic", "worry",
        "can't cope", "burnout", "mental health"
      ],
      confidence: 0.8,
      recommendedServices: ["psychology", "psychiatry", "coaching"],
      description: "Mental health support plan focusing on stress reduction and anxiety management"
    },
    {
      scenarioName: "Post-Surgery Rehabilitation",
      patterns: [
        "after surgery", "post-operation", "post-op", "surgical recovery",
        "rehabilitation", "recent operation"
      ],
      confidence: 0.9,
      recommendedServices: ["physiotherapist", "occupational-therapy", "orthopedics"],
      description: "Structured rehabilitation program for post-surgical recovery"
    },
    {
      scenarioName: "Pregnancy and Postnatal Support",
      patterns: [
        "pregnant", "pregnancy", "expecting", "postnatal", "after birth",
        "postpartum", "new mom", "baby"
      ],
      confidence: 0.85,
      recommendedServices: ["physiotherapist", "dietician", "psychology"],
      description: "Supportive care plan for pregnancy and postnatal period"
    },
    {
      scenarioName: "Diabetes Management",
      patterns: [
        "diabetes", "blood sugar", "diabetic", "glucose", "insulin",
        "type 1", "type 2", "pre-diabetic"
      ],
      confidence: 0.9,
      recommendedServices: ["endocrinology", "dietician", "family-medicine"],
      description: "Comprehensive diabetes management plan"
    },
    {
      scenarioName: "Athletic Performance Enhancement",
      patterns: [
        "improve performance", "athletic", "competition", "race", "marathon",
        "triathlon", "better athlete", "performance gains"
      ],
      confidence: 0.8,
      recommendedServices: ["personal-trainer", "sports-medicine", "dietician"],
      description: "Advanced athletic performance optimization program"
    },
    {
      scenarioName: "Back Pain",
      patterns: [
        "back pain", "backache", "spine", "lower back", "slipped disc",
        "herniated disc", "sciatica", "back injury"
      ],
      confidence: 0.85,
      recommendedServices: ["physiotherapist", "orthopedics", "chiropractor"],
      description: "Specialized back pain treatment and management plan"
    },
    {
      scenarioName: "Digestive Health",
      patterns: [
        "digestive issues", "stomach problems", "ibs", "acid reflux",
        "food intolerance", "gut health", "bowel", "digestion"
      ],
      confidence: 0.8,
      recommendedServices: ["gastroenterology", "dietician", "family-medicine"],
      description: "Comprehensive digestive health management"
    }
  ];
  
  // Process each scenario against the user input
  for (const scenario of scenarios) {
    // Count matching patterns
    let matchingPatterns = 0;
    let totalPatterns = scenario.patterns.length;
    
    for (const pattern of scenario.patterns) {
      if (inputLower.includes(pattern)) {
        matchingPatterns++;
      }
    }
    
    // Calculate match percentage
    const matchPercentage = matchingPatterns / totalPatterns;
    
    // Determine if this scenario is relevant (at least 15% pattern match)
    if (matchingPatterns > 0 && matchPercentage >= 0.15) {
      // Adjust confidence based on match percentage
      const adjustedConfidence = scenario.confidence * Math.min(1, matchPercentage + 0.3);
      
      detectedScenarios.push({
        ...scenario,
        confidence: adjustedConfidence
      });
    }
  }
  
  // Sort by confidence (highest first)
  return detectedScenarios.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get recommended timeframe based on detected scenario
 * @param scenarioName The name of the detected health scenario
 * @returns Suggested timeframe for the health plan
 */
export function getScenarioTimeframe(scenarioName: string): string {
  const timeframes: Record<string, string> = {
    "Weight Management": "3-6 months",
    "Sports Injury Recovery": "4-12 weeks",
    "Chronic Pain Management": "3-6 months ongoing",
    "Stress and Anxiety": "3-4 months initially",
    "Post-Surgery Rehabilitation": "6-12 weeks",
    "Pregnancy and Postnatal Support": "Throughout pregnancy and 3-6 months postpartum",
    "Diabetes Management": "Ongoing with quarterly assessments",
    "Athletic Performance Enhancement": "8-12 weeks per cycle",
    "Back Pain": "6-12 weeks initially",
    "Digestive Health": "2-3 months initially"
  };
  
  return timeframes[scenarioName] || "3-4 months";
}
