
import { ServiceCategory } from "./types";

export interface SymptomMapping {
  primary: ServiceCategory;
  specialties: ServiceCategory[];
  priority: number;
  secondary?: ServiceCategory[];
  keywords?: string[];
  context?: string[];
  contraindications?: ServiceCategory[];
}
