import { supabase } from '@/integrations/supabase/client';

const SID_KEY = 'predictiv_sid';

export type DirectoryEventType =
  | 'search'
  | 'problem_described'
  | 'results_shown'
  | 'profile_view'
  | 'outbound_click';

export type DirectoryLinkType = 'website' | 'phone' | 'booking';

export interface TrackPayload {
  event_type: DirectoryEventType;
  query?: string | null;
  profession?: string | null;
  suburb?: string | null;
  result_count?: number | null;
  professional_id?: string | null;
  link_type?: DirectoryLinkType | null;
}

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SID_KEY);
    if (existing) return existing;
    const fresh = randomId();
    window.localStorage.setItem(SID_KEY, fresh);
    return fresh;
  } catch {
    return randomId();
  }
}

function deviceKind(): 'mobile' | 'desktop' {
  try {
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  } catch {
    return 'desktop';
  }
}

/**
 * Fires a single directory_events insert. Never throws, never blocks the UI.
 */
export function track(payload: TrackPayload): void {
  try {
    if (typeof window === 'undefined') return;

    const row = {
      session_id: getSessionId(),
      event_type: payload.event_type,
      query: payload.query ?? null,
      profession: payload.profession ?? null,
      suburb: payload.suburb ?? null,
      result_count: payload.result_count ?? null,
      professional_id: payload.professional_id ?? null,
      link_type: payload.link_type ?? null,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      device: deviceKind(),
    };

    void supabase
      .from('directory_events')
      .insert(row)
      .then(
        () => undefined,
        () => undefined
      );
  } catch {
    /* analytics must never break the app */
  }
}
