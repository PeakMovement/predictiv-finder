/**
 * E-E-A-T helpers for health blog posts.
 *
 * Do not invent clinician names or credentials. Person schema and a
 * "reviewed by" byline are emitted only when the CMS fields are filled
 * with a real named person (not the Predictiv organisation default).
 *
 * A previously named person author was withdrawn; that display name must
 * never appear in bylines or schema. Map it back to the organisation.
 */
export const ORG_AUTHOR_NAMES = ['predictiv', 'predictiv pty', 'predictiv pty ltd'];

const WITHDRAWN_AUTHOR_NAMES = ['justin muller'];

/** Public byline / JSON-LD name. Organisation default, never a withdrawn person. */
export function publicAuthorName(name?: string | null): string {
  const n = (name || '').trim();
  if (!n || ORG_AUTHOR_NAMES.includes(n.toLowerCase()) || WITHDRAWN_AUTHOR_NAMES.includes(n.toLowerCase())) {
    return 'Predictiv';
  }
  return n;
}

export function isNamedPerson(name?: string | null): boolean {
  const n = publicAuthorName(name);
  if (!n) return false;
  return !ORG_AUTHOR_NAMES.includes(n.toLowerCase());
}

export function personJsonLd(
  name: string,
  extra?: { credential?: string | null; url?: string },
) {
  const node: Record<string, unknown> = {
    '@type': 'Person',
    name: name.trim(),
  };
  if (extra?.credential?.trim()) node.jobTitle = extra.credential.trim();
  if (extra?.url) node.url = extra.url;
  return node;
}

export function organizationAuthorJsonLd(name: string, url: string) {
  return { '@type': 'Organization', name: name.trim() || 'Predictiv', url };
}
