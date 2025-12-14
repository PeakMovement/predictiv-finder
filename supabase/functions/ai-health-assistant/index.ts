import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Severity evaluation data passed from client
interface SeverityData {
  overall_severity: 'mild' | 'moderate' | 'severe' | 'critical';
  red_flags: string[];
  evaluated_at: string;
}

interface RequestBody {
  message: string;
  context?: Record<string, unknown>;
  severity?: SeverityData;
}

function validateInput(body: unknown): { valid: boolean; data?: RequestBody; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }
  
  const { message, context, severity } = body as Record<string, unknown>;
  
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  
  if (message.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (message.length > 5000) {
    return { valid: false, error: 'Message exceeds maximum length of 5000 characters' };
  }
  
  if (context !== undefined && (typeof context !== 'object' || context === null)) {
    return { valid: false, error: 'Context must be an object if provided' };
  }

  // Validate severity if provided
  if (severity !== undefined) {
    if (typeof severity !== 'object' || severity === null) {
      return { valid: false, error: 'Severity must be an object if provided' };
    }
    const sev = severity as Record<string, unknown>;
    const validSeverities = ['mild', 'moderate', 'severe', 'critical'];
    if (!validSeverities.includes(sev.overall_severity as string)) {
      return { valid: false, error: 'Invalid severity level' };
    }
  }
  
  return { 
    valid: true, 
    data: { 
      message: message.trim(),
      context: context as Record<string, unknown> | undefined,
      severity: severity as SeverityData | undefined
    } 
  };
}

function getSeveritySystemPrompt(severity?: SeverityData): string {
  if (!severity) return '';

  const { overall_severity, red_flags } = severity;
  const hasRedFlags = red_flags && red_flags.length > 0;

  switch (overall_severity) {
    case 'critical':
      return `
CRITICAL HEALTH ALERT: This user has reported symptoms indicating a potential medical emergency.
${hasRedFlags ? `Red flags detected: ${red_flags.join(', ')}` : 'Critical severity symptoms reported.'}

YOUR RESPONSE MUST:
1. Acknowledge the seriousness without causing panic
2. IMMEDIATELY recommend seeking emergency medical attention
3. Provide emergency contact: 10177 (South Africa emergency services)
4. Do NOT engage in casual conversation
5. Keep responses direct and action-oriented
6. Do NOT attempt to diagnose`;

    case 'severe':
      return `
URGENT HEALTH CONCERN: User symptoms require prompt medical attention.
${hasRedFlags ? `Warning signs: ${red_flags.join(', ')}` : ''}

YOUR RESPONSE MUST:
1. Take symptoms seriously
2. Recommend booking a medical appointment soon (today if possible)
3. Explain why timely consultation is important
4. Avoid minimizing concerns`;

    case 'moderate':
      return `
MODERATE HEALTH CONCERN: User symptoms warrant professional consultation.
${hasRedFlags ? `Monitor for: ${red_flags.join(', ')}` : ''}

Recommend consulting a healthcare provider and mention when to seek urgent care if symptoms worsen.`;

    case 'mild':
      return hasRedFlags
        ? `Note: While overall severity is mild, monitor for: ${red_flags.join(', ')}. If these develop or worsen, recommend medical evaluation.`
        : '';

    default:
      return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = validateInput(body);
    if (!validation.valid || !validation.data) {
      console.log('[ai-health-assistant] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, context, severity } = validation.data;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ai-health-assistant] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('[ai-health-assistant] Authentication failed:', authError?.message ?? 'No user');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[ai-health-assistant] Processing request for user:', user.id, 
      'message_length:', message.length,
      'severity:', severity?.overall_severity ?? 'not_evaluated');

    // Build severity-aware response
    const severityPrompt = getSeveritySystemPrompt(severity);
    const isEmergency = severity?.overall_severity === 'critical';
    const isSevere = severity?.overall_severity === 'severe';

    let responseMessage: string;
    let recommendations: string[];

    if (isEmergency) {
      responseMessage = `⚠️ CRITICAL HEALTH ALERT: Based on your reported symptoms, you may need immediate medical attention. Please call emergency services (10177) or go to your nearest emergency room immediately. Do not delay seeking care.`;
      recommendations = [
        "Call emergency services: 10177",
        "Go to nearest emergency room",
        "Do not drive yourself if possible",
        "Bring a list of your symptoms and medications"
      ];
    } else if (isSevere) {
      responseMessage = `Your symptoms require prompt medical attention. I strongly recommend booking an appointment with a healthcare provider today. ${severity?.red_flags?.length ? `Watch for these warning signs: ${severity.red_flags.join(', ')}.` : ''} If symptoms worsen, seek emergency care.`;
      recommendations = [
        "Book a same-day appointment if possible",
        "Consider urgent care if regular doctor unavailable",
        "Monitor symptoms closely",
        "Seek emergency care if symptoms worsen"
      ];
    } else {
      responseMessage = `Based on your query, I recommend consulting with healthcare professionals for proper evaluation. ${severityPrompt ? 'I\'ve noted your symptom assessment in my recommendations.' : 'Consider describing your symptoms in detail for better recommendations.'}`;
      recommendations = [
        "Consult with a healthcare professional",
        "Consider lifestyle modifications",
        "Regular health monitoring"
      ];
    }

    const response = {
      message: responseMessage,
      recommendations,
      severity_context: severity ? {
        level: severity.overall_severity,
        red_flags: severity.red_flags,
        is_emergency: isEmergency,
        evaluated_at: severity.evaluated_at
      } : null,
      timestamp: new Date().toISOString(),
      userId: user.id
    };

    // Log the interaction with severity context
    const { error: insertError } = await supabaseClient
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        user_message: message,
        ai_response: response.message,
        context: {
          ...context,
          severity: severity ?? null
        }
      });

    if (insertError) {
      console.error('[ai-health-assistant] Failed to log interaction:', insertError.message);
    }

    console.log('[ai-health-assistant] Request completed for user:', user.id, 
      'severity_handled:', severity?.overall_severity ?? 'none');

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ai-health-assistant] Internal error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
