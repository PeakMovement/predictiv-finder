import { directoryFaqs, findProfession, findSuburb, professionDescription, phrasePlural, phraseSingular } from './site';
import { isNamedPerson, organizationAuthorJsonLd, publicAuthorName } from './eeat';

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
if (isNamedPerson('Justin Muller')) throw new Error('withdrawn person author must not be treated as a Person');
if (isNamedPerson('  justin muller  ')) throw new Error('withdrawn person author (case/space) must not be a Person');
if (publicAuthorName(null) !== 'Predictiv') throw new Error('null CMS author should be Predictiv');
if (publicAuthorName('') !== 'Predictiv') throw new Error('empty CMS author should be Predictiv');
if (publicAuthorName('Predictiv') !== 'Predictiv') throw new Error('org default should stay Predictiv');
if (publicAuthorName('Justin Muller') !== 'Predictiv') throw new Error('withdrawn person author must display as Predictiv');
if (publicAuthorName('Jane Clinician') !== 'Jane Clinician') throw new Error('explicit named author must be kept');

const orgLd = organizationAuthorJsonLd(publicAuthorName('Justin Muller'), 'https://predictiv.co.za');
if (orgLd['@type'] !== 'Organization') throw new Error(`expected Organization author, got ${JSON.stringify(orgLd)}`);
if (orgLd.name !== 'Predictiv') throw new Error(`expected name Predictiv, got ${JSON.stringify(orgLd)}`);
if ('jobTitle' in orgLd) throw new Error('organisation author must not have jobTitle');

console.log('copy / FAQ / E-E-A-T unit checks passed');
