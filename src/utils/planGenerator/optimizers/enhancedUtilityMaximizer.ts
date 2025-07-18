
import { ServiceCategory } from "../types";
import { PlanGenerationError, PlanGenerationErrorType } from "../errorHandling/planGenerationError";
import { safePlanOperation } from "../errorHandling/planGenerationError";
import { EnhancedTreatmentOption } from "../data/treatmentOptions";

// Extended optimization constraints with location and time preferences
export interface EnhancedOptimizationConstraints {
  budget: number;               // Total available budget
  timeAvailable: number;        // Total available time in minutes
  diversityFactor?: number;     // 0-1 factor for service diversity (higher = more diverse)
  urgencyWeight?: number;       // Weight for urgency in utility calculation
  location?: string;            // Preferred location
  preferOnline?: boolean;       // Whether user prefers online sessions
  availableDays?: string[];     // Days when user is available
  timeOfDay?: 'morning' | 'afternoon' | 'evening'; // Preferred time of day
  goalKeywords?: string[];      // Keywords that match user's goals
}

// Enhanced allocation result with more details
export interface EnhancedAllocation {
  id: string;
  name: string;
  serviceType: ServiceCategory;
  practitioner: string;
  sessionsPerMonth: number;
  totalUtility: number;
  totalCost: number;
  timeRequired: number;
  percentageBudget: number;
  location: string;
  deliveryType: 'in-person' | 'remote' | 'hybrid';
  timeToBefit: number;         // Weeks until expected benefit
  availability: string;
  expectedBenefitScore: number; // Calculated benefit score
}

// Enhanced optimized plan result
export interface EnhancedOptimizedPlan {
  allocations: EnhancedAllocation[];
  totalCost: number;
  totalUtility: number;
  totalTime: number;
  utilizationRate: {
    budget: number;      // Percentage of budget utilized
    time: number;        // Percentage of time utilized
  };
  notes: string[];
  locationBreakdown?: {
    inPerson: number;    // Number of in-person sessions
    remote: number;      // Number of remote sessions
  };
  timelineEstimate: number; // Estimated weeks to see results
  availabilityNotes?: string[];
}

/**
 * Enhanced utility maximization function that implements more constraints:
 * 
 * - Location preferences
 * - Time of day availability
 * - Day of week constraints
 * - Practitioner maximum client limits
 *
 * @param options Available enhanced treatment options
 * @param constraints Enhanced budget, time, and availability constraints
 * @returns Optimized treatment plan
 */
