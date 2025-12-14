import { supabase } from "@/integrations/supabase/client";

export interface SymptomInput {
  symptom_text: string;
  body_region?: string;
  duration_hours?: number;
  severity_score?: number;
}

export interface EvaluationResult {
  calculated_severity: 'mild' | 'moderate' | 'severe' | 'critical';
  matched_rule_id: string | null;
  red_flags: string[];
  escalated: boolean;
  reasoning: string;
}

export interface SeverityEvaluationResponse {
  success: boolean;
  results: EvaluationResult[];
  overall_severity: 'mild' | 'moderate' | 'severe' | 'critical';
  red_flags: string[];
  evaluated_at: string;
}

export interface SeverityEvaluationError {
  error: string;
  code?: string;
}

/**
 * Evaluates symptom severity using the symptom-severity-evaluator edge function.
 * Requires authenticated user session.
 */
export async function evaluateSymptomSeverity(
  symptoms: SymptomInput[]
): Promise<SeverityEvaluationResponse> {
  // Validate input
  if (!symptoms || symptoms.length === 0) {
    throw new Error('At least one symptom is required');
  }

  for (const symptom of symptoms) {
    if (!symptom.symptom_text || symptom.symptom_text.trim().length === 0) {
      throw new Error('Each symptom must have symptom_text');
    }
  }

  console.log('[symptom-severity-service] Evaluating symptoms:', symptoms.length);

  const { data, error } = await supabase.functions.invoke('symptom-severity-evaluator', {
    body: { symptoms }
  });

  if (error) {
    console.error('[symptom-severity-service] Edge function error:', error);
    throw new Error(error.message || 'Failed to evaluate symptom severity');
  }

  if (!data?.success) {
    const errorMessage = (data as SeverityEvaluationError)?.error || 'Unknown error';
    console.error('[symptom-severity-service] Evaluation failed:', errorMessage);
    throw new Error(errorMessage);
  }

  console.log('[symptom-severity-service] Evaluation complete:', data.overall_severity);
  
  return data as SeverityEvaluationResponse;
}

/**
 * Helper to get severity display info
 */
export function getSeverityDisplayInfo(severity: 'mild' | 'moderate' | 'severe' | 'critical') {
  const info = {
    mild: {
      label: 'Mild',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'Monitor symptoms, self-care recommended'
    },
    moderate: {
      label: 'Moderate',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      description: 'Consider consulting a healthcare provider'
    },
    severe: {
      label: 'Severe',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      description: 'Seek medical attention soon'
    },
    critical: {
      label: 'Critical',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'Seek immediate medical attention'
    }
  };

  return info[severity] || info.mild;
}
