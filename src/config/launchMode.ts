/**
 * Public Launch Mode flag.
 *
 * When `true`, booking, practitioner dashboard, and the gated portal at
 * `/join/predictiv-practitioners` redirect home. The public directory, blog,
 * about, privacy, `/join` (contact/claim), and `/assistant` stay live.
 *
 * Flip to `false` locally only after create-practitioner is admin/invite-only
 * (already the case) and moderation columns are trigger-protected.
 */
export const PUBLIC_LAUNCH_MODE = true;
