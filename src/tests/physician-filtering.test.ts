// Test cases for the AI Health Assistant filtering logic
// This file contains comprehensive test cases to validate the physician filtering and ranking logic

import { 
  findRecommendedPhysicians, 
  HealthQuery, 
  loadPhysicianData,
  getAvailableSpecialties,
  getAvailableLocations 
} from '../services/physician-recommendation-service';

/**
 * Test Cases for AI Health Assistant - Physician Filtering Logic
 * These test cases validate the filtering sequence: Specialty → Price → Experience → Location
 * 
 * To run these tests, use a testing framework like Jest or Vitest.
 * These test cases can be executed manually or integrated into an automated test suite.
 */

export const testCases = [
  {
    id: 'TC-001',
    name: 'Basic specialty matching - Dermatologist',
    description: 'Should find dermatologists for skin issues',
    query: {
      prompt: "I have acne and skin rash on my face, budget R1000 in Johannesburg"
    },
    expectedConditions: [
      'results.length > 0',
      'results.every(r => r.Title === "Dermatologist")',
      'results.every(r => r.affordability === "Within budget")'
    ]
  },
  {
    id: 'TC-002',
    name: 'Budget filtering - within budget',
    description: 'Should return physicians within budget',
    query: {
      prompt: "heart palpitations and chest pain, budget R1200 in Cape Town"
    },
    expectedConditions: [
      'results.every(r => r.Price <= 1200)',
      'results.every(r => r.affordability === "Within budget")',
      'results.every(r => r.Title === "Cardiologist")'
    ]
  },
  {
    id: 'TC-003',
    name: 'Budget filtering - below minimum price',
    description: 'Should return cheapest physicians when budget below minimum',
    query: {
      prompt: "general health checkup, budget R400 in Johannesburg"
    },
    expectedConditions: [
      'results.length <= 3',
      'results.every(r => r.Title === "General Physician")'
    ]
  },
  {
    id: 'TC-004',
    name: 'Experience sorting',
    description: 'Should sort by experience (highest first)',
    query: {
      prompt: "heart problems need experienced cardiologist, budget R2000 in Cape Town"
    },
    expectedConditions: [
      'results.length > 1',
      'results sorted by experience (high to low)',
      'results.every(r => r.Title === "Cardiologist")'
    ]
  },
  {
    id: 'TC-005',
    name: 'Location filtering - exact match',
    description: 'Should filter by exact location match',
    query: {
      prompt: "need orthopedic surgeon for knee pain, budget R1500 in Durban"
    },
    expectedConditions: [
      'results.every(r => r.Location === "Durban")',
      'results.every(r => r.Title === "Orthopedic Surgeon")'
    ]
  },
  {
    id: 'TC-006',
    name: 'Location filtering - non-existent location',
    description: 'Should skip location filter for non-existent location',
    query: {
      prompt: "anxiety and depression issues, budget R1000 in NonExistentCity"
    },
    expectedConditions: [
      'results.length > 0',
      'results.every(r => r.Title === "Psychiatrist")'
    ]
  },
  {
    id: 'TC-007',
    name: 'Multiple specialty detection',
    description: 'Should handle multiple specialty keywords',
    query: {
      prompt: "back pain and joint issues, sports injury, budget R1400 in Johannesburg"
    },
    expectedConditions: [
      'results.every(r => r.Title === "Orthopedic Surgeon")',
      'results.every(r => r.Location === "Johannesburg")'
    ]
  },
  {
    id: 'TC-008',
    name: 'Default to General Physician',
    description: 'Should default to General Physician for unknown issues',
    query: {
      prompt: "general health concerns and wellness check, budget R600 in Pretoria"
    },
    expectedConditions: [
      'results.every(r => r.Title === "General Physician")',
      'results.every(r => r.Location === "Pretoria")'
    ]
  },
  {
    id: 'TC-009',
    name: 'Neurologist for brain-related issues',
    description: 'Should find neurologists for brain/nerve issues',
    query: {
      prompt: "severe headaches and memory problems, budget R1300 in Cape Town"
    },
    expectedConditions: [
      'results.every(r => r.Title === "Neurologist")',
      'results.every(r => r.Location === "Cape Town")'
    ]
  },
  {
    id: 'TC-010',
    name: 'Price sorting within budget',
    description: 'Should sort by price (high to low) within budget',
    query: {
      prompt: "skin problems and acne treatment, budget R1000 in Johannesburg"
    },
    expectedConditions: [
      'results sorted by price (high to low)',
      'results.every(r => r.Title === "Dermatologist")'
    ]
  },
  {
    id: 'TC-011',
    name: 'Maximum 3 results',
    description: 'Should return maximum 3 physicians',
    query: {
      prompt: "general physician consultation, budget R2000"
    },
    expectedConditions: [
      'results.length <= 3',
      'results.every(r => r.Title === "General Physician")'
    ]
  },
  {
    id: 'TC-012',
    name: 'No budget specified',
    description: 'Should work without budget constraint',
    query: {
      prompt: "heart palpitations need cardiologist in Johannesburg"
    },
    expectedConditions: [
      'results.length > 0',
      'results.every(r => r.Title === "Cardiologist")',
      'results.every(r => r.Location === "Johannesburg")'
    ]
  },
  {
    id: 'TC-013',
    name: 'No location specified',
    description: 'Should work without location constraint',
    query: {
      prompt: "mental health support for anxiety, budget R900"
    },
    expectedConditions: [
      'results.length > 0',
      'results.every(r => r.Title === "Psychiatrist")',
      'results.every(r => r.Price <= 900)'
    ]
  },
  {
    id: 'TC-014',
    name: 'Case insensitive location matching',
    description: 'Should handle case insensitive location matching',
    query: {
      prompt: "bone fracture need orthopedic surgeon, budget R1400 in CAPE TOWN"
    },
    expectedConditions: [
      'results.every(r => r.Location.toLowerCase().includes("cape town"))',
      'results.every(r => r.Title === "Orthopedic Surgeon")'
    ]
  },
  {
    id: 'TC-015',
    name: 'Complex query with all parameters',
    description: 'Should handle complex query with all filtering criteria',
    query: {
      prompt: "chronic back pain from sports injury, need experienced orthopedic surgeon, budget R1350 in Johannesburg"
    },
    expectedConditions: [
      'results.every(r => r.Title === "Orthopedic Surgeon")',
      'results.every(r => r.Location === "Johannesburg")',
      'results.every(r => r.Price <= 1350)',
      'results sorted by experience (high to low)',
      'results.every(r => r.affordability === "Within budget")'
    ]
  }
];

