/**
 * E-E-A-T helpers for health blog posts.
 *
 * Default visible author is Justin Muller (consented display name only).
 * Do not invent credentials, titles, photos, bios, co-authors, or reviewers.
 * Person schema is used when the resolved author is a named person
 * (not the Predictiv organisation).
 */
export const DEFAULT_AUTHOR_NAME = 'Justin Muller';

export const ORG_AUTHOR_NAMES = ['predictiv', 'predictiv pty', 'predictiv pty ltd'];

/**
 * Map empty / organisation defaults to the consented person name so every
 * health post gets a Person author without inventing per-post bios.
 */
export function resolvedAuthorName(name?: string | null): string {
  const n = (name || '').trim();
  if (!n || ORG_AUTHOR_NAMES.includes(n.toLowerCase())) return DEFAULT_AUTHOR_NAME;
  return n;
}

export function isNamedPerson(name?: string | null): boolean {
  const n = (name || '').trim();
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

/** Person JSON-LD for a post author. Credentials stay empty unless CMS has a real value. */
export function blogAuthorJsonLd(name?: string | null, credential?: string | null, url?: string) {
  const display = resolvedAuthorName(name);
  if (isNamedPerson(display)) {
    return personJsonLd(display, { credential, url });
  }
  return organizationAuthorJsonLd(display, url || '');
}
