import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SymptomInput {
  symptom_text: string
  body_region?: string
  duration_hours?: number
  severity_score?: number
}

interface SeverityRule {
  id: string
  symptom_keyword: string
  body_region: string | null
  base_severity: 'mild' | 'moderate' | 'severe' | 'critical'
  duration_hours_threshold: number | null
  escalation_severity: 'mild' | 'moderate' | 'severe' | 'critical' | null
  red_flag_triggers: string[]
  is_active: boolean
}

interface EvaluationResult {
  calculated_severity: 'mild' | 'moderate' | 'severe' | 'critical'
  matched_rule_id: string | null
  red_flags: string[]
  escalated: boolean
  reasoning: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[symptom-severity-evaluator] Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[symptom-severity-evaluator] Auth error:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[symptom-severity-evaluator] Processing request for user: ${user.id}`)

    // Parse and validate request body
    const body = await req.json()
    const { symptoms } = body as { symptoms: SymptomInput[] }

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      console.error('[symptom-severity-evaluator] Invalid symptoms input')
      return new Response(
        JSON.stringify({ error: 'Invalid input: symptoms array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate each symptom
    for (const symptom of symptoms) {
      if (!symptom.symptom_text || typeof symptom.symptom_text !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid input: symptom_text is required for each symptom' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch active severity rules
    const { data: rules, error: rulesError } = await supabase
      .from('symptom_severity_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError) {
      console.error('[symptom-severity-evaluator] Error fetching rules:', rulesError.message)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch severity rules' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[symptom-severity-evaluator] Loaded ${rules?.length || 0} severity rules`)

    // Evaluate each symptom
    const results: EvaluationResult[] = symptoms.map((symptom) => {
      return evaluateSymptom(symptom, rules as SeverityRule[])
    })

    // Calculate overall severity (worst case)
    const overallSeverity = calculateOverallSeverity(results)
    const allRedFlags = results.flatMap(r => r.red_flags)

    console.log(`[symptom-severity-evaluator] Evaluation complete. Overall severity: ${overallSeverity}`)

    return new Response(
      JSON.stringify({
        success: true,
        results,
        overall_severity: overallSeverity,
        red_flags: [...new Set(allRedFlags)],
        evaluated_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[symptom-severity-evaluator] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function evaluateSymptom(symptom: SymptomInput, rules: SeverityRule[]): EvaluationResult {
  const symptomLower = symptom.symptom_text.toLowerCase()
  const bodyRegion = symptom.body_region?.toLowerCase()
  
  let matchedRule: SeverityRule | null = null
  let bestMatchScore = 0

  // Find best matching rule
  for (const rule of rules) {
    const keyword = rule.symptom_keyword.toLowerCase()
    
    if (symptomLower.includes(keyword)) {
      let score = keyword.length // Longer matches are more specific

      // Bonus for body region match
      if (rule.body_region && bodyRegion && bodyRegion.includes(rule.body_region.toLowerCase())) {
        score += 10
      }

      if (score > bestMatchScore) {
        bestMatchScore = score
        matchedRule = rule
      }
    }
  }

  // If no rule matched, return default mild severity
  if (!matchedRule) {
    return {
      calculated_severity: symptom.severity_score && symptom.severity_score > 5 ? 'moderate' : 'mild',
      matched_rule_id: null,
      red_flags: [],
      escalated: false,
      reasoning: 'No specific rule matched. Using default severity based on reported score.'
    }
  }

  // Determine if escalation applies
  let calculatedSeverity = matchedRule.base_severity
  let escalated = false

  if (matchedRule.duration_hours_threshold && symptom.duration_hours) {
    if (symptom.duration_hours >= matchedRule.duration_hours_threshold && matchedRule.escalation_severity) {
      calculatedSeverity = matchedRule.escalation_severity
      escalated = true
    }
  }

  // Check for red flag triggers
  const redFlags: string[] = []
  if (matchedRule.red_flag_triggers && matchedRule.red_flag_triggers.length > 0) {
    for (const trigger of matchedRule.red_flag_triggers) {
      if (symptomLower.includes(trigger.toLowerCase())) {
        redFlags.push(trigger)
      }
    }
  }

  // If red flags present, ensure at least severe
  if (redFlags.length > 0 && severityRank(calculatedSeverity) < severityRank('severe')) {
    calculatedSeverity = 'severe'
    escalated = true
  }

  return {
    calculated_severity: calculatedSeverity,
    matched_rule_id: matchedRule.id,
    red_flags: redFlags,
    escalated,
    reasoning: `Matched rule for "${matchedRule.symptom_keyword}"${escalated ? ' (escalated due to duration/red flags)' : ''}`
  }
}

function severityRank(severity: 'mild' | 'moderate' | 'severe' | 'critical'): number {
  const ranks = { mild: 1, moderate: 2, severe: 3, critical: 4 }
  return ranks[severity] || 1
}

function calculateOverallSeverity(results: EvaluationResult[]): 'mild' | 'moderate' | 'severe' | 'critical' {
  if (results.length === 0) return 'mild'
  
  let maxRank = 1
  for (const result of results) {
    const rank = severityRank(result.calculated_severity)
    if (rank > maxRank) maxRank = rank
  }

  const severities: ('mild' | 'moderate' | 'severe' | 'critical')[] = ['mild', 'moderate', 'severe', 'critical']
  return severities[maxRank - 1]
}
