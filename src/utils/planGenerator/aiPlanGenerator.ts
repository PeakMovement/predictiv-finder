
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
 * Enhanced complexity score calculation with more nuanced factors
 * Returns a value between 0-5 where:
 * 0-1: Simple issue (single condition/goal)
 * 2-3: Moderate complexity (multiple related issues)
 * 4-5: Complex case (multiple chronic or interrelated conditions)
 */
function calculateComplexityScore(
  conditions: string[],
  goals: string[],
  userQuery: string,
  servicePriorities: Record<string, number>
): number {
  let score = 0;
  
  // Base score from number of conditions and goals
  score += Math.min(conditions.length * 0.8, 2.5); // Cap at 2.5
  score += Math.min(goals.length * 0.5, 1.5);      // Cap at 1.5
  
  // Check for complexity indicators in the query
  const complexityMatches = COMPLEXITY_INDICATORS.filter(indicator => 
    userQuery.toLowerCase().includes(indicator.toLowerCase())
  );
  
  score += complexityMatches.length * 0.5; // 0.5 points per complexity indicator
  
  // Check for chronic conditions
  const chronicConditions = conditions.filter(c => 
    c.toLowerCase().includes('chronic') || 
    c.toLowerCase().includes('recurring') ||
    c.toLowerCase().includes('persistent')
  );
  
  score += chronicConditions.length * 0.7; // 0.7 points per chronic condition
  
  // Check service diversity needed based on priorities
  const highPriorityServices = Object.entries(servicePriorities)
    .filter(([_, priority]) => priority > 0.7)
    .map(([service, _]) => service);
    
  // More diverse service needs = higher complexity
  score += Math.min(highPriorityServices.length * 0.4, 1.2);
  
  // NEW: Check for comorbidity patterns (multiple related conditions)
  const hasComorbidityPatterns = (
    (conditions.some(c => c.toLowerCase().includes('pain')) && 
     conditions.some(c => c.toLowerCase().includes('depression'))) ||
    (conditions.some(c => c.toLowerCase().includes('weight')) && 
     conditions.some(c => c.toLowerCase().includes('diabetes'))) ||
    (conditions.some(c => c.toLowerCase().includes('anxiety')) && 
     conditions.some(c => c.toLowerCase().includes('sleep')))
  );
  
  if (hasComorbidityPatterns) {
    score += 1.2; // Significant complexity boost for comorbidities
    console.log("Detected comorbidity pattern, adding complexity score");
  }
  
  // NEW: Check for timeline challenges
  const hasTimeConstraints = userQuery.toLowerCase().includes('urgent') || 
                          userQuery.toLowerCase().includes('soon') ||
                          userQuery.toLowerCase().includes('deadline') ||
                          userQuery.toLowerCase().includes('weeks');
  
  if (hasTimeConstraints) {
    score += 0.7; // Time constraints increase complexity
    console.log("Detected time constraints, adding complexity score");
  }
  
  // Ensure score stays within 0-5 range
  return Math.max(0, Math.min(5, score));
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
