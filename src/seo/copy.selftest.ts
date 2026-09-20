import { directoryFaqs, findProfession, findSuburb, professionDescription, phrasePlural, phraseSingular } from './site';
import { isNamedPerson } from './eeat';

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

console.log('copy / FAQ / E-E-A-T unit checks passed');
