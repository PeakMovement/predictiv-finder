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
  if (physicians.length === 0) return [];

  const budget = extractBudget(query.prompt);
  const location = extractLocation(query.prompt);
  const detectedSpecialties = analyzeHealthIssue(query.prompt);

  console.log('Detected specialties:', detectedSpecialties);

  // Step 1: Filter by location if specified
  let locationFiltered: Physician[] = physicians;
  if (location) {
    locationFiltered = physicians.filter(p =>
      p.Location.toLowerCase().includes(location.toLowerCase())
    );

    if (locationFiltered.length === 0) {
      console.log('No physicians found in the specified location.');
      return []; // Strictly enforce location presence
    }
  }

  // Step 2: Try to find relevant specialists in that location
  let specialtyFiltered: Physician[] = [];
  for (const specialty of detectedSpecialties) {
    const matches = locationFiltered.filter(p => p.Title === specialty);
    if (matches.length > 0) {
      specialtyFiltered.push(...matches);
    }
  }

  // Step 3: Fallback to General Physician in the same location if no match
  if (specialtyFiltered.length === 0) {
    const generalPhysicians = locationFiltered.filter(p => p.Title === 'General Physician');
    if (generalPhysicians.length > 0) {
      specialtyFiltered = generalPhysicians;
      console.log('Fallback to General Physician in location');
    } else {
      console.log('No General Physicians in the location either.');
      return []; // No specialists or GPs in location
    }
  }

  let filteredPhysicians = specialtyFiltered;

  // Step 4: Sort by price (desc), then experience (desc)
  filteredPhysicians = filteredPhysicians
    .sort((a, b) => b.Price - a.Price || b.Experience - a.Experience);

  // Step 5: Budget-aware filtering
  let withinBudget: Physician[] = [];
  let aboveBudget: Physician[] = [];

  if (budget !== undefined) {
    withinBudget = filteredPhysicians.filter(p => p.Price <= budget);
    aboveBudget = filteredPhysicians.filter(p => p.Price > budget);
  } else {
    withinBudget = filteredPhysicians;
  }

  const finalSelection: Physician[] = [
    ...withinBudget.slice(0, 3),
    ...aboveBudget.slice(0, 3 - withinBudget.length)
  ].slice(0, 3);

  return finalSelection.map(physician => ({
    ...physician,
    affordability: budget !== undefined && physician.Price <= budget ? 'Within budget' : 'Above budget',
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
