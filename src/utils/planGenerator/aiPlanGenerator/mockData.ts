
import { ServiceCategory } from '@/types';

/**
 * Enhanced mock practitioners function with more variety
 */
export function getMockPractitioners(categories: ServiceCategory[], budget: number) {
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

/**
 * Helper function to generate varied professional names
 */
export function getProfessionalName(categoryName: string): string {
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

/**
 * Helper function to get base cost for different categories
 */
export function getBaseCostForCategory(category: string): number {
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

/**
 * Helper function to get tags for different categories with more variety
 */
export function getMockTagsForCategory(category: string): string[] {
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
