// deno-lint-ignore-file no-explicit-any
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CURRENT_CONSENT_VERSION = '2026-05-v1';
const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

interface AnalyzeRequest {
  message: string;
  consent_version: string;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validate(input: any): { ok: true; value: AnalyzeRequest } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'invalid_body' };
  const { message, consent_version } = input;
  if (typeof message !== 'string') return { ok: false, error: 'message_required' };
  const trimmed = message.trim();
  if (trimmed.length < 4) return { ok: false, error: 'message_too_short' };
  if (trimmed.length > 5000) return { ok: false, error: 'message_too_long' };
  if (typeof consent_version !== 'string') return { ok: false, error: 'consent_required' };
  return { ok: true, value: { message: trimmed, consent_version } };
}

// Light identifier stripping before sending to LLM. We don't promise full PII
// redaction (the consent notice tells the user not to include identifiers),
// but we remove the most common formats users accidentally paste.
function stripIdentifiers(text: string): string {
  return text
    // SA ID numbers (13 digits, optional spaces)
    .replace(/\b\d{6}\s?\d{4}\s?\d{3}\b/g, '[ID]')
    // Email addresses
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]')
    // Phone numbers (SA-ish: 10 digits, +27, with separators)
    .replace(/(\+?27|0)\s?\d{2}\s?\d{3}\s?\d{4}\b/g, '[PHONE]')
    // Medical aid / generic 10+ digit numeric strings
    .replace(/\b\d{10,}\b/g, '[NUM]');
}

const SYSTEM_PROMPT = `You are a directional triage assistant for South African users. You DO NOT diagnose or treat. Given a free-text health concern, you extract structured information and suggest which type of medical specialist they should consider seeing.

Hard rules:
- Output ONLY via the provided tool. Never produce free-form text.
- Currency is South African Rand (ZAR). Price ranges should reflect typical SA private specialist consultation fees.
- Suggested specialty must be a real medical specialty (e.g. "General Practitioner", "Dermatologist", "Cardiologist", "Orthopaedic Surgeon", "Physiotherapist", "Psychologist", "ENT Specialist", "Gynaecologist").
- If the description suggests any red-flag emergency (chest pain with exertion, stroke signs, severe bleeding, suicidal ideation, anaphylaxis, etc.), set severity_hint to "critical" and list red_flags.
- next_steps must be loose, plain-language bullets — never dosages, never prescriptions.
- concern_summary: one or two sentences in the user's own framing, sanitised.`;

const TOOL = {
  type: 'function',
  function: {
    name: 'return_directional_analysis',
    description: 'Return a structured directional analysis of the user health concern.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        concern_summary: { type: 'string' },
        symptoms: { type: 'array', items: { type: 'string' } },
        duration: { type: ['string', 'null'] },
        body_region: { type: ['string', 'null'] },
        severity_hint: {
          type: 'string',
          enum: ['mild', 'moderate', 'severe', 'critical'],
        },
        red_flags: { type: 'array', items: { type: 'string' } },
        suggested_specialty: { type: 'string' },
        price_range_zar: {
          type: 'object',
          additionalProperties: false,
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
          required: ['min', 'max'],
        },
        next_steps: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'number' },
      },
      required: [
        'concern_summary',
        'symptoms',
        'duration',
        'body_region',
        'severity_hint',
        'red_flags',
        'suggested_specialty',
        'price_range_zar',
        'next_steps',
        'confidence',
      ],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const parsed = validate(body);
  if (!parsed.ok) return json(400, { error: parsed.error });
  const { message, consent_version } = parsed.value;

  if (consent_version !== CURRENT_CONSENT_VERSION) {
    return json(403, { error: 'consent_required', current_version: CURRENT_CONSENT_VERSION });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY missing');
    return json(500, { error: 'ai_not_configured' });
  }

  const sanitised = stripIdentifiers(message);

  let aiResp: Response;
  try {
    aiResp = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: sanitised },
        ],
        tools: [TOOL],
        tool_choice: { type: 'function', function: { name: 'return_directional_analysis' } },
      }),
    });
  } catch (err) {
    console.error('gateway fetch failed', err);
    return json(502, { error: 'ai_unreachable' });
  }

  if (aiResp.status === 429) return json(429, { error: 'rate_limited' });
  if (aiResp.status === 402) return json(402, { error: 'credits_exhausted' });
  if (!aiResp.ok) {
    const text = await aiResp.text().catch(() => '');
    console.error('gateway error', aiResp.status, text);
    return json(502, { error: 'ai_error' });
  }

  let payload: any;
  try {
    payload = await aiResp.json();
  } catch {
    return json(502, { error: 'ai_invalid_json' });
  }

  const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0];
  const argsStr = toolCall?.function?.arguments;
  if (!argsStr) {
    console.error('no tool call in response', JSON.stringify(payload).slice(0, 500));
    return json(502, { error: 'ai_no_structured_output' });
  }

  let analysis: any;
  try {
    analysis = JSON.parse(argsStr);
  } catch {
    return json(502, { error: 'ai_invalid_tool_args' });
  }

  return json(200, { analysis });
});
