import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  CONSENT_STORAGE_KEY,
  CURRENT_CONSENT_VERSION,
  type StoredConsent,
} from '@/config/popia';

/**
 * Tracks POPIA consent for the current visitor.
 *
 * Consent is stored in localStorage (anonymous launch mode) and, when an
 * authenticated session exists, mirrored to the `popia_consents` table so we
 * have an auditable server-side record.
 */
export function useConsent() {
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as StoredConsent;
      return parsed.version === CURRENT_CONSENT_VERSION;
    } catch {
      return false;
    }
  });

  // If a user later signs in and already has a server-side consent row for
  // the current version, honour it (e.g. signed in on another device).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess?.session?.user?.id;
        if (!userId) return;
        const { data } = await supabase
          .from('popia_consents')
          .select('id')
          .eq('user_id', userId)
          .eq('consent_version', CURRENT_CONSENT_VERSION)
          .maybeSingle();
        if (!cancelled && data) setHasConsent(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grantConsent = useCallback(async () => {
    const record: StoredConsent = {
      version: CURRENT_CONSENT_VERSION,
      grantedAt: new Date().toISOString(),
      acknowledgments: { processing: true, notMedicalAdvice: true },
    };
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* storage disabled — still allow in-memory consent */
    }
    setHasConsent(true);

    // Best-effort server mirror for authenticated users.
    try {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess?.session?.user?.id;
      if (userId) {
        await supabase.from('popia_consents').insert({
          user_id: userId,
          consent_version: CURRENT_CONSENT_VERSION,
          user_agent:
            typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      }
    } catch {
      /* server mirror is best-effort */
    }
  }, []);

  const revokeConsent = useCallback(() => {
    try {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setHasConsent(false);
  }, []);

  return { hasConsent, grantConsent, revokeConsent, version: CURRENT_CONSENT_VERSION };
}
