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
  issue: string;
  budget?: number;
  location?: string;
}

/**
 * Analyzes health issue text to extract medical specialties
 */
const analyzeHealthIssue = (issue: string): string[] => {
  const issueLower = issue.toLowerCase();
  const specialties: string[] = [];
  
  // Specialty mapping based on common health issues
  const specialtyMappings = {
    'Dermatologist': [
      'skin', 'acne', 'rash', 'eczema', 'psoriasis', 'mole', 'dermatitis', 
      'wrinkle', 'age spot', 'skin cancer', 'hair loss', 'nail'
    ],
    'Cardiologist': [
      'heart', 'chest pain', 'blood pressure', 'hypertension', 'palpitation', 
      'cardiac', 'cardiovascular', 'arrhythmia', 'cholesterol', 'heart attack'
    ],
    'Neurologist': [
      'headache', 'migraine', 'seizure', 'epilepsy', 'stroke', 'memory', 
      'alzheimer', 'parkinson', 'nerve', 'neurological', 'brain', 'numbness'
    ],
    'Psychiatrist': [
      'depression', 'anxiety', 'stress', 'mental health', 'panic', 'mood', 
      'bipolar', 'psychiatric', 'therapy', 'counseling', 'emotional'
    ],
    'Orthopedic Surgeon': [
      'bone', 'joint', 'back pain', 'knee pain', 'shoulder', 'hip', 'fracture', 
      'arthritis', 'sports injury', 'spine', 'orthopedic', 'muscle pain'
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
  
  // Step 1: Specialty/Title filtering
  const detectedSpecialties = analyzeHealthIssue(query.issue);
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
  if (query.budget) {
    const minPrice = Math.min(...filteredPhysicians.map(p => p.Price));
    
    if (query.budget < minPrice) {
      // Return three cheapest doctors (sorted by price ascending, then take last 3)
      filteredPhysicians = filteredPhysicians
        .sort((a, b) => a.Price - b.Price)
        .slice(-3);
    } else {
      // Keep only within budget, sort by price high to low
      filteredPhysicians = filteredPhysicians
        .filter(p => p.Price <= query.budget)
        .sort((a, b) => b.Price - a.Price);
    }
  }
  
  console.log('After price filter:', filteredPhysicians.length);
  
  // Step 3: Experience sorting (high to low)
  filteredPhysicians.sort((a, b) => b.Experience - a.Experience);
  
  // Step 4: Location filtering
  if (query.location) {
    const locationMatches = filteredPhysicians.filter(p => 
      p.Location.toLowerCase().includes(query.location!.toLowerCase())
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
    affordability: (query.budget && physician.Price <= query.budget) ? 'Within budget' : 'Above budget',
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
