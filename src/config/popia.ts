/**
 * POPIA consent versioning.
 *
 * Bump CURRENT_CONSENT_VERSION when the privacy notice or processing scope
 * materially changes. Doing so forces every user to re-consent before the
 * directional health assistant will run.
 */
export const CURRENT_CONSENT_VERSION = '2026-05-v1';

export const CONSENT_STORAGE_KEY = 'predictiv.popia.consent';

export interface StoredConsent {
  version: string;
  grantedAt: string; // ISO timestamp
  acknowledgments: {
    processing: boolean;
    notMedicalAdvice: boolean;
  };
}
