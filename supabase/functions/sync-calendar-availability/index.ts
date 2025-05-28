
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { practitionerId } = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get calendar integrations for the practitioner
    const { data: integrations, error: integrationsError } = await supabaseClient
      .from('calendar_integrations')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('sync_enabled', true)

    if (integrationsError) throw integrationsError

    const allAvailabilitySlots = []

    // Process each integration
    for (const integration of integrations || []) {
      let events: CalendarEvent[] = []

      try {
        // Sync based on integration type
        switch (integration.integration_type) {
          case 'google_calendar':
            events = await syncGoogleCalendar(integration)
            break
          case 'bookem':
            events = await syncBookem(integration)
            break
          case 'setmore':
            events = await syncSetmore(integration)
            break
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
        }))

        allAvailabilitySlots.push(...slots)

      } catch (error) {
        console.error(`Failed to sync ${integration.integration_type}:`, error)
      }
    }

    // Clear existing slots for this practitioner (for today onwards)
    const today = new Date().toISOString()
    await supabaseClient
      .from('availability_slots')
      .delete()
      .eq('practitioner_id', practitionerId)
      .gte('start_time', today)

    // Insert new availability slots
    if (allAvailabilitySlots.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('availability_slots')
        .insert(allAvailabilitySlots)

      if (insertError) throw insertError
    }

    // Update last sync time for all integrations
    await supabaseClient
      .from('calendar_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('practitioner_id', practitionerId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_slots: allAvailabilitySlots.length,
        message: `Synced ${allAvailabilitySlots.length} calendar events`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncGoogleCalendar(integration: any): Promise<CalendarEvent[]> {
  const apiKey = integration.api_credentials.apiKey
  const calendarId = integration.calendar_id || 'primary'
  
  const now = new Date()
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
    `key=${apiKey}&` +
    `timeMin=${now.toISOString()}&` +
    `timeMax=${oneMonthLater.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`

  const response = await fetch(url)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Calendar API error: ${data.error?.message || 'Unknown error'}`)
  }

  return data.items || []
}

async function syncBookem(integration: any): Promise<CalendarEvent[]> {
  // Placeholder for Bookem API integration
  // You would implement the actual Bookem API calls here
  console.log('Syncing Bookem calendar:', integration.id)
  return []
}

async function syncSetmore(integration: any): Promise<CalendarEvent[]> {
  // Placeholder for Setmore API integration
  // You would implement the actual Setmore API calls here
  console.log('Syncing Setmore calendar:', integration.id)
  return []
}
