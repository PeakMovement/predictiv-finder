
import { ServiceCategory } from '@/types';

/**
 * Helper function to detect knee pain + race preparation special case
 */
export function hasKneePainAndRacePreparation(medicalConditions: string[], userQuery: string): boolean {
  const hasKneePain = medicalConditions.some(m => 
    m.toLowerCase().includes('knee') && m.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = userQuery.toLowerCase().includes('race') || 
                     userQuery.toLowerCase().includes('marathon') ||
                     userQuery.toLowerCase().includes('run') ||
                     medicalConditions.some(m => m.toLowerCase().includes('race'));
                     
  return hasKneePain && hasRacePrep;
}

/**
 * Helper function to handle special cases and adjust categories
 */
export function handleSpecialCases(
  categories: ServiceCategory[],
  medicalConditions: string[],
  userQuery: string,
  servicePriorities: Record<string, number>,
  primaryIssue?: string
): ServiceCategory[] {
  let updatedCategories = [...categories];
  
  // Special case handling for knee pain + race preparation
  const hasKneePain = medicalConditions.some(m => 
    m.toLowerCase().includes('knee') && m.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = userQuery.toLowerCase().includes('race') || 
                     userQuery.toLowerCase().includes('marathon') ||
                     userQuery.toLowerCase().includes('run') ||
                     medicalConditions.some(m => m.toLowerCase().includes('race'));
  
  if (hasKneePain && hasRacePrep) {
    console.log("Detected knee pain + race preparation special case");
    
    // Ensure coaching is included for race preparation
    if (!updatedCategories.includes('coaching')) {
      updatedCategories.push('coaching');
      console.log("Added coaching for race preparation");
    }
    
    // Ensure physiotherapy is included for knee pain
    if (!updatedCategories.includes('physiotherapist')) {
      updatedCategories.push('physiotherapist');
      console.log("Added physiotherapist for knee pain");
    }
    
    // Add to medical conditions if not already there
    if (!medicalConditions.includes('knee pain')) {
      medicalConditions.push('knee pain');
    }
    
    if (!medicalConditions.includes('race preparation')) {
      medicalConditions.push('race preparation');
    }
    
    // Adjust the service priorities
    servicePriorities['coaching'] = Math.max(servicePriorities['coaching'] || 0, 0.9);
    servicePriorities['physiotherapist'] = Math.max(servicePriorities['physiotherapist'] || 0, 0.9);
  }
  
  // Special case handling for anxiety + eating + race preparation
  if (userQuery.toLowerCase().includes('anxiety') && 
      userQuery.toLowerCase().includes('struggling to eat') && 
      (userQuery.toLowerCase().includes('race') || userQuery.toLowerCase().includes('run'))) {
    
    // Ensure dietician is included and prioritized
    if (!updatedCategories.includes('dietician')) {
      updatedCategories.push('dietician');
      console.log("Added dietician for anxiety + eating issues");
    }
    
    // Ensure personal trainer is included for race preparation
    if (!updatedCategories.includes('personal-trainer')) {
      updatedCategories.push('personal-trainer');
      console.log("Added personal-trainer for race preparation");
    }
    
    // Remove physiotherapist if present (unless there's a physical injury)
    if (updatedCategories.includes('physiotherapist') && 
        !userQuery.toLowerCase().includes('pain') && 
        !userQuery.toLowerCase().includes('injury')) {
      updatedCategories = updatedCategories.filter(c => c !== 'physiotherapist');
      console.log("Removed physiotherapist as not relevant to main issues");
    }
  }
  
  // New special case: chronic pain + difficulty sleeping
  if ((userQuery.toLowerCase().includes('chronic pain') || userQuery.toLowerCase().includes('constant pain')) &&
      (userQuery.toLowerCase().includes('sleep') || userQuery.toLowerCase().includes('insomnia'))) {
    
    console.log("Detected chronic pain + sleep issues special case");
    
    // Ensure pain management is included
    if (!updatedCategories.includes('pain-management')) {
      updatedCategories.push('pain-management');
      console.log("Added pain-management specialist");
    }
    
    // Adjust service priorities
    servicePriorities['pain-management'] = Math.max(servicePriorities['pain-management'] || 0, 0.95);
  }
  
  return updatedCategories;
}

/**
 * Enhanced complexity score calculation with a 0-100 scale based on multiple weighted factors
 * Returns a value between 0-100 where:
 * 0-30: Simple case (single condition/goal, no urgency)
 * 31-60: Moderate complexity (multiple related issues or moderate urgency)
 * 61-85: Complex case (multiple chronic or interrelated conditions)
 * 86-100: Critical case (urgent medical attention needed)
 */
export function calculateComplexityScore(
  conditions: string[],
  goals: string[],
  userQuery: string,
  servicePriorities: Record<string, number>
): number {
  let score = 0;
  const inputLower = userQuery.toLowerCase();
  
  // FACTOR 1: CONDITION SEVERITY (0-30 points)
  // Check for condition severity indicators
  const severityTerms = {
    'chronic': 30,
    'severe': 25,
    'serious': 25,
    'persistent': 20,
    'recurring': 20,
    'constant': 20,
    'acute': 15,
    'moderate': 15,
    'mild': 10,
    'minor': 5
  };
  
  let maxSeverityScore = 0;
  
  // Find the highest severity term mentioned
  Object.entries(severityTerms).forEach(([term, value]) => {
    if (inputLower.includes(term)) {
      maxSeverityScore = Math.max(maxSeverityScore, value);
    }
  });
  
  // Add severity score
  score += maxSeverityScore;
  console.log(`Complexity - Severity score: ${maxSeverityScore}`);
  
  // FACTOR 2: TIMEFRAME URGENCY (0-20 points)
  let timeframeScore = 0;
  
  // Check for specific timeframes
  const timeframeMatch = inputLower.match(/(\d+)\s*(week|day|month)/);
  if (timeframeMatch) {
    const amount = parseInt(timeframeMatch[1]);
    const unit = timeframeMatch[2];
    
    // Convert everything to weeks for comparison
    let weeks = amount;
    if (unit === 'day') weeks = amount / 7;
    if (unit === 'month') weeks = amount * 4.3;
    
    // Assign points based on urgency
    if (weeks < 1) timeframeScore = 20; // Very urgent (less than 1 week)
    else if (weeks <= 2) timeframeScore = 15; // Urgent (1-2 weeks)
    else if (weeks <= 4) timeframeScore = 10; // Moderately urgent (2-4 weeks)
    else if (weeks <= 8) timeframeScore = 5; // Somewhat urgent (4-8 weeks)
    else timeframeScore = 0; // Not urgent (more than 8 weeks)
  }
  
  // Check for urgency keywords
  const urgencyTerms = {
    'urgent': 20,
    'emergency': 20,
    'asap': 18,
    'immediately': 18,
    'soon': 10,
    'quickly': 8,
    'fast': 8
  };
  
  Object.entries(urgencyTerms).forEach(([term, value]) => {
    if (inputLower.includes(term)) {
      timeframeScore = Math.max(timeframeScore, value);
    }
  });
  
  // Add timeframe score
  score += timeframeScore;
  console.log(`Complexity - Timeframe urgency score: ${timeframeScore}`);
  
  // FACTOR 3: MULTIPLE CONDITIONS (0-20 points)
  // 5 points for the first condition, +5 for each additional up to 20 points
  const conditionScore = Math.min(5 + (Math.max(conditions.length - 1, 0) * 5), 20);
  score += conditionScore;
  console.log(`Complexity - Multiple conditions score: ${conditionScore}`);
  
  // FACTOR 4: SPECIFIC GOALS (0-15 points)
  let goalScore = 0;
  
  // Basic score based on number of goals
  goalScore += Math.min(goals.length * 3, 9);
  
  // Additional points for specific types of goals
  const highComplexityGoals = ['race preparation', 'competition', 'marathon', 'return to sport', 'performance'];
  highComplexityGoals.forEach(goal => {
    if (inputLower.includes(goal)) goalScore += 3;
  });
  
  // Cap at 15 points
  goalScore = Math.min(goalScore, 15);
  score += goalScore;
  console.log(`Complexity - Goal complexity score: ${goalScore}`);
  
  // FACTOR 5: BUDGET CONSTRAINTS (0-10 points)
  let budgetScore = 0;
  
  // Extract budget if mentioned
  const budgetMatch = inputLower.match(/r\s*(\d+)/i);
  if (budgetMatch && budgetMatch[1]) {
    const budget = parseInt(budgetMatch[1]);
    if (budget < 500) budgetScore = 10;  // Extremely tight budget
    else if (budget < 1000) budgetScore = 7; // Very tight budget 
    else if (budget < 2000) budgetScore = 5; // Moderate constraint
    else if (budget < 3000) budgetScore = 2; // Mild constraint
  }
  
  // Check for budget constraint terms
  if (inputLower.includes('tight budget') || 
      inputLower.includes('can\'t afford') ||
      inputLower.includes('expensive') ||
      inputLower.includes('low budget')) {
    budgetScore = Math.max(budgetScore, 7);
  }
  
  score += budgetScore;
  console.log(`Complexity - Budget constraint score: ${budgetScore}`);
  
  // FACTOR 6: CO-MORBIDITY PATTERNS (0-15 points)
  let comorbidityScore = 0;
  
  // Check for known co-morbidity patterns
  const comorbidityPatterns = [
    { pattern: /(?=.*\bpain\b)(?=.*\bdepression\b)/i, score: 15 },
    { pattern: /(?=.*\banxiety\b)(?=.*\bsleep\b)/i, score: 12 },
    { pattern: /(?=.*\bdiabetes\b)(?=.*\bweight\b)/i, score: 13 },
    { pattern: /(?=.*\bknee\b)(?=.*\brace\b)/i, score: 12 },
    { pattern: /(?=.*\bchronic\b)(?=.*\bfatigue\b)/i, score: 10 },
    { pattern: /(?=.*\banxiety\b)(?=.*\beat\b)/i, score: 12 }
  ];
  
  comorbidityPatterns.forEach(({ pattern, score: patternScore }) => {
    if (pattern.test(inputLower)) {
      comorbidityScore = Math.max(comorbidityScore, patternScore);
    }
  });
  
  score += comorbidityScore;
  console.log(`Complexity - Co-morbidity score: ${comorbidityScore}`);
  
  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}
