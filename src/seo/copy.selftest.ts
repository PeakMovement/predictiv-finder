import { directoryFaqs, findProfession, findSuburb, professionDescription, phrasePlural, phraseSingular } from './site';
import { blogAuthorJsonLd, DEFAULT_AUTHOR_NAME, isNamedPerson, resolvedAuthorName } from './eeat';

const gps = findProfession('gps')!;
if (phraseSingular(gps) !== 'GP') throw new Error(`GP singular was ${phraseSingular(gps)}`);
if (phrasePlural(gps) !== 'GPs') throw new Error(`GP plural was ${phrasePlural(gps)}`);
if (/\bgps\b/.test(professionDescription(gps))) throw new Error(`GP city description still has "gps": ${professionDescription(gps)}`);
if (/\bgp\b/.test(professionDescription(gps))) throw new Error(`GP city description still has "gp": ${professionDescription(gps)}`);
if (!professionDescription(gps).includes('GPs') || !professionDescription(gps).includes('GP')) {
  throw new Error(`GP city description missing GPs/GP: ${professionDescription(gps)}`);
}

const physio = findProfession('physiotherapists')!;
const rondebosch = findSuburb('rondebosch')!;
const cityQs = new Set(physio.faqs.map((f) => f.q));
const suburbFaqs = directoryFaqs(physio, rondebosch);
if (suburbFaqs.some((f) => cityQs.has(f.q))) {
  throw new Error('suburb FAQs must not reuse city profession FAQ questions');
}
if (!suburbFaqs.some((f) => f.q.includes('Rondebosch'))) {
  throw new Error('suburb FAQs should mention the suburb');
}
if (!suburbFaqs.some((f) => f.a.includes('/practitioners/physiotherapists'))) {
  throw new Error('suburb FAQs should point at the city profession page');
}

if (isNamedPerson('Predictiv')) throw new Error('Predictiv must not be treated as a Person');
if (isNamedPerson('')) throw new Error('empty name is not a Person');
if (!isNamedPerson('Jane Clinician')) throw new Error('named author should be a Person');
if (!isNamedPerson(DEFAULT_AUTHOR_NAME)) throw new Error('Justin Muller must be a Person');
if (DEFAULT_AUTHOR_NAME !== 'Justin Muller') throw new Error(`default author must be exactly "Justin Muller", got ${JSON.stringify(DEFAULT_AUTHOR_NAME)}`);
if (resolvedAuthorName(null) !== DEFAULT_AUTHOR_NAME) throw new Error('null CMS author should default to Justin Muller');
if (resolvedAuthorName('') !== DEFAULT_AUTHOR_NAME) throw new Error('empty CMS author should default to Justin Muller');
if (resolvedAuthorName('Predictiv') !== DEFAULT_AUTHOR_NAME) throw new Error('organisation default should map to Justin Muller');
if (resolvedAuthorName('  Predictiv Pty Ltd  ') !== DEFAULT_AUTHOR_NAME) throw new Error('org variant should map to Justin Muller');
if (resolvedAuthorName('Someone Else') !== 'Someone Else') throw new Error('explicit named author must be kept');

const authorLd = blogAuthorJsonLd('Predictiv', '', 'https://predictiv.co.za/about');
if (authorLd['@type'] !== 'Person') throw new Error(`expected Person author, got ${JSON.stringify(authorLd)}`);
if (authorLd.name !== 'Justin Muller') throw new Error(`expected name Justin Muller, got ${JSON.stringify(authorLd)}`);
if ('jobTitle' in authorLd) throw new Error('must not invent a jobTitle/credential');

const namedLd = blogAuthorJsonLd('Justin Muller');
if (namedLd['@type'] !== 'Person' || namedLd.name !== 'Justin Muller') throw new Error(JSON.stringify(namedLd));
if ('jobTitle' in namedLd) throw new Error('blank credential must not set jobTitle');

console.log('copy / FAQ / E-E-A-T unit checks passed');
