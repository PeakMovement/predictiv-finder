import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  id: string;
  summary?: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

interface RequestBody {
  practitionerId: string;
}

// Input validation
function validateInput(body: unknown): { valid: boolean; data?: RequestBody; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }
  
  const { practitionerId } = body as Record<string, unknown>;
  
  if (typeof practitionerId !== 'string') {
    return { valid: false, error: 'practitionerId must be a string' };
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(practitionerId)) {
    return { valid: false, error: 'practitionerId must be a valid UUID' };
  }
  
  return { valid: true, data: { practitionerId } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse and validate input
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
      console.log('[sync-calendar] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { practitionerId } = validation.data;
    
    // Get and validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[sync-calendar] Missing or invalid authorization header');
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

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('[sync-calendar] Authentication failed:', authError?.message ?? 'No user');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Verify user owns this practitioner profile
    if (user.id !== practitionerId) {
      console.log('[sync-calendar] Authorization failed: User', user.id, 'attempted to sync practitioner', practitionerId);
      return new Response(
        JSON.stringify({ error: 'Not authorized to sync this practitioner\'s calendar' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-calendar] Processing sync request for practitioner:', practitionerId);

    // Get calendar integrations for the practitioner (RLS will filter to only their own)
    const { data: integrations, error: integrationsError } = await supabaseClient
      .from('calendar_integrations')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('sync_enabled', true);

    if (integrationsError) {
      console.error('[sync-calendar] Failed to fetch integrations:', integrationsError.message);
      throw new Error('Failed to fetch calendar integrations');
    }

    const allAvailabilitySlots: Array<{
      practitioner_id: string;
      calendar_integration_id: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      external_event_id: string;
      event_title: string;
      sync_source: string;
    }> = [];

    // Process each integration
    for (const integration of integrations || []) {
      let events: CalendarEvent[] = [];

      try {
        // Sync based on integration type
        switch (integration.integration_type) {
          case 'google_calendar':
            events = await syncGoogleCalendar(integration);
            break;
          case 'bookem':
            events = await syncBookem(integration);
            break;
          case 'setmore':
            events = await syncSetmore(integration);
            break;
          default:
            console.log('[sync-calendar] Unknown integration type:', integration.integration_type);
        }

        // Convert events to availability slots
        const slots = events.map(event => ({
          practitioner_id: practitionerId,
          calendar_integration_id: integration.id,
          start_time: event.start.dateTime,
          end_time: event.end.dateTime,
          is_available: false, // Existing events mark unavailable times
          external_event_id: event.id,
          event_title: event.summary || 'Busy',
          sync_source: integration.integration_type
        }));

        allAvailabilitySlots.push(...slots);
        console.log('[sync-calendar] Synced', slots.length, 'events from', integration.integration_type);

      } catch (error) {
        // Log error but continue with other integrations
        console.error('[sync-calendar] Failed to sync', integration.integration_type, ':', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Clear existing slots for this practitioner (for today onwards)
    const today = new Date().toISOString();
    const { error: deleteError } = await supabaseClient
      .from('availability_slots')
      .delete()
      .eq('practitioner_id', practitionerId)
      .gte('start_time', today);

    if (deleteError) {
      console.error('[sync-calendar] Failed to clear old slots:', deleteError.message);
    }

    // Insert new availability slots
    if (allAvailabilitySlots.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('availability_slots')
        .insert(allAvailabilitySlots);

      if (insertError) {
        console.error('[sync-calendar] Failed to insert slots:', insertError.message);
        throw new Error('Failed to save availability slots');
      }
    }

    // Update last sync time for all integrations
    const { error: updateError } = await supabaseClient
      .from('calendar_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('practitioner_id', practitionerId);

    if (updateError) {
      console.error('[sync-calendar] Failed to update sync time:', updateError.message);
    }

    console.log('[sync-calendar] Sync completed. Total slots:', allAvailabilitySlots.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_slots: allAvailabilitySlots.length,
        message: `Synced ${allAvailabilitySlots.length} calendar events`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[sync-calendar] Internal error:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncGoogleCalendar(integration: { api_credentials: { apiKey?: string }; calendar_id?: string }): Promise<CalendarEvent[]> {
  const apiKey = integration.api_credentials?.apiKey;
  if (!apiKey) {
    throw new Error('Missing Google Calendar API key');
  }
  
  const calendarId = integration.calendar_id || 'primary';
  
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
    `key=${encodeURIComponent(apiKey)}&` +
    `timeMin=${now.toISOString()}&` +
    `timeMax=${oneMonthLater.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`;

  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.items || [];
}

async function syncBookem(_integration: unknown): Promise<CalendarEvent[]> {
  // Placeholder for Bookem API integration
  console.log('[sync-calendar] Bookem sync not yet implemented');
  return [];
}

async function syncSetmore(_integration: unknown): Promise<CalendarEvent[]> {
  // Placeholder for Setmore API integration
  console.log('[sync-calendar] Setmore sync not yet implemented');
  return [];
}
