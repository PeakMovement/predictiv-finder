
import { ServiceCategory } from "../types";
import { analyzeSentiment } from "../inputAnalyzer/synonymExpansion";

export interface HealthScenario {
  scenarioName: string;
  confidence: number;
  recommendedServices: ServiceCategory[];
  description: string;
  timeframe?: {
    type: 'immediate' | 'short_term' | 'long_term';
    durationDays?: number;
  };
  specialConsiderations?: string[];
}

/**
 * Detects common health scenarios from user input
 * @param input User's description of their health needs
 * @returns Detected health scenarios with confidence scores
 */
export function detectHealthScenarios(input: string): HealthScenario[] {
  const inputLower = input.toLowerCase();
  const detectedScenarios: HealthScenario[] = [];
  const sentimentAnalysis = analyzeSentiment(input);
  
  // Athletic Performance Improvement Scenario
  if (checkForScenario(inputLower, ['performance', 'improve', 'better', 'faster', 'stronger', 'athletic'],
      ['race', 'run', 'marathon', 'competition', 'sport', 'athlete', 'training'])) {
    
    const isRace = /race|marathon|5k|10k|half[-\s]marathon|competition/.test(inputLower);
    const isUrgent = /soon|coming|next month|weeks|approaching/.test(inputLower);
    
    detectedScenarios.push({
      scenarioName: isRace ? 'Race Preparation' : 'Athletic Performance Improvement',
      confidence: calculateConfidence(inputLower, 
        ['race', 'marathon', 'performance', 'improve', 'training', 'athletic'], 0.7),
      recommendedServices: isRace ? ['coaching', 'dietician', 'physiotherapist'] : 
                                    ['personal-trainer', 'dietician', 'physiotherapist'],
      description: isRace ? 'Comprehensive race preparation program including race-specific training' :
                            'Athletic performance enhancement focusing on strength, endurance, and recovery',
      timeframe: {
        type: isUrgent ? 'short_term' : 'long_term',
        durationDays: extractTimeframeInDays(inputLower) || (isUrgent ? 60 : 90)
      },
      specialConsiderations: isRace ? ['Periodization toward race day', 'Peak performance timing'] : 
                                      ['Progressive overload', 'Recovery optimization']
    });
  }
  
  // Weight Management Scenario
  if (checkForScenario(inputLower, ['weight', 'lose', 'diet', 'slim', 'tone'], 
      ['kg', 'pounds', 'lbs', 'weight loss', 'fat', 'overweight'])) {
    
    const isWedding = /wedding|ceremony|big day|special occasion/.test(inputLower);
    const hasTimeConstraint = /by|before|within|weeks|months|days/.test(inputLower);
    
    detectedScenarios.push({
      scenarioName: isWedding ? 'Wedding Preparation' : 'Weight Management',
      confidence: calculateConfidence(inputLower, 
        ['weight', 'lose', 'diet', 'slim', 'kilos', 'pounds'], 0.65),
      recommendedServices: ['dietician', 'personal-trainer', 'coaching'],
      description: isWedding ? 
        'Customized weight management and body toning for an upcoming special event' :
        'Sustainable weight management program combining nutrition and exercise',
      timeframe: {
        type: (isWedding || hasTimeConstraint) ? 'short_term' : 'long_term',
        durationDays: extractTimeframeInDays(inputLower) || (isWedding ? 90 : 120)
      },
      specialConsiderations: [
        'Metabolic adaptation considerations',
        'Sustainable lifestyle changes',
        hasTimeConstraint ? 'Time-bound progress milestones' : 'Long-term habit formation'
      ]
    });
  }
  
  // Pain Management Scenario
  if (checkForScenario(inputLower, ['pain', 'ache', 'hurt', 'sore', 'discomfort'], 
      ['back', 'knee', 'joint', 'shoulder', 'neck', 'chronic'])) {
    
    const isBackPain = /back|spine|lumbar|sciatica/.test(inputLower);
    const isKneePain = /knee|patella|meniscus|acl/.test(inputLower);
    const isChronic = /chronic|long[-\s]term|years|ongoing|constant|always/.test(inputLower);
    const painLocation = isBackPain ? 'back' : isKneePain ? 'knee' : 'general';
    
    detectedScenarios.push({
      scenarioName: `${painLocation.charAt(0).toUpperCase() + painLocation.slice(1)} Pain Management`,
      confidence: calculateConfidence(inputLower, 
        ['pain', 'hurt', 'sore', 'ache', 'chronic'], isChronic ? 0.8 : 0.7),
      recommendedServices: isChronic ? 
        ['physiotherapist', 'biokineticist', 'pain-management'] : 
        ['physiotherapist', 'biokineticist', 'family-medicine'],
      description: `Comprehensive ${isChronic ? 'chronic' : 'acute'} ${painLocation} pain management program`,
      timeframe: {
        type: isChronic ? 'long_term' : sentimentAnalysis.urgencyLevel === 'high' ? 'immediate' : 'short_term',
        durationDays: isChronic ? 180 : 60
      },
      specialConsiderations: [
        isChronic ? 'Long-term pain management strategies' : 'Rapid intervention for pain relief',
        'Functional movement restoration',
        isBackPain ? 'Spinal alignment and core stability focus' : 
        isKneePain ? 'Knee stability and mobility protocols' : 'Joint protection strategies'
      ]
    });
  }
  
  // Stress & Mental Wellbeing Scenario
  if (checkForScenario(inputLower, ['stress', 'anxiety', 'overwhelmed', 'burnout', 'mental health'], 
      ['work', 'pressure', 'worried', 'nervous', 'tension'])) {
    
    const hasPhysicalSymptoms = /headache|sleep|insomnia|tired|fatigue|exhausted/.test(inputLower);
    const isWork = /work|job|career|office|workplace/.test(inputLower);
    
    detectedScenarios.push({
      scenarioName: isWork ? 'Work Stress Management' : 'Mental Wellbeing Support',
      confidence: calculateConfidence(inputLower, 
        ['stress', 'anxiety', 'mental', 'overwhelmed'], 0.75),
      recommendedServices: hasPhysicalSymptoms ? 
        ['psychiatry', 'coaching', 'family-medicine'] : 
        ['psychiatry', 'coaching'],
      description: `Holistic ${isWork ? 'work-related' : ''} stress management and mental wellbeing program`,
      timeframe: {
        type: sentimentAnalysis.urgencyScore > 0.7 ? 'immediate' : 'short_term',
        durationDays: 90
      },
      specialConsiderations: [
        'Stress reduction techniques',
        'Mind-body connection',
        hasPhysicalSymptoms ? 'Physical symptom management' : 'Preventive mental health strategies',
        isWork ? 'Work-life balance optimization' : 'Daily mental wellness practices'
      ]
    });
  }
  
  // Digestive Health Scenario
  if (checkForScenario(inputLower, ['stomach', 'digestive', 'gut', 'bowel', 'intestinal'], 
      ['issues', 'problems', 'pain', 'discomfort', 'bloating', 'gas', 'constipation', 'diarrhea'])) {
    
    const isIBS = /ibs|irritable|syndrome/.test(inputLower);
    const isFood = /food|eat|diet|meal|nutrition/.test(inputLower);
    
    detectedScenarios.push({
      scenarioName: isIBS ? 'IBS Management' : 'Digestive Health Optimization',
      confidence: calculateConfidence(inputLower, 
        ['stomach', 'gut', 'digestive', 'bowel'], 0.7),
      recommendedServices: isIBS ? 
        ['gastroenterology', 'dietician', 'family-medicine'] : 
        ['dietician', 'gastroenterology'],
      description: `Comprehensive ${isIBS ? 'IBS' : 'digestive health'} management program`,
      timeframe: {
        type: sentimentAnalysis.urgencyLevel === 'high' ? 'immediate' : 'short_term',
        durationDays: 60
      },
      specialConsiderations: [
        isFood ? 'Food sensitivity identification' : 'Digestive system support',
        'Gut health optimization',
        isIBS ? 'IBS-specific dietary protocols' : 'General digestive wellness strategies',
        'Stress-digestion connection'
      ]
    });
  }
  
  return detectedScenarios.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Helper function to check if a scenario matches based on primary and secondary keywords
 */
function checkForScenario(input: string, primaryKeywords: string[], secondaryKeywords: string[]): boolean {
  const primaryMatches = primaryKeywords.filter(word => input.includes(word)).length;
  const secondaryMatches = secondaryKeywords.filter(word => input.includes(word)).length;
  
  return (primaryMatches >= 2) || (primaryMatches >= 1 && secondaryMatches >= 1);
}

/**
 * Calculate confidence score based on keyword matches
 */
function calculateConfidence(input: string, keyTerms: string[], baseConfidence: number): number {
  const matchCount = keyTerms.filter(term => input.includes(term)).length;
  const maxMatches = Math.min(keyTerms.length, 5); // Cap at 5 to avoid overconfidence
  const matchRatio = matchCount / maxMatches;
  
  return Math.min(0.95, baseConfidence + (matchRatio * 0.2));
}

/**
 * Extract timeframe in days from user input
 * Looks for patterns like "in 2 weeks", "within 3 months", etc.
 */
function extractTimeframeInDays(input: string): number | null {
  const weekPattern = /(\d+)\s*weeks?/i;
  const monthPattern = /(\d+)\s*months?/i;
  const dayPattern = /(\d+)\s*days?/i;
  
  const weekMatch = input.match(weekPattern);
  const monthMatch = input.match(monthPattern);
  const dayMatch = input.match(dayPattern);
  
  if (weekMatch && weekMatch[1]) {
    return parseInt(weekMatch[1]) * 7;
  } else if (monthMatch && monthMatch[1]) {
    return parseInt(monthMatch[1]) * 30;
  } else if (dayMatch && dayMatch[1]) {
    return parseInt(dayMatch[1]);
  }
  
  return null;
}
