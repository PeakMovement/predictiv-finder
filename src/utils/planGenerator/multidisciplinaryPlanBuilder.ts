
import { AIHealthPlan, ServiceCategory, Practitioner } from "@/types";
import { parseMonthlyBudget } from "./budgetDetector";
import { extractGoalTimeframe } from "./detectors/timeframeDetector";
import { calculateSessions, distributeSessionsByBudget } from "./sessionCalculator";

interface PlanParameters {
  input: string;
  primaryCondition: string;
  services: ServiceCategory[];
  budget: number;
  timeframeWeeks: number;
  isStrictBudget: boolean;
  goals: string[];
  urgencyLevel: number;
}

interface ServiceAllocation {
  type: ServiceCategory;
  priority: number;
  sessions: number;
  costPerSession: number;
  totalCost: number;
  weeklyDistribution: number[];
}

export function buildMultidisciplinaryPlan(params: PlanParameters): AIHealthPlan {
  console.log("Building multidisciplinary plan with parameters:", params);
  
  // Step 1: Determine which services are essential vs optional based on the condition
  const servicesByPriority = prioritizeServices(params.services, params.primaryCondition, params.goals);
  
  // Step 2: Parse budget constraints
  const { monthlyAmount, totalAmount, timeframe } = parseMonthlyBudget(params.input);
  const effectiveMonthlyBudget = monthlyAmount || (params.budget / (params.timeframeWeeks / 4));
  const effectiveTimeframe = timeframe || params.timeframeWeeks;
  
  console.log(`Effective monthly budget: R${effectiveMonthlyBudget}, timeframe: ${effectiveTimeframe} weeks`);
  
  // Step 3: Allocate budget across services based on priority
  const serviceAllocations = allocateServicesToTimeframe(
    servicesByPriority,
    effectiveMonthlyBudget,
    effectiveTimeframe,
    params.isStrictBudget,
    params.urgencyLevel
  );
  
  // Step 4: Generate plan with allocated services
  const plan = generatePlanFromAllocations(
    serviceAllocations,
    params.primaryCondition,
    effectiveTimeframe,
    params.goals
  );
  
  return plan;
}

function prioritizeServices(
  services: ServiceCategory[],
  primaryCondition: string,
  goals: string[]
): { type: ServiceCategory; priority: number }[] {
  // Define condition-service priority mappings
  const conditionPriorities: Record<string, Partial<Record<ServiceCategory, number>>> = {
    "back pain": {
      "physiotherapist": 1,
      "biokineticist": 2,
      "personal-trainer": 3
    },
    "knee pain": {
      "physiotherapist": 1,
      "biokineticist": 2,
      "orthopedics": 3
    },
    "headache": {
      "physiotherapist": 2,
      "neurology": 3,
      "massage-therapy": 1
    },
    "tension": {
      "massage-therapy": 1,
      "physiotherapist": 2,
      "psychiatry": 3
    },
    "fitness": {
      "personal-trainer": 1,
      "coaching": 2,
      "dietician": 3
    },
    "weight loss": {
      "dietician": 1,
      "personal-trainer": 2,
      "coaching": 3
    },
    "race": {
      "coaching": 1,
      "personal-trainer": 2,
      "physiotherapist": 3
    },
    "posture": {
      "biokineticist": 1,
      "physiotherapist": 2,
      "personal-trainer": 3
    },
    "ankle": {
      "physiotherapist": 1,
      "biokineticist": 2
    },
    "mobility": {
      "biokineticist": 1,
      "physiotherapist": 2
    }
  };
  
  // Find the best matching condition from our mappings
  let bestMatch = "general";
  for (const condition in conditionPriorities) {
    if (primaryCondition.includes(condition)) {
      bestMatch = condition;
      break;
    }
  }
  
  // Get priorities for the matching condition, or use default priorities
  const priorityMap = conditionPriorities[bestMatch] || {
    "family-medicine": 1,
    "physiotherapist": 2,
    "personal-trainer": 3
  };
  
  // Modify priorities based on goals
  if (goals.includes("race") || goals.includes("training")) {
    priorityMap["coaching"] = (priorityMap["coaching"] || 4) - 1;
    priorityMap["personal-trainer"] = (priorityMap["personal-trainer"] || 4) - 1;
  }
  
  // Create and sort the prioritized services array
  return services.map(service => {
    return {
      type: service,
      priority: priorityMap[service] || 5 // Default to low priority if not in map
    };
  }).sort((a, b) => a.priority - b.priority);
}

