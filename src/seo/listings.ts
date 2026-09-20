/**
 * Directory listings used both by the React directory UI and by the Vite
 * prerender plugin, so crawlers see the same practice name, suburb, phone
 * and website as the JS page.
 */
import { escapeHtml } from './blog-prerender';
import { SITE_URL } from './site';

export interface Listing {
  id: string;
  name: string;
  profession: string;
  practice_name: string | null;
  location: string | null;
  suburb: string | null;
  calendly_url: string | null;
  contact_number: string | null;
  bio: string | null;
  rating: number | null;
  review_count: number | null;
  google_reviews_url: string | null;
  slug?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export const LISTING_SELECT = [
  'id',
  'name',
  'profession',
  'practice_name',
  'location',
  'suburb',
  'calendly_url',
  'contact_number',
  'bio',
  'rating',
  'review_count',
  'google_reviews_url',
  'slug',
  'latitude',
  'longitude',
].join(',');

export function listingDisplayName(l: Listing): string {
  return (l.practice_name || l.name || '').trim();
}

export function listingsFor(
  listings: Listing[],
  professionDb: string,
  suburbName?: string,
): Listing[] {
  return listings.filter((l) => {
    if (l.profession !== professionDb) return false;
    if (suburbName) return (l.suburb || '') === suburbName;
    return true;
  });
}

export function listingsFallbackHtml(listings: Listing[]): string {
  const esc = escapeHtml;
  if (!listings.length) {
    return '<p>We are still adding practitioners in this area.</p>';
  }
  const items = listings
    .map((l) => {
      const name = listingDisplayName(l);
      const person =
        l.practice_name && l.practice_name !== l.name
          ? `<p>${esc(l.name)}</p>`
          : '';
      const meta: string[] = [];
      if (l.suburb) meta.push(`<span>${esc(l.suburb)}</span>`);
      if (l.contact_number) {
        const tel = l.contact_number.replace(/\s+/g, '');
        meta.push(`<a href="tel:${esc(tel)}">${esc(l.contact_number)}</a>`);
      }
      const website = l.calendly_url
        ? `<p><a href="${esc(l.calendly_url)}" rel="noopener nofollow">Visit practice website</a></p>`
        : '';
      return `<li><h3>${esc(name)}</h3>${person}${meta.length ? `<p>${meta.join(' · ')}</p>` : ''}${website}</li>`;
    })
    .join('');
  return `<ul>${items}</ul>`;
}

export function listingsJsonLd(listings: Listing[], pagePath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: `${SITE_URL}${pagePath}`,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => {
      const isGp = l.profession === 'General Practitioner';
      const item: Record<string, unknown> = {
        '@type': isGp ? 'MedicalClinic' : 'MedicalBusiness',
        name: listingDisplayName(l),
        address: {
          '@type': 'PostalAddress',
          addressLocality: l.suburb || undefined,
          addressRegion: 'Western Cape',
          addressCountry: 'ZA',
          streetAddress: l.location || undefined,
        },
      };
      if (l.calendly_url) item.url = l.calendly_url;
      if (l.contact_number) item.telephone = l.contact_number;
      if (l.bio) item.description = l.bio;
      if (l.latitude != null && l.longitude != null) {
        item.geo = {
          '@type': 'GeoCoordinates',
          latitude: l.latitude,
          longitude: l.longitude,
        };
      }
      if (l.rating != null && l.review_count) {
        item.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: l.rating,
          reviewCount: l.review_count,
        };
      }
      return {
        '@type': 'ListItem',
        position: i + 1,
        item,
      };
    }),
  };
}

/**
 * Guardrail: suburb HTML must contain real listing fields, not a JS-only
 * loading shell. Used by the prerender plugin and the post-build assert.
 */
export function assertPrerenderedDirectoryHtml(
  html: string,
  listings: Listing[],
  path: string,
): void {
  if (!listings.length) return;
  if (html.includes('Loading practitioners')) {
    throw new Error(`${path}: prerender still has the JS loading shell`);
  }
  const sample = listings.slice(0, 8);
  for (const l of sample) {
    const name = listingDisplayName(l);
    if (name && !html.includes(escapeHtml(name))) {
      throw new Error(`${path}: missing practice name ${JSON.stringify(name)} in initial HTML`);
    }
    if (l.contact_number && !html.includes(escapeHtml(l.contact_number))) {
      throw new Error(`${path}: missing phone ${JSON.stringify(l.contact_number)} in initial HTML`);
    }
    if (l.calendly_url && !html.includes(escapeHtml(l.calendly_url))) {
      throw new Error(`${path}: missing website ${JSON.stringify(l.calendly_url)} in initial HTML`);
    }
    if (l.suburb && !html.includes(escapeHtml(l.suburb))) {
      throw new Error(`${path}: missing suburb ${JSON.stringify(l.suburb)} in initial HTML`);
    }
  }
  if (!html.includes('"@type":"ItemList"') && !html.includes('"@type": "ItemList"')) {
    throw new Error(`${path}: missing ItemList JSON-LD`);
  }
}
