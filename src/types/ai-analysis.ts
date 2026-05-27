export interface AiAnalysis {
  concern_summary: string;
  symptoms: string[];
  duration: string | null;
  body_region: string | null;
  severity_hint: 'mild' | 'moderate' | 'severe' | 'critical';
  red_flags: string[];
  suggested_specialty: string;
  price_range_zar: { min: number; max: number };
  next_steps: string[];
  confidence: number;
}
