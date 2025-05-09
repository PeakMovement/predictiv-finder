import { ServiceCategory } from "../types";
import { ServiceMatchRecord } from "./serviceMatchTypes";

/**
 * Creates an empty record for service matches with all possible categories
 */
export function createEmptyServiceRecord(serviceCategories: ServiceCategory[]): ServiceMatchRecord {
  return serviceCategories.reduce((acc, category) => {
    acc[category] = { score: 0, factors: [] };
    return acc;
  }, {} as ServiceMatchRecord);
}

/**
 * Adds or updates a service match with score and reasoning
 */
export function addServiceMatch(
  matches: ServiceMatchRecord,
  service: ServiceCategory,
  score: number,
  reason: string,
  condition?: string
): void {
  if (matches[service]) {
    // Use the highest score from multiple matches
    matches[service].score = Math.max(matches[service].score, score);
    matches[service].factors.push(reason);
    
    // Keep track of the highest priority condition linked to this service
    if (condition && (!matches[service].primaryCondition || 
        condition.length > matches[service].primaryCondition.length)) {
      matches[service].primaryCondition = condition;
    }
  }
}
