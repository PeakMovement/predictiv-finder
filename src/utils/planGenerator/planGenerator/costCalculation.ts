
import { AIHealthPlan } from "@/types";

/**
 * Calculates the total cost of all services in a plan
 */
export const calculateTotalCost = (services: AIHealthPlan['services']): number => {
  return services.reduce((total, service) => total + (service.price * service.sessions), 0);
};