export function maximizeUtilityEnhanced(
  options: EnhancedTreatmentOption[],
  constraints: EnhancedOptimizationConstraints
): EnhancedOptimizedPlan {
  return safePlanOperation(() => {
    const { 
      budget, 
      timeAvailable, 
      diversityFactor = 0.3, 
      urgencyWeight = 1.5,
      location,
      preferOnline,
      availableDays,
      timeOfDay,
      goalKeywords
    } = constraints;
    
    // Validate inputs
    if (budget <= 0) {
      throw new PlanGenerationError(
        "Budget must be positive",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please provide a valid budget amount."
      );
    }
    
    if (timeAvailable <= 0) {
      throw new PlanGenerationError(
        "Available time must be positive",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "Please provide valid time availability."
      );
    }
    
    if (options.length === 0) {
      throw new PlanGenerationError(
        "No treatment options provided",
        PlanGenerationErrorType.INPUT_VALIDATION,
        "No treatment options are available for optimization."
      );
    }
    
    // Filter options based on location preference
    let filteredOptions = [...options];
    const notes: string[] = [];
    const availabilityNotes: string[] = [];
    
    // Filter by location if specified
    if (location) {
      const locationFilteredOptions = filteredOptions.filter(opt => 
        opt.location.toLowerCase().includes(location.toLowerCase()) || 
        (preferOnline && opt.deliveryType === 'remote')
      );
      
      if (locationFilteredOptions.length > 0) {
        filteredOptions = locationFilteredOptions;
        notes.push(`Filtered options based on location: ${location}`);
      } else {
        notes.push(`No options available in ${location}, including all locations`);
      }
    }
    
    // Filter by online preference if specified
    if (preferOnline === true) {
      const remoteOptions = filteredOptions.filter(opt => opt.deliveryType === 'remote');
      if (remoteOptions.length > 0) {
        filteredOptions = remoteOptions;
        notes.push('Filtered for remote/online options only');
      } else {
        notes.push('No remote options available, including in-person options');
      }
    } else if (preferOnline === false) {
      const inPersonOptions = filteredOptions.filter(opt => opt.deliveryType === 'in-person');
      if (inPersonOptions.length > 0) {
        filteredOptions = inPersonOptions;
        notes.push('Filtered for in-person options only');
      } else {
        notes.push('No in-person options available, including remote options');
      }
    }
    
    // Filter by available days if specified
    if (availableDays && availableDays.length > 0) {
      const dayFilteredOptions = filteredOptions.filter(opt => {
        // Always include flexible availability
        if (!opt.constraints.availability || 
            opt.constraints.availability.toLowerCase().includes('flexible')) {
          return true;
        }
        
        // Check if any of the user's available days match the treatment's available days
        return availableDays.some(day => {
          const dayLower = day.toLowerCase();
          const availLower = opt.constraints.availability?.toLowerCase() || '';
          
          if (dayLower === 'weekend' && availLower.includes('weekend')) {
            return true;
          }
          
          if (dayLower.includes('mon') && availLower.includes('mon')) {
            return true;
          }
          
          if (dayLower.includes('tue') && availLower.includes('tue')) {
            return true;
          }
          
          if (dayLower.includes('wed') && availLower.includes('wed')) {
            return true;
          }
          
          if (dayLower.includes('thu') && availLower.includes('thu')) {
            return true;
          }
          
          if (dayLower.includes('fri') && availLower.includes('fri')) {
            return true;
          }
          
          if (dayLower.includes('sat') && availLower.includes('sat')) {
            return true;
          }
          
          if (dayLower.includes('sun') && availLower.includes('sun')) {
            return true;
          }
          
          return false;
        });
      });
      
      if (dayFilteredOptions.length > 0) {
        filteredOptions = dayFilteredOptions;
        notes.push(`Filtered options based on available days: ${availableDays.join(', ')}`);
      } else {
        notes.push('No options available on your specified days, including all options');
      }
    }
    
    // Filter by time of day if specified
    if (timeOfDay) {
      const timeFilteredOptions = filteredOptions.filter(opt => {
        // Always include flexible availability
        if (!opt.constraints.availability || 
            opt.constraints.availability.toLowerCase().includes('flexible')) {
          return true;
        }
        
        const availLower = opt.constraints.availability?.toLowerCase() || '';
        return availLower.includes(timeOfDay.toLowerCase());
      });
      
      if (timeFilteredOptions.length > 0) {
        filteredOptions = timeFilteredOptions;
        notes.push(`Filtered options based on time of day: ${timeOfDay}`);
      } else {
        notes.push(`No options available during ${timeOfDay}, including all time slots`);
      }
    }
    
    // Filter by goal keywords if specified
    if (goalKeywords && goalKeywords.length > 0) {
      const goalFilteredOptions = filteredOptions.filter(opt =>
        goalKeywords.some(keyword =>
          opt.goalTags.some(tag => 
            tag.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      );
      
      if (goalFilteredOptions.length > 0) {
        filteredOptions = goalFilteredOptions;
        notes.push(`Prioritized options matching your goals: ${goalKeywords.join(', ')}`);
      }
    }
    
    // If no options are left after all filtering, use the original options
    if (filteredOptions.length === 0) {
      filteredOptions = options;
      notes.push('No options matched all your criteria, showing all available options');
    }
    
    // Apply urgency weights to utility scores
    const weightedOptions = filteredOptions.map(option => {
      let urgencyMultiplier = 1.0;
      if (option.urgency === 'high') {
        urgencyMultiplier = 1.5;
      } else if (option.urgency === 'medium') {
        urgencyMultiplier = 1.2;
      }
      
      return {
        ...option,
        weightedUtility: option.utility * urgencyMultiplier * urgencyWeight
      };
    });
    
    // Calculate utility to cost ratio for each option
    const rankedOptions = weightedOptions.map(option => ({
      ...option,
      utilityToCostRatio: option.weightedUtility / option.cost,
      utilityToTimeRatio: option.weightedUtility / option.timeRequired
    })).sort((a, b) => b.utilityToCostRatio - a.utilityToCostRatio);
    
    // Initialize allocation array
    const allocations = rankedOptions.map(option => ({
      id: option.id,
      name: option.name,
      serviceType: option.serviceType,
      practitioner: option.practitioner,
      sessionsPerMonth: 0,
      totalUtility: 0,
      totalCost: 0,
      timeRequired: 0,
      percentageBudget: 0,
      location: option.location,
      deliveryType: option.deliveryType,
      timeToBefit: option.timeToBefit,
      availability: option.constraints.availability || "Flexible",
      expectedBenefitScore: 0
    }));
    
    let remainingBudget = budget;
    let remainingTime = timeAvailable;
    
    // First pass: Ensure minimum sessions for each treatment
    for (let i = 0; i < rankedOptions.length; i++) {
      const option = rankedOptions[i];
      const minSessions = option.minSessions;
      
      // Check if we can afford minimum sessions
      const costForMin = option.cost * minSessions;
      const timeForMin = option.timeRequired * minSessions;
      
      if (costForMin <= remainingBudget && timeForMin <= remainingTime) {
        // Check practitioner capacity constraints
        if (option.constraints.maxClients && option.constraints.maxClients < minSessions) {
          availabilityNotes.push(`${option.name} has limited availability (max ${option.constraints.maxClients} sessions)`);
          continue;
        }
        
        // Allocate minimum sessions
        allocations[i].sessionsPerMonth = minSessions;
        allocations[i].totalCost = costForMin;
        allocations[i].totalUtility = option.weightedUtility * minSessions;
        allocations[i].timeRequired = timeForMin;
        allocations[i].expectedBenefitScore = (option.weightedUtility * minSessions) / option.timeToBefit;
        
        remainingBudget -= costForMin;
        remainingTime -= timeForMin;
      } else {
        // Can't afford minimum sessions for this option
        notes.push(`Insufficient resources for minimum sessions of ${option.name}`);
      }
    }
    
    // Second pass: Distribute remaining resources based on utility-to-cost ratio
    // with diversity factor consideration
    let serviceTypeCounts: Record<string, number> = {};
    let practitionerCounts: Record<string, number> = {};
    let canAllocateMore = true;
    
    while (canAllocateMore) {
      canAllocateMore = false;
      
      // Try to allocate one more session to the best option that fits
      for (let i = 0; i < rankedOptions.length; i++) {
        const option = rankedOptions[i];
        
        // Skip if we've reached maximum sessions
        if (allocations[i].sessionsPerMonth >= option.maxSessions) {
          continue;
        }
        
        // Check practitioner capacity constraints
        const currentPractitionerSessions = practitionerCounts[option.practitioner] || 0;
        if (option.constraints.maxClients && currentPractitionerSessions >= option.constraints.maxClients) {
          continue;
        }
        
        // Apply diversity factor - reduce utility-to-cost ratio as we add more sessions
        const currentSessions = allocations[i].sessionsPerMonth;
        const categoryCount = serviceTypeCounts[option.serviceType] || 0;
        const diversityPenalty = Math.pow(diversityFactor, categoryCount);
        
        // Calculate adjusted ratio considering diversity
        const adjustedRatio = option.utilityToCostRatio * diversityPenalty;
        
        // Check if we can afford one more session
        if (option.cost <= remainingBudget && option.timeRequired <= remainingTime) {
          // Add one more session
          allocations[i].sessionsPerMonth++;
          allocations[i].totalCost += option.cost;
          allocations[i].totalUtility += option.weightedUtility;
          allocations[i].timeRequired += option.timeRequired;
          allocations[i].expectedBenefitScore = (option.weightedUtility * allocations[i].sessionsPerMonth) / option.timeToBefit;
          
          remainingBudget -= option.cost;
          remainingTime -= option.timeRequired;
          
          // Update service type counts for diversity calculation
          serviceTypeCounts[option.serviceType] = (serviceTypeCounts[option.serviceType] || 0) + 1;
          
          // Update practitioner counts for capacity constraints
          practitionerCounts[option.practitioner] = (practitionerCounts[option.practitioner] || 0) + 1;
          
          canAllocateMore = true;
          break; // Break and restart to re-evaluate all options with updated constraints
        }
      }
    }
    
    // Calculate totals and percentages
    let totalCost = 0;
    let totalUtility = 0;
    let totalTime = 0;
    let inPersonSessions = 0;
    let remoteSessions = 0;
    let maxTimeToBefit = 0;
    
    for (const allocation of allocations) {
      if (allocation.sessionsPerMonth > 0) {
        totalCost += allocation.totalCost;
        totalUtility += allocation.totalUtility;
        totalTime += allocation.timeRequired;
        
        // Calculate percentage of budget
        allocation.percentageBudget = (allocation.totalCost / budget) * 100;
        
        // Count delivery types
        if (allocation.deliveryType === 'in-person') {
          inPersonSessions += allocation.sessionsPerMonth;
        } else if (allocation.deliveryType === 'remote') {
          remoteSessions += allocation.sessionsPerMonth;
        }
        
        // Track the longest time to benefit
        if (allocation.timeToBefit > maxTimeToBefit) {
          maxTimeToBefit = allocation.timeToBefit;
        }
      }
    }
    
    // Filter out services with zero sessions
    const filteredAllocations = allocations.filter(a => a.sessionsPerMonth > 0);
    
    // Add notes on resource utilization
    const budgetUtilization = (totalCost / budget) * 100;
    const timeUtilization = (totalTime / timeAvailable) * 100;
    
    if (budgetUtilization > 90) {
      notes.push("Budget is fully utilized in this plan.");
    } else if (budgetUtilization < 70) {
      notes.push("This plan uses only part of your budget, leaving room for additional treatments if desired.");
    }
    
    if (timeUtilization > 90) {
      notes.push("Your available time is fully utilized in this plan.");
    } else if (timeUtilization < 70) {
      notes.push("This plan leaves you with free time for other activities.");
    }
    
    // Add availability notes to the main notes
    if (availabilityNotes.length > 0) {
      notes.push(...availabilityNotes);
    }
    
    // Return the enhanced optimized plan
    return {
      allocations: filteredAllocations,
      totalCost,
      totalUtility,
      totalTime,
      utilizationRate: {
        budget: budgetUtilization,
        time: timeUtilization
      },
      notes,
      locationBreakdown: {
        inPerson: inPersonSessions,
        remote: remoteSessions
      },
      timelineEstimate: maxTimeToBefit,
      availabilityNotes: availabilityNotes.length > 0 ? availabilityNotes : undefined
    };
  }, PlanGenerationErrorType.PLAN_CREATION, "enhanced utility maximization");
}