function allocateServicesToTimeframe(
  servicesByPriority: { type: ServiceCategory; priority: number }[],
  monthlyBudget: number,
  timeframeWeeks: number,
  isStrictBudget: boolean,
  urgencyLevel: number
): ServiceAllocation[] {
  // Calculate total duration in months
  const months = Math.ceil(timeframeWeeks / 4);
  const totalBudget = monthlyBudget * months;
  
  console.log(`Allocating budget of R${totalBudget} over ${months} months (${timeframeWeeks} weeks)`);
  
  // Initial session allocation based on priority
  const allocations = distributeSessionsByBudget(
    monthlyBudget,
    servicesByPriority,
    {}, // preferences
    {}, // severity
    false // prefer high end
  );
  
  // Convert to our ServiceAllocation format
  const serviceAllocations: ServiceAllocation[] = [];
  
  for (const [serviceType, allocation] of Object.entries(allocations)) {
    if (!allocation) continue;
    
    const priority = servicesByPriority.find(s => s.type === serviceType)?.priority || 5;
    
    // Distribute sessions across weeks based on urgency and priority
    const weeklyDistribution = distributeSessionsOverTimeframe(
      allocation.sessions * months, // total sessions
      timeframeWeeks,
      priority,
      urgencyLevel
    );
    
    serviceAllocations.push({
      type: serviceType as ServiceCategory,
      priority,
      sessions: allocation.sessions * months, // total sessions
      costPerSession: allocation.costPerSession,
      totalCost: allocation.totalCost * months,
      weeklyDistribution
    });
  }
  
  // Ensure we stay within budget if strict
  if (isStrictBudget) {
    const totalCost = serviceAllocations.reduce((sum, s) => sum + s.totalCost, 0);
    if (totalCost > totalBudget) {
      // Scale back all services proportionally
      const scaleFactor = totalBudget / totalCost;
      
      serviceAllocations.forEach(service => {
        // Reduce sessions, rounding to nearest whole number
        const originalSessions = service.sessions;
        service.sessions = Math.max(1, Math.round(service.sessions * scaleFactor));
        
        // Recalculate costs
        service.totalCost = service.costPerSession * service.sessions;
        
        // Redistribute sessions
        service.weeklyDistribution = distributeSessionsOverTimeframe(
          service.sessions,
          timeframeWeeks,
          service.priority,
          urgencyLevel
        );
        
        console.log(`Scaled back ${service.type} from ${originalSessions} to ${service.sessions} sessions to meet budget`);
      });
    }
  }
  
  return serviceAllocations;
}

function distributeSessionsOverTimeframe(
  totalSessions: number,
  timeframeWeeks: number,
  priority: number,
  urgencyLevel: number
): number[] {
  const distribution: number[] = Array(timeframeWeeks).fill(0);
  let remainingSessions = totalSessions;
  
  // Different distribution strategies based on urgency and priority
  if (urgencyLevel > 0.7) {
    // Front-load sessions for urgent cases
    for (let week = 0; week < timeframeWeeks && remainingSessions > 0; week++) {
      const sessionsThisWeek = week < 2 ? 2 : 1;
      distribution[week] = Math.min(remainingSessions, sessionsThisWeek);
      remainingSessions -= distribution[week];
    }
  } else if (priority <= 2) {
    // Important services spread somewhat evenly with slight front-loading
    const baseInterval = Math.ceil(timeframeWeeks / (totalSessions + 1));
    let week = 0;
    
    while (remainingSessions > 0 && week < timeframeWeeks) {
      distribution[week] = 1;
      remainingSessions--;
      week += baseInterval;
    }
    
    // Add remaining sessions to early weeks if any left
    week = 0;
    while (remainingSessions > 0 && week < timeframeWeeks) {
      if (distribution[week] === 0) {
        distribution[week] = 1;
        remainingSessions--;
      }
      week++;
    }
  } else {
    // Lower priority services spread evenly
    const interval = Math.max(1, Math.floor(timeframeWeeks / (totalSessions || 1)));
    
    for (let i = 0; i < totalSessions; i++) {
      const week = Math.min(i * interval, timeframeWeeks - 1);
      distribution[week]++;
    }
  }
  
  return distribution;
}

