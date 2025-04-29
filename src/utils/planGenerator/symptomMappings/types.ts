
import { ServiceCategory } from "../types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  secondary?: ServiceCategory[];
  priority: number;
  keywords?: string[];
  context?: string[];
  contraindications?: ServiceCategory[];
}
