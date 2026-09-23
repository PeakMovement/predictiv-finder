import assert from 'node:assert/strict';
import { practitionerPath, type Listing } from './listings';
import {
  assertPrerenderedPractitionerHtml,
  practitionerCrumbs,
  practitionerDescription,
  practitionerFallbackHtml,
  practitionerJsonLd,
  practitionerRoute,
  practitionerTitle,
} from './practitioners';

const bolus: Listing = {
  id: 'a1',
  name: 'Dr Will Bolus',
  profession: 'Chiropractor',
  practice_name: 'Dr Will Bolus Chiropractor',
  location: 'Claremont, Cape Town',
  suburb: 'Claremont',
  calendly_url: 'https://drwillbolus.com/',
  contact_number: '021 671 1234',
  bio: 'Sports focused chiropractic care for runners and cyclists.',
  rating: 4.9,
  review_count: 37,
  google_reviews_url: null,
  slug: 'dr-will-bolus-chiropractor',
  is_claimed: false,
};

// No slug in the database: the path is derived from the display name.
const noSlug: Listing = { ...bolus, id: 'a2', slug: null, practice_name: 'Colinton Surgery', name: 'Colinton Surgery', profession: 'General Practitioner', suburb: 'Newlands' };

assert.equal(practitionerPath(bolus), '/practitioner/dr-will-bolus-chiropractor');
assert.equal(practitionerPath(noSlug), '/practitioner/colinton-surgery');

// An unusable slug must not produce a broken route rather than crashing.
assert.equal(practitionerPath({ ...bolus, slug: 'Not A Slug', practice_name: '', name: '' }), null);
assert.equal(practitionerRoute({ ...bolus, slug: 'Not A Slug', practice_name: '', name: '' }), null);

const route = practitionerRoute(bolus)!;
assert.ok(route.title.includes('Dr Will Bolus Chiropractor'));
assert.ok(route.title.includes('Claremont'));
assert.ok(practitionerTitle(bolus).includes('Chiropractor'));
assert.ok(practitionerDescription(bolus).length <= 300);
assert.ok(practitionerDescription(bolus).includes('Claremont'));

const html = practitionerFallbackHtml(bolus);
assert.ok(html.includes('<h1>Dr Will Bolus Chiropractor</h1>'), 'h1 carries the practice name');
assert.ok(html.includes('021 671 1234'), 'phone is visible without JavaScript');
assert.ok(html.includes('drwillbolus.com'), 'practice website is visible without JavaScript');
assert.ok(html.includes('/practitioners/chiropractors/claremont'), 'links back to its suburb page');
assert.ok(html.includes('not claimed'), 'unclaimed listings say so');

// GPs are clinics, everyone else is a medical business.
const ld = practitionerJsonLd(bolus, route.path) as Record<string, unknown>;
assert.equal(ld['@type'], 'MedicalBusiness');
assert.equal((practitionerJsonLd(noSlug, '/practitioner/colinton-surgery') as Record<string, unknown>)['@type'], 'MedicalClinic');
assert.deepEqual(ld.aggregateRating, { '@type': 'AggregateRating', ratingValue: 4.9, reviewCount: 37 });
assert.equal((practitionerJsonLd({ ...bolus, rating: null, review_count: null }, route.path) as Record<string, unknown>).aggregateRating, undefined, 'no rating means no fake rating');

const crumbs = practitionerCrumbs(bolus);
assert.equal(crumbs[0].path, '/');
assert.equal(crumbs[crumbs.length - 1].path, '/practitioner/dr-will-bolus-chiropractor');
assert.ok(crumbs.some((c) => c.path === '/practitioners/chiropractors/claremont'));

assertPrerenderedPractitionerHtml(`<html><body>${html}</body></html>`, bolus, route.path);
assert.throws(
  () => assertPrerenderedPractitionerHtml('<html><body><div id="root"></div></body></html>', bolus, route.path),
  /missing the practice name/,
  'an empty shell must fail the build',
);

console.log('practitioners.selftest: all assertions passed');
