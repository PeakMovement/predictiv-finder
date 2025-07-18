
import Papa from 'papaparse';
import solver from 'javascript-lp-solver';
import { ServiceCategory } from "../types";
import { AIHealthPlan } from '@/types';

// Define treatment structure matching the CSV
interface Treatment {
    Treatment_Cat: string;
    Pain_Cat: string;
    Cost: number;
    Utility_Score: number;
    [key: string]: any;
}

// Load and parse CSV data
async function loadTreatmentData(): Promise<Treatment[]> {
    try {
        // Fetch the CSV file from the public directory
        const response = await fetch('/treatments.csv');
        const csvData = await response.text();
        
        const parsed = Papa.parse<Treatment>(csvData, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        
        // Clean the data
        const cleanTreatments = parsed.data.filter(
            (t) => t.Pain_Cat && !isNaN(t.Cost) && !isNaN(t.Utility_Score)
        );
        
        console.log(`Loaded ${cleanTreatments.length} treatments from CSV`);
        return cleanTreatments;
    } catch (error) {
        console.error('Error loading treatment data:', error);
        // Fallback to hardcoded data if CSV loading fails
        return [
            { Treatment_Cat: 'Physiotherapy', Pain_Cat: 'Back pain', Cost: 400, Utility_Score: 90 },
            { Treatment_Cat: 'Physiotherapy', Pain_Cat: 'Joint injuries', Cost: 500, Utility_Score: 85 },
            { Treatment_Cat: 'Physiotherapy', Pain_Cat: 'Neck pain', Cost: 600, Utility_Score: 80 },
            { Treatment_Cat: 'Biokinetics', Pain_Cat: 'Back pain', Cost: 400, Utility_Score: 80 },
            { Treatment_Cat: 'Biokinetics', Pain_Cat: 'Joint injuries', Cost: 500, Utility_Score: 70 },
            { Treatment_Cat: 'Massage therapy', Pain_Cat: 'Back pain', Cost: 400, Utility_Score: 75 },
            { Treatment_Cat: 'Massage therapy', Pain_Cat: 'Neck pain', Cost: 500, Utility_Score: 80 }
        ];
    }
}

// Optimize treatment selection using linear programming
export async function optimizeTreatmentSelection(budget: number, painCategory: string): Promise<number[] | string> {
    const treatments = await loadTreatmentData();
    const painCats = Array.from(new Set(treatments.map(t => t.Pain_Cat)));
    
    if (!painCats.includes(painCategory)) {
        return 'Invalid pain category';
    }

    const options = treatments.filter(t => t.Pain_Cat === painCategory);
    console.log(`🧪 ${options.length} treatments found for '${painCategory}'`);

    type Model = solver.Model;
    const model: Model = {
        optimize: 'utility',
        opType: 'max',
        constraints: {
            cost: { max: budget }
        },
        variables: {},
        ints: {}
    };

    options.forEach((t, i) => {
        const key = `x${i}`;
        const cost = parseFloat(String(t.Cost));
        const utility = parseFloat(String(t.Utility_Score));
        const constraintKey = `${key}_max`;

        model.variables[key] = {
            utility: utility,
            cost: cost,
            [constraintKey]: 1
        };

        model.constraints[constraintKey] = { max: 1 };
        model.ints[key] = 1;
    });

    const results = solver.Solve(model);

    const binaryIndicators = options.map((_, i) => {
        const key = `x${i}`;
        return results[key] === 1 ? 1 : 0;
    });

    return binaryIndicators;
}

// Convert optimization results to treatment plan
export async function generateOptimizedTreatmentPlan(
    budget: number,
    painCategory: string,
    userInput: string
): Promise<AIHealthPlan> {
    const treatments = await loadTreatmentData();
    const options = treatments.filter(t => t.Pain_Cat === painCategory);
    
    const selectionVector = await optimizeTreatmentSelection(budget, painCategory);
    
    if (typeof selectionVector === 'string') {
        // Fallback plan if optimization fails
        return {
            id: `fallback-${Date.now()}`,
            name: "Basic Treatment Plan",
            description: `A basic treatment plan for ${painCategory}`,
            services: [{
                type: 'physiotherapist' as ServiceCategory,
                price: 400,
                sessions: 2,
                description: "Standard physiotherapy sessions"
            }],
            totalCost: 800,
            planType: 'best-fit',
            timeFrame: '4 weeks'
        };
    }

    // Build services from selected treatments
    const services = options
        .map((treatment, index) => {
            if (selectionVector[index] === 1) {
                // Map treatment categories to service categories
                const serviceTypeMap: Record<string, ServiceCategory> = {
                    'Physiotherapy': 'physiotherapist',
                    'Biokinetics': 'biokineticist',
                    'Massage therapy': 'massage-therapy'
                };
                
                const serviceType = serviceTypeMap[treatment.Treatment_Cat] || 'physiotherapist';
                
                return {
                    type: serviceType,
                    price: treatment.Cost,
                    sessions: Math.max(1, Math.floor(budget / treatment.Cost / options.length)),
                    description: `${treatment.Treatment_Cat} for ${treatment.Pain_Cat} (Utility Score: ${treatment.Utility_Score})`
                };
            }
            return null;
        })
        .filter(Boolean) as any[];

    const totalCost = services.reduce((sum, service) => sum + (service.price * service.sessions), 0);

    return {
        id: `optimized-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: `Optimized Plan for ${painCategory}`,
        description: `Linear programming optimized treatment plan for ${painCategory} with utility maximization within budget of R${budget}`,
        services,
        totalCost,
        planType: 'best-fit',
        timeFrame: '6-8 weeks'
    };
}

// Get available pain categories from the data
export async function getAvailablePainCategories(): Promise<string[]> {
    const treatments = await loadTreatmentData();
    return Array.from(new Set(treatments.map(t => t.Pain_Cat)));
}
