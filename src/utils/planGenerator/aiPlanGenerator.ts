import { AIHealthPlan, ServiceCategory } from '@/types';
import { analyzeUserInput } from './inputAnalyzer';
import { findAlternativeCategories } from './categoryMatcher';
import { determineBudgetTier } from './budgetConfig';
import { generatePlan } from './planGenerator';
import { 
  enhancedAnalyzeUserInput, 
  checkCoMorbidities, 
  generatePlanNotes
} from './enhancedInputAnalyzer';

import { 
  generatePlanName, 
  generatePlanDescription, 
  generateServiceDescription,
  determineTimeFrame,
  determinePlanType,
  calculateBudgetTiers
} from './planStructure';

import { calculateOptimalServiceAllocation } from './planStructure/serviceAllocation';
import { BASELINE_COSTS, STUDENT_DISCOUNT } from './types';
import { 
  scoreProfessionals, 
  buildOptimizedPlan, 
  isComplexCase 
} from './professionalScoring';
import { COMPLEXITY_INDICATORS } from './inputAnalyzer/keywordMappings';

// Function to generate custom AI health plans based on user text input
export const generateCustomAIPlans = (userQuery: string): AIHealthPlan[] => {
  console.log("Generating AI plans for query:", userQuery);
  
  // Use enhanced analysis to extract detailed information from user input
  const { 
    medicalConditions, 
    suggestedCategories, 
    budget,
    location,
    preferOnline,
    severity,
    preferences,
    timeAvailability,
    timeFrame,
    specificGoals,
    primaryIssue,
    contextualFactors,
    servicePriorities,
    contraindicated,
    userType
  } = enhancedAnalyzeUserInput(userQuery);
  
  console.log("Enhanced analysis complete:", {
    medicalConditions,
    suggestedCategories,
    budget,
    location,
    preferOnline,
    severity,
    primaryIssue,
    contextualFactors,
    userType
  });
  
  // Calculate complexity score based on conditions, goals, and complexity indicators
  const complexityScore = calculateComplexityScore(
    medicalConditions,
    specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
    userQuery,
    servicePriorities ? servicePriorities : {}
  );
  
  console.log("Calculated complexity score:", complexityScore);
  
  // Determine if this is a complex case requiring multiple professionals
  const needsMultidisciplinary = isComplexCase(
    medicalConditions, 
    specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
    userQuery
  );
  
  console.log("Needs multidisciplinary approach:", needsMultidisciplinary);
  
  // Ensure we have the right categories based on the analysis
  let categories = [...suggestedCategories];
  
  // Handle co-morbidities - add specialized services when certain conditions co-occur
  const coMorbidityServices = checkCoMorbidities(medicalConditions);
  coMorbidityServices.forEach(service => {
    if (!categories.includes(service as ServiceCategory) && 
        contraindicated && !contraindicated.includes(service as ServiceCategory)) {
      categories.push(service as ServiceCategory);
      console.log(`Added ${service} due to co-morbidity detection`);
    }
  });
  
  // Remove contraindicated services
  if (contraindicated) {
    categories = categories.filter(cat => !contraindicated.includes(cat));
  }
  console.log("Final service categories after filtering:", categories);
  
  // Apply special case handling
  categories = handleSpecialCases(
    categories,
    medicalConditions,
    userQuery, 
    servicePriorities ? servicePriorities : {},
    primaryIssue
  );
  
  // Calculate budget tiers based on user input and context
  const budgetTiers = calculateBudgetTiers(
    budget, 
    userQuery, 
    preferences ? preferences : {}, 
    userType, 
    contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : []
  );
  
  console.log("Generated budget tiers:", budgetTiers);
  
  // Create plans for each budget tier
  const plans: AIHealthPlan[] = [];
  
  for (const tier of budgetTiers) {
    console.log(`\nGenerating plan for ${tier.name} tier (${tier.budget} ZAR)`);
    
    // Use our new professional scoring system here
    // In a real implementation, you would get actual practitioners from your database
    // For now, we'll use a placeholder implementation that works with our current structure
    const practitioners = getMockPractitioners(categories, tier.budget);
    
    // Score the practitioners based on all our extracted data
    const scoredPractitioners = scoreProfessionals(
      practitioners,
      medicalConditions,
      specificGoals ? (Array.isArray(specificGoals) ? specificGoals : []) : [],
      tier.budget,
      timeFrame,
      categories,
      complexityScore,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      preferences
    );
    
    console.log("Top scored practitioners:", 
      scoredPractitioners.slice(0, 3).map(p => 
        `${p.practitioner.name} (${p.score.toFixed(2)})`
      )
    );
    
    // Build an optimized plan using our enhanced system
    const optimizedPlan = buildOptimizedPlan(
      scoredPractitioners,
      tier.budget,
      timeFrame,
      complexityScore,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      preferences
    );
    
    // Use our enhanced calculation for optimal service allocation as fallback
    // if we don't have enough real practitioners
    let optimizedServices = [];
    if (optimizedPlan.professionals.length === 0) {
      optimizedServices = calculateOptimalServiceAllocation(
        categories,
        servicePriorities ? servicePriorities : {},
        tier.budget,
        userType,
        contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : []
      );
    } else {
      // Convert our professional-based plan to the service format needed
      optimizedServices = optimizedPlan.professionals.map(pro => ({
        type: pro.serviceType,
        cost: pro.pricePerSession * 4, // Assume 4 sessions for simplicity
        sessions: 4,
        frequency: "Weekly"
      }));
    }
    
    console.log("Optimized services:", optimizedServices);
    
    // Generate notes with more personalization
    const notes = generatePlanNotes(
      preferences ? preferences : {},
      medicalConditions,
      severity ? severity : {},
      specificGoals ? (Array.isArray(specificGoals) ? specificGoals : {}) : {},
      timeFrame,
      location,
      preferOnline,
      contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [],
      primaryIssue,
      servicePriorities
    );
    
    // Add explanations from our professional scoring if available
    if (optimizedPlan.explanations.length > 0) {
      notes.push(...optimizedPlan.explanations);
    }
    
    // Create a customized description
    const hasKneePainAndRacePrep = hasKneePainAndRacePreparation(medicalConditions, userQuery);
    let description = generatePlanDescription(
      medicalConditions, 
      primaryIssue, 
      userType, 
      tier.name,
      hasKneePainAndRacePrep
    );
    
    // Add notes to description
    if (notes.length > 0) {
      description = `${description} ${notes.join(' ')}`;
    }
    
    // Create the final plan
    const plan: AIHealthPlan = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}-${tier.name}`,
      name: generatePlanName(tier.name, medicalConditions, primaryIssue, hasKneePainAndRacePrep),
      description,
      services: optimizedServices.map(service => ({
        type: service.type as ServiceCategory,
        price: Math.round(service.cost / service.sessions), // Price per session
        sessions: service.sessions,
        description: generateServiceDescription(
          service.type, 
          tier.name === 'high',
          service.frequency,
          primaryIssue,
          hasKneePainAndRacePrep
        ),
        recommendedPractitioners: optimizedPlan.professionals.filter(p => 
          p.serviceType === service.type
        ) // Add recommended practitioners if available
      })),
      totalCost: optimizedServices.reduce((sum, s) => sum + s.cost, 0),
      planType: determinePlanType(medicalConditions, primaryIssue, tier.name),
      timeFrame: timeFrame || determineTimeFrame(medicalConditions, userQuery, contextualFactors ? (Array.isArray(contextualFactors) ? contextualFactors : []) : [], hasKneePainAndRacePrep)
    };
    
    plans.push(plan);
  }
  
  // Sort plans by budget
  return plans.sort((a, b) => a.totalCost - b.totalCost);
};

// Helper function to detect knee pain + race preparation special case
function hasKneePainAndRacePreparation(medicalConditions: string[], userQuery: string): boolean {
  const hasKneePain = medicalConditions.some(m => 
    m.toLowerCase().includes('knee') && m.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = userQuery.toLowerCase().includes('race') || 
                     userQuery.toLowerCase().includes('marathon') ||
                     userQuery.toLowerCase().includes('run') ||
                     medicalConditions.some(m => m.toLowerCase().includes('race'));
                     
  return hasKneePain && hasRacePrep;
}

// Helper function to handle special cases and adjust categories
function handleSpecialCases(
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
function calculateComplexityScore(
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

// Enhanced mock practitioners function with more variety
function getMockPractitioners(categories: ServiceCategory[], budget: number) {
  // This would usually come from your database
  // Here we're creating mock practitioners for demonstration
  const practitioners = [];
  
  // Create 3-5 mock practitioners for each category with more variety
  categories.forEach(category => {
    const baseCost = getBaseCostForCategory(category);
    
    // Add a premium option
    practitioners.push({
      id: `${category}-premium-${Date.now()}`,
      name: getProfessionalName(`Premium ${category.replace('-', ' ')}`),
      serviceType: category,
      pricePerSession: Math.round(baseCost * 1.4), // 40% more expensive
      serviceTags: getMockTagsForCategory(category),
      location: "Johannesburg",
      isOnline: Math.random() > 0.3, // 70% chance of online availability
      availability: "Weekdays and evenings",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Experienced senior ${category.replace('-', ' ')} with 15+ years of specialization in advanced techniques and personalized treatment plans. Known for working with complex cases and achieving excellent outcomes.`,
      rating: 4.8 + (Math.random() * 0.2) // 4.8-5.0 rating
    });
    
    // Add a standard+ option (upper mid-range)
    practitioners.push({
      id: `${category}-standard-plus-${Date.now()}`,
      name: getProfessionalName(`Quality ${category.replace('-', ' ')}`),
      serviceType: category,
      pricePerSession: Math.round(baseCost * 1.15), // 15% more expensive
      serviceTags: getMockTagsForCategory(category),
      location: "Pretoria",
      isOnline: Math.random() > 0.4, // 60% chance of online availability
      availability: "Flexible hours",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Highly regarded ${category.replace('-', ' ')} with 8 years experience specializing in holistic approaches and evidence-based treatments. Consistently delivers great results for clients with varying needs.`,
      rating: 4.5 + (Math.random() * 0.3) // 4.5-4.8 rating
    });
    
    // Add a standard option (mid-range)
    practitioners.push({
      id: `${category}-standard-${Date.now()}`,
      name: getProfessionalName(`Standard ${category.replace('-', ' ')}`),
      serviceType: category,
      pricePerSession: baseCost,
      serviceTags: getMockTagsForCategory(category),
      location: "Johannesburg",
      isOnline: Math.random() > 0.3, // 70% chance of online availability
      availability: "Weekdays and weekends",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Qualified ${category.replace('-', ' ')} with 5 years of experience offering a balanced approach to meet client needs. Specializes in creating sustainable wellness plans tailored to individual goals.`,
      rating: 4.3 + (Math.random() * 0.4) // 4.3-4.7 rating
    });
    
    // Add a value option (lower mid-range)
    practitioners.push({
      id: `${category}-value-${Date.now()}`,
      name: getProfessionalName(`Value ${category.replace('-', ' ')}`),
      serviceType: category,
      pricePerSession: Math.round(baseCost * 0.85), // 15% cheaper
      serviceTags: getMockTagsForCategory(category),
      location: "Online primarily, limited in-person sessions",
      isOnline: true,
      availability: "Weekdays, limited weekend slots",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Dedicated ${category.replace('-', ' ')} focused on providing accessible care without compromising on quality. Great choice for clients seeking good value and consistent results.`,
      rating: 4.1 + (Math.random() * 0.3) // 4.1-4.4 rating
    });
    
    // Add a budget option
    practitioners.push({
      id: `${category}-budget-${Date.now()}`,
      name: getProfessionalName(`Budget ${category.replace('-', ' ')}`),
      serviceType: category,
      pricePerSession: Math.round(baseCost * 0.65), // 35% cheaper
      serviceTags: getMockTagsForCategory(category),
      location: "Online only",
      isOnline: true,
      availability: "Limited availability",
      imageUrl: "https://via.placeholder.com/150",
      bio: `Affordable ${category.replace('-', ' ')} committed to making wellness accessible to all. Newer to the field but well-trained and passionate about helping clients achieve their health goals.`,
      rating: 3.8 + (Math.random() * 0.4) // 3.8-4.2 rating
    });
  });
  
  return practitioners;
}

// Helper function to generate varied professional names
function getProfessionalName(categoryName: string): string {
  const firstNames = [
    'Alex', 'Morgan', 'Jordan', 'Taylor', 'Casey', 'Sam', 'Jamie', 
    'Lesley', 'Dana', 'Riley', 'Avery', 'Quinn', 'Reese', 'Parker',
    'Jessica', 'Michael', 'Sarah', 'David', 'Emma', 'Thabo', 'Zanele',
    'Sipho', 'Lerato', 'Themba', 'Nomsa', 'Jacob', 'Priya', 'Mohammed'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis',
    'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
    'Nkosi', 'Mkhize', 'Dlamini', 'Ndlovu', 'Khumalo', 'Zulu', 'Patel',
    'Singh', 'Khan', 'van der Merwe', 'Botha', 'Pretorius'
  ];
  
  // Pick random names
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

// Helper function to get base cost for different categories
function getBaseCostForCategory(category: string): number {
  switch(category) {
    case 'personal-trainer': return 500;
    case 'dietician': return 600;
    case 'physiotherapist': return 700;
    case 'coaching': return 550;
    case 'biokineticist': return 650;
    case 'family-medicine': return 800;
    case 'psychiatry': return 1200;
    case 'cardiology': return 1500;
    case 'dermatology': return 1100;
    case 'gastroenterology': return 1300;
    case 'orthopedics': return 1400;
    case 'neurology': return 1600;
    case 'pain-management': return 900;
    case 'endocrinology': return 1200;
    case 'rheumatology': return 1300;
    default: return 800;
  }
}

// Helper function to get tags for different categories with more variety
function getMockTagsForCategory(category: string): string[] {
  const baseTags: Record<string, string[]> = {
    'personal-trainer': [
      'strength training', 'weight loss', 'cardio', 'fitness', 
      'HIIT', 'weight management', 'muscle building', 'toning',
      'sports performance', 'functional training', 'bodyweight training',
      'powerlifting', 'endurance', 'rehabilitation'
    ],
    'dietician': [
      'nutrition', 'weight management', 'meal planning', 'diet',
      'diabetes management', 'sports nutrition', 'gut health',
      'food allergies', 'metabolic health', 'intuitive eating',
      'plant-based nutrition', 'prenatal nutrition', 'therapeutic diets'
    ],
    'physiotherapist': [
      'rehabilitation', 'pain management', 'sports injuries', 'recovery',
      'joint mobility', 'post-surgery', 'chronic pain', 'back pain',
      'neck pain', 'musculoskeletal', 'manual therapy', 'neurological rehab',
      'vestibular therapy', 'pediatric', 'geriatric'
    ],
    'coaching': [
      'motivation', 'habit formation', 'accountability', 'goals',
      'wellness coaching', 'health coaching', 'life coaching', 
      'performance coaching', 'behavior change', 'stress management',
      'mindset', 'time management', 'work-life balance'
    ],
    'biokineticist': [
      'movement', 'rehabilitation', 'performance', 'assessment',
      'functional testing', 'biomechanics', 'orthopedic rehab',
      'cardiovascular conditioning', 'neurological rehab', 'postural analysis',
      'injury prevention', 'chronic disease management'
    ],
    'family-medicine': [
      'general health', 'preventative care', 'diagnosis', 'treatment',
      'chronic disease management', 'check-ups', 'primary care',
      'acute illness', 'health maintenance', 'vaccinations',
      'health screenings', 'minor procedures'
    ],
    'psychiatry': [
      'mental health', 'anxiety', 'depression', 'therapy',
      'medication management', 'bipolar disorder', 'ADHD',
      'stress', 'trauma', 'sleep disorders', 'mood disorders',
      'psychological assessment', 'cognitive-behavioral therapy'
    ]
  };
  
  // For any category not in our base tags, use a default set
  const allTags = baseTags[category] || [
    'healthcare', 'wellness', 'treatment', 'specialized care',
    'assessment', 'diagnostics', 'management', 'therapy'
  ];
  
  // Pick 4-6 random tags from the available tags for this category
  const numTags = 4 + Math.floor(Math.random() * 3); // 4-6 tags
  const selectedTags: string[] = [];
  
  // Ensure we don't try to get more tags than exist
  const tagsToSelect = Math.min(numTags, allTags.length);
  
  while (selectedTags.length < tagsToSelect) {
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!selectedTags.includes(randomTag)) {
      selectedTags.push(randomTag);
    }
  }
  
  return selectedTags;
}

// Export our original functions for compatibility
export {
  generatePlan,
  analyzeUserInput,
  findAlternativeCategories
};
