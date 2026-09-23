import { supabase } from '@/integrations/supabase/client';

/**
 * Lightweight first party analytics for the public directory.
 *
 * Everything here is anonymous. We store two random ids and nothing that
 * identifies a person: no name, no email, no IP address. The visitor id is
 * long lived so returning people can be counted, the visit id resets when the
 * tab closes so visits can be counted separately.
 *
 * Every write is fire and forget and every function swallows its own errors.
 * Analytics must never be able to break a page.
 */

const VISITOR_KEY = 'predictiv_vid';
const VISIT_KEY = 'predictiv_visit';
const SOURCE_KEY = 'predictiv_src';
const INTERNAL_KEY = 'predictiv_internal';

// Kept for backwards compatibility with rows written before visit ids existed.
const LEGACY_SID_KEY = 'predictiv_sid';

export type DirectoryEventType =
  | 'page_view'
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
  page_path?: string | null;
}

interface VisitSource {
  source: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStore(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStore(store: Storage | undefined, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    /* private mode, blocked cookies, quota: all fine, we just lose continuity */
  }
}

/** Long lived id for this browser. Counts people rather than visits. */
export function getVisitorId(): string {
  const existing =
    readStore(window.localStorage, VISITOR_KEY) ?? readStore(window.localStorage, LEGACY_SID_KEY);
  if (existing) {
    if (!readStore(window.localStorage, VISITOR_KEY)) {
      writeStore(window.localStorage, VISITOR_KEY, existing);
    }
    return existing;
  }
  const fresh = randomId();
  writeStore(window.localStorage, VISITOR_KEY, fresh);
  return fresh;
}

/** Resets when the tab closes. Counts visits rather than people. */
export function getVisitId(): string {
  const existing = readStore(window.sessionStorage, VISIT_KEY);
  if (existing) return existing;
  const fresh = randomId();
  writeStore(window.sessionStorage, VISIT_KEY, fresh);
  return fresh;
}

const SEARCH_ENGINES = /google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\.|brave\.|baidu\.|yandex\./i;
const SOCIAL = /facebook\.|instagram\.|linkedin\.|t\.co$|twitter\.|x\.com$|reddit\.|whatsapp|tiktok\./i;

function classify(referrerHost: string | null): string {
  if (!referrerHost) return 'direct';
  try {
    if (referrerHost === window.location.hostname) return 'internal';
  } catch {
    /* ignore */
  }
  if (SEARCH_ENGINES.test(referrerHost)) return 'search';
  if (SOCIAL.test(referrerHost)) return 'social';
  return 'referral';
}

/**
 * Where this visit came from, captured once on the first page of the visit and
 * then reused. Without the snapshot every page after the first would look like
 * an internal referral and the real source would be lost.
 */
export function getVisitSource(): VisitSource {
  const cached = readStore(window.sessionStorage, SOURCE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as VisitSource;
    } catch {
      /* fall through and recapture */
    }
  }

  let referrerHost: string | null = null;
  try {
    if (document.referrer) referrerHost = new URL(document.referrer).hostname;
  } catch {
    /* malformed referrer */
  }

  let params: URLSearchParams | null = null;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    /* ignore */
  }

  const utmSource = params?.get('utm_source') || null;
  const captured: VisitSource = {
    source: utmSource ? 'campaign' : classify(referrerHost),
    referrer_host: referrerHost,
    utm_source: utmSource,
    utm_medium: params?.get('utm_medium') || null,
    utm_campaign: params?.get('utm_campaign') || null,
  };

  writeStore(window.sessionStorage, SOURCE_KEY, JSON.stringify(captured));
  return captured;
}

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pagespeed|gtmetrix|python-requests|curl\/|wget|phantomjs|puppeteer|playwright|ahrefs|semrush|mj12|dotbot/i;

function isBot(): boolean {
  try {
    if ((navigator as { webdriver?: boolean }).webdriver) return true;
    return BOT_UA.test(navigator.userAgent || '');
  } catch {
    return false;
  }
}

/**
 * Lets Justin exclude his own browsing. Visit any page with ?ignore=1 to opt
 * out on this device, ?ignore=0 to opt back in.
 */
function isInternal(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get('ignore');
    if (flag === '1') writeStore(window.localStorage, INTERNAL_KEY, '1');
    if (flag === '0') window.localStorage.removeItem(INTERNAL_KEY);
  } catch {
    /* ignore */
  }
  return readStore(window.localStorage, INTERNAL_KEY) === '1';
}

function deviceKind(): 'mobile' | 'tablet' | 'desktop' {
  try {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  } catch {
    return 'desktop';
  }
}

/** Fires a single directory_events insert. Never throws, never blocks the UI. */
export function track(payload: TrackPayload): void {
  try {
    if (typeof window === 'undefined') return;
    if (isBot() || isInternal()) return;

    const src = getVisitSource();

    const row = {
      session_id: getVisitorId(),
      visit_id: getVisitId(),
      event_type: payload.event_type,
      query: payload.query ?? null,
      profession: payload.profession ?? null,
      suburb: payload.suburb ?? null,
      result_count: payload.result_count ?? null,
      professional_id: payload.professional_id ?? null,
      link_type: payload.link_type ?? null,
      page_path: payload.page_path ?? window.location.pathname,
      referrer: document.referrer || null,
      referrer_host: src.referrer_host,
      source: src.source,
      utm_source: src.utm_source,
      utm_medium: src.utm_medium,
      utm_campaign: src.utm_campaign,
      device: deviceKind(),
    };

    // The extended columns (visit_id, source, utm_*) only exist once the
    // 20260923 migration has been applied. If the backend has not caught up
    // yet, PostgREST rejects the whole row, so fall back to the original
    // column set rather than losing the event entirely.
    const legacy = {
      session_id: row.session_id,
      event_type: row.event_type,
      query: row.query,
      profession: row.profession,
      suburb: row.suburb,
      result_count: row.result_count,
      professional_id: row.professional_id,
      link_type: row.link_type,
      page_path: row.page_path,
      referrer: row.referrer,
      device: row.device,
    };

    void supabase
      .from('directory_events')
      .insert(row)
      .then(
        ({ error }) => {
          if (!error) return;
          void supabase
            .from('directory_events')
            .insert(legacy)
            .then(
              () => undefined,
              () => undefined
            );
        },
        () => undefined
      );
  } catch {
    /* analytics must never break the app */
  }
}

/** Fires one page_view per path change. */
export function trackPageView(path: string): void {
  track({ event_type: 'page_view', page_path: path });
}