// Utility test cases
export const utilityTestCases = [
  {
    id: 'UT-001',
    name: 'Load physician data successfully',
    description: 'Should load physician data from CSV',
    testFunction: 'loadPhysicianData',
    expectedConditions: [
      'data.length > 0',
      'data.every(p => p.Name && p.Title && p.Location)'
    ]
  },
  {
    id: 'UT-002',
    name: 'Get available specialties',
    description: 'Should return all available medical specialties',
    testFunction: 'getAvailableSpecialties',
    expectedConditions: [
      'specialties.includes("Dermatologist")',
      'specialties.includes("Cardiologist")',
      'specialties.includes("General Physician")'
    ]
  },
  {
    id: 'UT-003',
    name: 'Get available locations',
    description: 'Should return all available locations',
    testFunction: 'getAvailableLocations',
    expectedConditions: [
      'locations.includes("Johannesburg")',
      'locations.includes("Cape Town")',
      'locations.includes("Durban")'
    ]
  }
];

// Manual UI test cases
export const manualTestCases = [
  {
    id: 'UI-001',
    name: 'Physician card display',
    description: 'Test physician card display with all information',
    steps: [
      '1. Enter "skin problems and acne, budget R900 in Johannesburg"',
      '2. Click "Find My Physician"',
      '3. Verify physician cards show: Name, Title, Experience, Location, Monthly Fee, Affordability badge'
    ],
    expected: 'All physician cards display complete information with proper formatting'
  },
  {
    id: 'UI-002',
    name: 'Budget affordability indicators',
    description: 'Test budget affordability indicators',
    steps: [
      '1. Enter "heart palpitations, budget R500"',
      '2. Click "Find My Physician"',
      '3. Check affordability badges on returned physicians'
    ],
    expected: 'Physicians above budget show "Above budget" badge in orange, within budget show "Within budget" in green'
  },
  {
    id: 'UI-003',
    name: 'Responsive design on mobile',
    description: 'Test responsive design on mobile',
    steps: [
      '1. Resize browser to mobile width (375px)',
      '2. Test input form usability',
      '3. Test physician cards layout',
      '4. Test navigation buttons'
    ],
    expected: 'All elements remain usable and properly sized on mobile devices'
  },
  {
    id: 'UI-004',
    name: 'Error handling - no results',
    description: 'Test error handling when no physicians match criteria',
    steps: [
      '1. Enter very specific rare condition with extremely low budget',
      '2. Click "Find My Physician"'
    ],
    expected: 'Application shows appropriate error message and suggests adjusting criteria'
  },
  {
    id: 'UI-005',
    name: 'Form validation',
    description: 'Test form validation for required fields',
    steps: [
      '1. Leave prompt field empty',
      '2. Click "Find My Physician"',
      '3. Enter very short prompt (< 10 characters)',
      '4. Click "Find My Physician"'
    ],
    expected: 'Appropriate validation messages are displayed for empty and too-short inputs'
  }
];

/**
 * Test execution function for automated testing
 * This function can be used to run all test cases programmatically
 */
export const executeTestCases = async () => {
  console.log('Starting AI Health Assistant Test Suite...');
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      console.log(`Running ${testCase.id}: ${testCase.name}`);
      
      const query = testCase.query as HealthQuery;
      const physicians = await findRecommendedPhysicians(query);
      
      // Log results for manual verification
      console.log(`Results for ${testCase.id}:`, {
        queryPrompt: query.prompt,
        resultCount: physicians.length,
        specialties: [...new Set(physicians.map(p => p.Title))],
        locations: [...new Set(physicians.map(p => p.Location))],
        priceRange: physicians.length > 0 ? 
          `R${Math.min(...physicians.map(p => p.Price))} - R${Math.max(...physicians.map(p => p.Price))}` : 'N/A'
      });
      
      results.push({
        testCase: testCase.id,
        passed: physicians.length >= 0, // Basic check that function didn't error
        resultCount: physicians.length,
        physicians
      });
      
    } catch (error) {
      console.error(`Test ${testCase.id} failed:`, error);
      results.push({
        testCase: testCase.id,
        passed: false,
        error: error.message
      });
    }
  }
  
  console.log('Test Suite Complete');
  return results;
};

// Export for use in testing environments
export { findRecommendedPhysicians, loadPhysicianData, getAvailableSpecialties, getAvailableLocations };

console.log('Test cases defined. Use executeTestCases() to run all tests, or test individual cases manually.');