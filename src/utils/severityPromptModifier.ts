import type { SeverityEvaluationResponse } from '@/services/symptom-severity-service';

export interface SeverityPromptModifier {
  systemPromptAddition: string;
  responseStyle: 'reassuring' | 'consultative' | 'urgent' | 'emergency';
  disableSmallTalk: boolean;
  forceStructuredResponse: boolean;
}

/**
 * Generate prompt modifiers based on severity evaluation
 */
export function getSeverityPromptModifier(
  evaluation: SeverityEvaluationResponse | null
): SeverityPromptModifier {
  if (!evaluation) {
    return {
      systemPromptAddition: '',
      responseStyle: 'reassuring',
      disableSmallTalk: false,
      forceStructuredResponse: false,
    };
  }

  const { overall_severity, red_flags } = evaluation;
  const hasRedFlags = red_flags.length > 0;

  switch (overall_severity) {
    case 'critical':
      return {
        systemPromptAddition: `
CRITICAL HEALTH ALERT: The user has reported symptoms that may indicate a medical emergency.
Red flags detected: ${red_flags.join(', ') || 'Critical severity symptoms'}

YOUR RESPONSE MUST:
1. First acknowledge the seriousness without causing panic
2. Clearly recommend seeking immediate medical attention
3. Provide emergency contact guidance (10177 in South Africa)
4. Do NOT engage in casual conversation or small talk
5. Keep responses direct, clear, and action-oriented
6. Do NOT attempt to diagnose - only direct to emergency care
`,
        responseStyle: 'emergency',
        disableSmallTalk: true,
        forceStructuredResponse: true,
      };

    case 'severe':
      return {
        systemPromptAddition: `
URGENT HEALTH CONCERN: The user has reported symptoms requiring prompt medical attention.
${hasRedFlags ? `Warning signs: ${red_flags.join(', ')}` : ''}

YOUR RESPONSE MUST:
1. Take the symptoms seriously
2. Recommend booking a medical appointment soon (today if possible)
3. Explain why timely consultation is important
4. Provide relevant specialist recommendations
5. Avoid minimizing concerns or excessive reassurance
`,
        responseStyle: 'urgent',
        disableSmallTalk: true,
        forceStructuredResponse: true,
      };

    case 'moderate':
      return {
        systemPromptAddition: `
MODERATE HEALTH CONCERN: The user has reported symptoms that warrant professional consultation.
${hasRedFlags ? `Monitor for: ${red_flags.join(', ')}` : ''}

YOUR RESPONSE SHOULD:
1. Acknowledge their concerns
2. Recommend consulting a healthcare provider
3. Suggest appropriate specialist types
4. Mention when to seek urgent care if symptoms worsen
`,
        responseStyle: 'consultative',
        disableSmallTalk: false,
        forceStructuredResponse: false,
      };

    case 'mild':
    default:
      return {
        systemPromptAddition: hasRedFlags
          ? `
Note: While overall severity is mild, monitor for these potential warning signs: ${red_flags.join(', ')}.
If any of these develop or worsen, recommend prompt medical evaluation.
`
          : '',
        responseStyle: 'reassuring',
        disableSmallTalk: false,
        forceStructuredResponse: false,
      };
  }
}

/**
 * Build the full system prompt with severity modifications
 */
export function buildSeverityAwareSystemPrompt(
  basePrompt: string,
  evaluation: SeverityEvaluationResponse | null
): string {
  const modifier = getSeverityPromptModifier(evaluation);
  
  if (!modifier.systemPromptAddition) {
    return basePrompt;
  }

  return `${basePrompt}

${modifier.systemPromptAddition}`;
}