function generatePlanFromAllocations(
  allocations: ServiceAllocation[],
  primaryCondition: string,
  timeframeWeeks: number,
  goals: string[]
): AIHealthPlan {
  // Calculate total cost
  const totalCost = allocations.reduce((sum, s) => sum + s.totalCost, 0);
  
  // Generate plan name based on condition and goals
  let planName = "Custom Health Plan";
  if (primaryCondition) {
    planName = `${primaryCondition.charAt(0).toUpperCase() + primaryCondition.slice(1)} Recovery Plan`;
  }
  
  if (goals.length > 0) {
    planName = `${goals[0].charAt(0).toUpperCase() + goals[0].slice(1)} Focused Health Plan`;
  }
  
  // Generate description
  let description = `A ${timeframeWeeks}-week customized plan focusing on ${primaryCondition || "your health needs"}`;
  if (goals.length > 0) {
    description += ` with the goal of ${goals.join(" and ")}.`;
  }
  
  // Generate detailed timeline description
  const timelineDescription = generateTimelineDescription(allocations, timeframeWeeks);
  description += ` ${timelineDescription}`;
  
  // Convert allocations to service objects
  const services = allocations.map(allocation => {
    return {
      type: allocation.type,
      price: allocation.costPerSession,
      sessions: allocation.sessions,
      description: generateServiceDescription(
        allocation.type,
        allocation.sessions,
        primaryCondition,
        allocation.weeklyDistribution,
        timeframeWeeks
      )
    };
  });
  
  // Create the plan
  const plan: AIHealthPlan = {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: planName,
    description,
    services,
    totalCost,
    planType: allocations.length > 1 ? "high-impact" : "best-fit",
    timeFrame: `${timeframeWeeks} weeks`
  };
  
  return plan;
}

function generateTimelineDescription(
  allocations: ServiceAllocation[],
  timeframeWeeks: number
): string {
  // Group by months for easier understanding
  const months = Math.ceil(timeframeWeeks / 4);
  let description = "";
  
  if (months <= 2) {
    // For short timeframes, describe by week
    description = "The plan includes:";
    
    for (let month = 0; month < months; month++) {
      description += `\n• Month ${month + 1}: `;
      
      const monthServices = allocations
        .filter(s => s.weeklyDistribution.slice(month * 4, (month + 1) * 4).some(sessions => sessions > 0))
        .map(s => `${s.type.replace(/-/g, ' ')} × ${s.weeklyDistribution.slice(month * 4, (month + 1) * 4).reduce((sum, v) => sum + v, 0)}`)
        .join(", ");
        
      description += monthServices;
    }
  } else {
    // For longer timeframes, give a more general overview
    description = "This plan provides a progressive approach with:";
    
    allocations.forEach(service => {
      const serviceName = service.type.replace(/-/g, ' ');
      description += `\n• ${serviceName}: ${service.sessions} sessions total`;
    });
  }
  
  return description;
}

function generateServiceDescription(
  serviceType: ServiceCategory,
  sessions: number,
  primaryCondition: string,
  distribution: number[],
  timeframeWeeks: number
): string {
  const serviceName = serviceType.replace(/-/g, ' ');
  let description = `${sessions} sessions with a ${serviceName}`;
  
  // Add condition-specific details
  if (primaryCondition) {
    switch (serviceType) {
      case 'physiotherapist':
        description += ` focusing on ${primaryCondition} treatment and rehabilitation`;
        break;
      case 'personal-trainer':
        description += ` specializing in safe exercise progressions for ${primaryCondition}`;
        break;
      case 'biokineticist':
        description += ` for functional movement assessment and ${primaryCondition} rehabilitation`;
        break;
      case 'dietician':
        description += ` for nutrition support complementing your ${primaryCondition} recovery`;
        break;
      case 'coaching':
        description += ` providing guidance on training safely with ${primaryCondition}`;
        break;
      default:
        description += ` to address your ${primaryCondition}`;
    }
  }
  
  // Add frequency description
  const averageSessionsPerWeek = sessions / timeframeWeeks;
  let frequencyDescription = "";
  
  if (averageSessionsPerWeek >= 0.9) {
    frequencyDescription = "weekly";
  } else if (averageSessionsPerWeek >= 0.4) {
    frequencyDescription = "every other week";
  } else {
    frequencyDescription = "monthly";
  }
  
  description += `, scheduled ${frequencyDescription}`;
  
  return description;
}
