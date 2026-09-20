import { listingsFallbackHtml, listingsJsonLd, type Listing } from './listings';

const sample: Listing[] = [
  {
    id: '1',
    name: 'Marcela Cawood',
    profession: 'Physiotherapist',
    practice_name: 'Marcela Cawood Physiotherapy',
    location: 'Rondebosch, Cape Town',
    suburb: 'Rondebosch',
    calendly_url: 'https://www.cwphysio.co.za/',
    contact_number: '074 420 2000',
    bio: null,
    rating: null,
    review_count: null,
    google_reviews_url: null,
  },
];

const html = listingsFallbackHtml(sample);
if (!html.includes('Marcela Cawood Physiotherapy')) throw new Error('missing practice name');
if (!html.includes('Rondebosch')) throw new Error('missing suburb');
if (!html.includes('074 420 2000')) throw new Error('missing phone');
if (!html.includes('https://www.cwphysio.co.za/')) throw new Error('missing website href');
if (html.includes('Loading practitioners')) throw new Error('must not be JS loading shell');

const ld = JSON.stringify(listingsJsonLd(sample, '/practitioners/physiotherapists/rondebosch'));
if (!ld.includes('"ItemList"')) throw new Error('missing ItemList');
if (!ld.includes('"MedicalBusiness"')) throw new Error('missing MedicalBusiness');
if (!ld.includes('074 420 2000')) throw new Error('JSON-LD missing phone');

console.log('listings prerender unit checks passed');
