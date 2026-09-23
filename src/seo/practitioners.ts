/**
 * Individual practitioner pages.
 *
 * Practice name searches are already the strongest thing Predictiv ranks for
 * ("colinton surgery newlands", "dr marike ransome"), but until now those
 * searches landed on a suburb page that mentions the practice once. A page per
 * practice turns each of those into a page that is actually about the thing
 * being searched for, and roughly doubles the number of indexable URLs.
 *
 * Shared by the React page and the Vite prerender plugin, so a crawler with no
 * JavaScript sees the same name, suburb, phone and description as a browser.
 */
import { escapeHtml } from './blog-prerender';
import {
  hasPublicRating,
  isSafeSlug,
  isUnclaimedListing,
  listingDisplayName,
  practitionerPath,
  practitionerSlug,
  slugifyName,
  UNCLAIMED_NOTICE,
  type Listing,
} from './listings';

export { isSafeSlug, practitionerPath, practitionerSlug };
import { CITY, SITE_NAME, SITE_URL, findProfession, PROFESSIONS, type RouteSeo } from './site';

const esc = escapeHtml;

/** The public profession label, falling back to whatever the database stores. */
export function professionLabel(l: Listing): string {
  const p = PROFESSIONS.find((x) => x.db === l.profession);
  return p ? p.singular : l.profession;
}

function professionSlugFor(l: Listing): string | null {
  return PROFESSIONS.find((x) => x.db === l.profession)?.slug ?? null;
}

export function practitionerTitle(l: Listing): string {
  const where = l.suburb ? `${l.suburb}, ${CITY}` : CITY;
  return `${listingDisplayName(l)} | ${professionLabel(l)} in ${where} | ${SITE_NAME}`;
}

export function practitionerDescription(l: Listing): string {
  const name = listingDisplayName(l);
  const where = l.suburb ? `${l.suburb}, ${CITY}` : CITY;
  const role = professionLabel(l).toLowerCase();
  const base = `${name} is a ${role} practising in ${where}.`;
  const bio = (l.bio ?? '').replace(/\s+/g, ' ').trim();
  const tail = bio
    ? ` ${bio}`
    : ' See contact details, location and how to get in touch, or find other practitioners nearby on Predictiv.';
  return `${base}${tail}`.slice(0, 300);
}

export function practitionerRoute(l: Listing): RouteSeo | null {
  const path = practitionerPath(l);
  if (!path) return null;
  const name = listingDisplayName(l);
  const where = l.suburb ? `${l.suburb}, ${CITY}` : CITY;
  return {
    path,
    title: practitionerTitle(l),
    description: practitionerDescription(l),
    h1: name,
    intro: `${professionLabel(l)} in ${where}.`,
    priority: 0.6,
    changefreq: 'monthly',
  };
}

/** Crawler visible body. Mirrors what the React page renders. */
export function practitionerFallbackHtml(l: Listing): string {
  const name = listingDisplayName(l);
  const professionSlug = professionSlugFor(l);
  const parts: string[] = [];

  parts.push(`<p>${esc(professionLabel(l))}${l.suburb ? ` in ${esc(l.suburb)}, ${esc(CITY)}` : ''}.</p>`);
  if (l.name && l.practice_name && l.name !== l.practice_name) {
    parts.push(`<p>Practitioner: ${esc(l.name)}</p>`);
  }
  if (l.bio) parts.push(`<p>${esc(l.bio)}</p>`);
  if (l.location) parts.push(`<p>Address: ${esc(l.location)}</p>`);
  if (l.contact_number) parts.push(`<p>Phone: ${esc(l.contact_number)}</p>`);
  if (hasPublicRating(l)) {
    parts.push(`<p>Google rating: ${esc(String(l.rating))} from ${esc(String(l.review_count))} reviews</p>`);
  }
  if (l.calendly_url) {
    parts.push(
      `<p><a href="${esc(l.calendly_url)}" rel="noopener nofollow">Visit practice website</a></p>`,
    );
  }
  if (isUnclaimedListing(l)) parts.push(`<p>${esc(UNCLAIMED_NOTICE)}</p>`);
  if (professionSlug) {
    const suburbSlug = l.suburb ? slugifyName(l.suburb) : null;
    const backPath = suburbSlug
      ? `/practitioners/${professionSlug}/${suburbSlug}`
      : `/practitioners/${professionSlug}`;
    const label = l.suburb
      ? `More ${professionLabel(l).toLowerCase()}s in ${l.suburb}`
      : `More ${professionLabel(l).toLowerCase()}s`;
    parts.push(`<p><a href="${esc(backPath)}">${esc(label)}</a></p>`);
  }
  parts.push(`<p><a href="/practitioners">Find a practitioner in ${esc(CITY)}</a></p>`);

  return `<h1>${esc(name)}</h1>\n${parts.join('\n')}`;
}

export function practitionerJsonLd(l: Listing, pagePath: string) {
  const isGp = l.profession === 'General Practitioner';
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isGp ? 'MedicalClinic' : 'MedicalBusiness',
    '@id': `${SITE_URL}${pagePath}`,
    name: listingDisplayName(l),
    address: {
      '@type': 'PostalAddress',
      addressLocality: l.suburb || undefined,
      addressRegion: 'Western Cape',
      addressCountry: 'ZA',
      streetAddress: l.location || undefined,
    },
    areaServed: l.suburb ? `${l.suburb}, ${CITY}` : CITY,
  };
  if (l.calendly_url) node.url = l.calendly_url;
  if (l.contact_number) node.telephone = l.contact_number;
  if (l.bio) node.description = l.bio;
  if (l.latitude != null && l.longitude != null) {
    node.geo = { '@type': 'GeoCoordinates', latitude: l.latitude, longitude: l.longitude };
  }
  if (hasPublicRating(l)) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: l.rating,
      reviewCount: l.review_count,
    };
  }
  return node;
}

export function practitionerCrumbs(l: Listing): { name: string; path: string }[] {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Find a practitioner', path: '/practitioners' },
  ];
  const professionSlug = professionSlugFor(l);
  if (professionSlug) {
    const p = findProfession(professionSlug);
    if (p) crumbs.push({ name: p.plural, path: `/practitioners/${p.slug}` });
    if (p && l.suburb) {
      crumbs.push({
        name: `${p.plural} in ${l.suburb}`,
        path: `/practitioners/${p.slug}/${slugifyName(l.suburb)}`,
      });
    }
  }
  const path = practitionerPath(l);
  if (path) crumbs.push({ name: listingDisplayName(l), path });
  return crumbs;
}

/**
 * Guardrail: a prerendered profile must carry the practice name, not an empty
 * JS shell. Throwing here fails the build loudly rather than shipping a page
 * Google will read as blank.
 */
export function assertPrerenderedPractitionerHtml(html: string, l: Listing, pagePath: string): void {
  const name = listingDisplayName(l);
  if (!html.includes(esc(name))) {
    throw new Error(`[seo] ${pagePath} is missing the practice name "${name}" in its prerendered HTML`);
  }
  if (!/<h1[^>]*>/i.test(html)) {
    throw new Error(`[seo] ${pagePath} has no h1 in its prerendered HTML`);
  }
}
