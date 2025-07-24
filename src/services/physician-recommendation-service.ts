import Papa from 'papaparse';

export interface Physician {
  Name: string;
  Title: string;
  Location: string;
  Experience: number;
  Price: number;
}

export interface PhysicianRecommendation extends Physician {
  affordability: 'Within budget' | 'Above budget';
  matchReason?: string;
}

export interface HealthQuery {
  prompt: string;
}

/**
 * Extracts budget from prompt text (looks for R amount or amount patterns)
 */
const extractBudget = (prompt: string): number | undefined => {
  const budgetPatterns = [
  /R\s*(\d+)/i,                          // R1000
  /budget.*?(\d+)/i,                    // budget is 1000
  /(\d+).*?budget/i,                    // 1000 budget
  /(\d+).*?month/i,                     // 1000 per month
  /(\d+).*?rand/i,                      // 1000 rands
  /(\d+)\s*(ZAR|zar)/i,                 // 1000 ZAR
  /i have.*?(\d+)\s*(rands|rand|ZAR)/i,// I have 1000 rand
  /can spend.*?(\d+)/i,                 // can spend 1000
  /my budget.*?is.*?(\d+)/i,            // my budget is 1000
  /I can afford.*?(\d+)/i,              // I can afford 1000
  /around\s*R?\s*(\d+)/i,               // around R1000
  /upto\s*R?\s*(\d+)/i,                 // upto R1000
  /not more than\s*R?\s*(\d+)/i,        // not more than R1000
  /maximum.*?R?\s*(\d+)/i,              // maximum R1000
  /(\d+)\s*(per\s*visit|per\s*session)/i // 1000 per visit/session
];
  
  for (const pattern of budgetPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return undefined;
};

/**
 * Extracts location from prompt text
 */
const extractLocation = (prompt: string): string | undefined => {
  const locationPatterns = [
    /in\s+([a-zA-Z\s]+?)(?:\s|$|\.)/i,
    /location.*?([a-zA-Z\s]+?)(?:\s|$|\.)/i,
    /(Johannesburg|Cape town|Durban|Pretoria|Port Elizabeth)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return undefined;
};

/**
 * Analyzes health issue text to extract medical specialties
 */
const analyzeHealthIssue = (issue: string): string[] => {
  const issueLower = issue.toLowerCase();
  const specialties: string[] = [];
  
  // Specialty mapping based on common health issues
  const specialtyMappings = {
    'Physiotherapist': [
      'rehabilitation', 'mobility', 'injury recovery', 'post-surgery', 'exercise therapy',
      'movement', 'physical therapy', 'pain management', 'stiffness', 'range of motion',
      'swelling', 'muscle strength', 'back pain', 'knee pain', 'shoulder', 'hip'
    ],
    'BioKineticist': [
      'exercise', 'biomechanics', 'movement analysis', 'chronic disease', 'injury prevention',
      'rehab', 'physical assessment', 'wellness', 'orthopedic condition', 'cardiac rehab',
      'musculoskeletal', 'posture', 'fitness', 'training'
    ],
    'Massage Therapist': [
      'massage', 'relaxation', 'stress relief', 'muscle tension', 'deep tissue', 'trigger point',
      'soft tissue', 'therapeutic touch', 'circulation', 'pain relief', 'wellbeing', 'bodywork'
    ],
    'Podiatrist': [
      'foot', 'ankle', 'heel pain', 'bunions', 'plantar fasciitis', 'toenail', 'orthotics',
      'gait', 'flat feet', 'diabetic foot', 'corns', 'blisters'
    ],
    'Sports Therapist': [
      'sports injury', 'sprain', 'strain', 'rehabilitation', 'athlete recovery',
      'exercise prescription', 'injury prevention', 'fitness', 'conditioning', 'training',
      'performance', 'taping', 'sports', 'athlete'
    ],
    'General Physician': [
      'fever', 'cold', 'cough', 'infection', 'check-up', 'blood pressure', 'general health',
      'diabetes', 'headache', 'digestive issues', 'fatigue', 'body pain', 'general'
    ],
    'Dietician': [
      'nutrition', 'diet', 'meal plan', 'weight loss', 'cholesterol', 'blood sugar',
      'balanced diet', 'eating habits', 'nutritional deficiency', 'diabetes', 'BMI',
      'healthy eating', 'food', 'weight'
    ],
    'Chiropractor': [
      'spine', 'back pain', 'alignment', 'neck pain', 'adjustment', 'posture', 'subluxation',
      'joint', 'manual therapy', 'vertebrae', 'musculoskeletal', 'headache', 'spinal'
    ]
  };
  
  // Check for specialty matches
  Object.entries(specialtyMappings).forEach(([specialty, keywords]) => {
    if (keywords.some(keyword => issueLower.includes(keyword))) {
      specialties.push(specialty);
    }
  });
  
  // Default to General Physician if no specialty found
  if (specialties.length === 0) {
    specialties.push('General Physician');
  }
  
  return specialties;
};

/**
 * Loads physician data from CSV file
 */
export const loadPhysicianData = async (): Promise<Physician[]> => {
  try {
    const response = await fetch('/physicians.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<Physician>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          resolve(results.data.filter(row => row.Name && row.Title));
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading physician data:', error);
    return [];
  }
};

/**
 * Implements the filtering and ranking logic as specified
 */
export const findRecommendedPhysicians = async (query: HealthQuery): Promise<PhysicianRecommendation[]> => {
  const physicians = await loadPhysicianData();
  
  if (physicians.length === 0) {
    return [];
  }
  
  // Extract information from the prompt
  const budget = extractBudget(query.prompt);
  const location = extractLocation(query.prompt);
  
  // Step 1: Specialty/Title filtering
  const detectedSpecialties = analyzeHealthIssue(query.prompt);
  console.log('Detected specialties:', detectedSpecialties);
  
  let filteredPhysicians: Physician[] = [];
  
  // Try each detected specialty
  for (const specialty of detectedSpecialties) {
    const specialtyMatches = physicians.filter(p => p.Title === specialty);
    if (specialtyMatches.length > 0) {
      filteredPhysicians.push(...specialtyMatches);
    }
  }
  
  // If no matches found, default to General Physician
  if (filteredPhysicians.length === 0) {
    filteredPhysicians = physicians.filter(p => p.Title === 'General Physician');
  }
  
  console.log('After specialty filter:', filteredPhysicians.length);
  
  // Step 2: Price filtering
  if (budget) {
    const minPrice = Math.min(...filteredPhysicians.map(p => p.Price));
    
    if (budget < minPrice) {
      // Return three cheapest doctors (sorted by price ascending, then take first 3)
      filteredPhysicians = filteredPhysicians
        .sort((a, b) => a.Price - b.Price)
        .slice(0, 3);
    } else {
      // Keep only within budget, sort by price high to low
      filteredPhysicians = filteredPhysicians
        .filter(p => p.Price <= budget)
        .sort((a, b) => b.Price - a.Price);
    }
  }
  
  console.log('After price filter:', filteredPhysicians.length);
  
  // Step 3: Experience sorting (high to low)
  filteredPhysicians.sort((a, b) => b.Experience - a.Experience);
  
  // Step 4: Location filtering
  if (location) {
    const locationMatches = filteredPhysicians.filter(p => 
      p.Location.toLowerCase().includes(location.toLowerCase())
    );
    
    if (locationMatches.length > 0) {
      filteredPhysicians = locationMatches;
    }
    // If no location matches, keep current list (skip filter)
  }
  
  console.log('After location filter:', filteredPhysicians.length);
  
  // Step 5: Final selection (top 3)
  const finalSelection = filteredPhysicians.slice(0, 3);
  
  // Add affordability information
  return finalSelection.map(physician => ({
    ...physician,
    affordability: (budget && physician.Price <= budget) ? 'Within budget' : 'Above budget',
    matchReason: `Matched for ${physician.Title} with ${physician.Experience} years experience`
  }));
};

/**
 * Get all unique specialties from the data
 */
export const getAvailableSpecialties = async (): Promise<string[]> => {
  const physicians = await loadPhysicianData();
  return [...new Set(physicians.map(p => p.Title))].sort();
};

/**
 * Get all unique locations from the data
 */
export const getAvailableLocations = async (): Promise<string[]> => {
  const physicians = await loadPhysicianData();
  return [...new Set(physicians.map(p => p.Location))].sort();
};
