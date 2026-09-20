/**
 * Single source of truth for Predictiv's public, indexable pages.
 * Pure data (no React, no Supabase) so the Vite build plugin can import it
 * to prerender per-route HTML heads and generate sitemap.xml.
 */

export const SITE_URL = 'https://predictiv.co.za';
export const SITE_NAME = 'Predictiv';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const CITY = 'Cape Town';

export interface Faq { q: string; a: string }

export interface Profession {
  slug: string;
  /** Value stored in professionals.profession */
  db: string;
  singular: string;
  plural: string;
  short: string;
  intro: string;
  treats: string[];
  whenToSee: string;
  faqs: Faq[];
}

export const PROFESSIONS: Profession[] = [
  {
    slug: 'physiotherapists',
    db: 'Physiotherapist',
    singular: 'Physiotherapist',
    plural: 'Physiotherapists',
    short: 'physio',
    intro:
      'Physiotherapists assess and treat pain, injuries and movement problems using hands on treatment, exercise and education. They are often the best first stop for muscle and joint problems.',
    treats: [
      'Back and neck pain',
      'Sports injuries such as sprains and muscle tears',
      'Knee, shoulder and hip pain',
      'Rehab after surgery or a fracture',
      'Headaches that come from the neck',
      'Balance problems and falls',
    ],
    whenToSee:
      'See a physiotherapist when pain or stiffness in a muscle or joint is stopping you from moving, training or working normally, or after an injury or operation.',
    faqs: [
      {
        q: 'Do I need a referral to see a physiotherapist in South Africa?',
        a: 'No. You can book directly with a physiotherapist. Some medical aid plans ask for a referral or pre authorisation, so check your plan before your first visit.',
      },
      {
        q: 'Does medical aid cover physiotherapy?',
        a: 'Most medical aid plans cover physiotherapy from your day to day or savings benefit, and some cover it from hospital benefits after surgery. Cover depends on your plan.',
      },
      {
        q: 'Physio or chiro for back pain?',
        a: 'Both treat back pain. Physiotherapists tend to combine hands on treatment with a strong focus on exercise and rehab, while chiropractors focus more on spinal adjustments. Predictiv can help you decide based on your symptoms.',
      },
    ],
  },
  {
    slug: 'chiropractors',
    db: 'Chiropractor',
    singular: 'Chiropractor',
    plural: 'Chiropractors',
    short: 'chiro',
    intro:
      'Chiropractors diagnose and treat problems of the spine, joints and nervous system, mainly using spinal adjustments, mobilisation and soft tissue work.',
    treats: [
      'Lower back pain',
      'Neck pain and stiffness',
      'Tension headaches',
      'Pain linked to posture and desk work',
      'Pain that travels into the leg',
      'Back pain during pregnancy',
    ],
    whenToSee:
      'See a chiropractor for back or neck pain, stiffness or headaches, especially when the problem seems linked to your spine or posture.',
    faqs: [
      {
        q: 'Are chiropractors registered in South Africa?',
        a: 'Yes. Chiropractors in South Africa must be registered with the Allied Health Professions Council of South Africa (AHPCSA).',
      },
      {
        q: 'Do I need a referral to see a chiropractor?',
        a: 'No. You can book directly with a chiropractor.',
      },
      {
        q: 'Is chiropractic covered by medical aid?',
        a: 'Many medical aid plans pay for chiropractic from your day to day or savings benefit. Check your plan for limits.',
      },
    ],
  },
  {
    slug: 'biokineticists',
    db: 'Biokineticist',
    singular: 'Biokineticist',
    plural: 'Biokineticists',
    short: 'bio',
    intro:
      'Biokineticists are exercise specialists who use tailored, clinically guided exercise to rehabilitate injuries, manage chronic conditions and improve performance.',
    treats: [
      'The final phase of injury rehab',
      'Getting strong again after surgery',
      'Chronic conditions such as diabetes and high blood pressure',
      'Ongoing back pain',
      'Sports performance and conditioning',
      'Strength and balance in older adults',
    ],
    whenToSee:
      'See a biokineticist when you need a structured exercise programme to recover fully from an injury, manage a long term condition or get back to sport safely.',
    faqs: [
      {
        q: 'What does a biokineticist do?',
        a: 'A biokineticist assesses how your body moves and designs a supervised exercise programme to rehabilitate injuries, manage chronic conditions and improve physical performance.',
      },
      {
        q: 'Biokineticist or physiotherapist?',
        a: 'Physiotherapists usually handle the early, painful stage of an injury. Biokineticists often take over once pain has settled, to rebuild strength and prevent it happening again.',
      },
      {
        q: 'Are biokineticists registered in South Africa?',
        a: 'Yes. Biokineticists are registered with the Health Professions Council of South Africa (HPCSA).',
      },
    ],
  },
  {
    slug: 'gps',
    db: 'General Practitioner',
    singular: 'GP',
    plural: 'GPs',
    short: 'GP',
    intro:
      'General practitioners (GPs) are medical doctors who diagnose and treat a wide range of everyday illnesses and long term conditions, and refer you to specialists when needed.',
    treats: [
      'Colds, flu and infections',
      'Chronic conditions and repeat medication',
      'Check ups and screening',
      'Referrals to specialists',
      'New or unexplained symptoms',
      'Sick notes and medical forms',
    ],
    whenToSee:
      'See a GP when you are unwell, when symptoms are new or unexplained, when you need medication, or when you are not sure which specialist you need.',
    faqs: [
      {
        q: 'When should I see a GP instead of a physio or chiro?',
        a: 'See a GP if you feel generally unwell, have a fever, unexplained weight loss, pain that is not linked to movement, or if you are unsure what is wrong.',
      },
      {
        q: 'Can a GP refer me to a physiotherapist?',
        a: 'Yes. A GP can refer you, although in South Africa you can also book a physiotherapist directly.',
      },
      {
        q: 'What if it is an emergency?',
        a: 'For chest pain, difficulty breathing, signs of a stroke or a serious injury, call an ambulance or go to your nearest emergency unit immediately.',
      },
    ],
  },
];

export interface Suburb { slug: string; name: string }

export const SUBURBS: Suburb[] = [
  { slug: 'rondebosch', name: 'Rondebosch' },
  { slug: 'claremont', name: 'Claremont' },
  { slug: 'newlands', name: 'Newlands' },
  { slug: 'pinelands', name: 'Pinelands' },
  { slug: 'kenilworth', name: 'Kenilworth' },
  { slug: 'wynberg', name: 'Wynberg' },
  { slug: 'plumstead', name: 'Plumstead' },
];

/**
 * Profession and suburb pairs that currently have listings. Only these get
 * their own indexable page, so Google never sees thin, empty pages.
 * Snapshot of the professionals table (2026-09-17); update as listings grow.
 */
export const DIRECTORY_PAGES: { profession: string; suburb: string }[] = [
  { profession: 'physiotherapists', suburb: 'rondebosch' },
  { profession: 'physiotherapists', suburb: 'newlands' },
  { profession: 'physiotherapists', suburb: 'pinelands' },
  { profession: 'chiropractors', suburb: 'rondebosch' },
  { profession: 'chiropractors', suburb: 'claremont' },
  { profession: 'chiropractors', suburb: 'pinelands' },
  { profession: 'chiropractors', suburb: 'plumstead' },
  { profession: 'biokineticists', suburb: 'rondebosch' },
  { profession: 'biokineticists', suburb: 'claremont' },
  { profession: 'biokineticists', suburb: 'newlands' },
  { profession: 'biokineticists', suburb: 'pinelands' },
  { profession: 'biokineticists', suburb: 'kenilworth' },
  { profession: 'biokineticists', suburb: 'wynberg' },
  { profession: 'gps', suburb: 'rondebosch' },
  { profession: 'gps', suburb: 'claremont' },
  { profession: 'gps', suburb: 'newlands' },
  { profession: 'gps', suburb: 'pinelands' },
];

export const findProfession = (slug?: string) => PROFESSIONS.find((p) => p.slug === slug);
export const findSuburb = (slug?: string) => SUBURBS.find((s) => s.slug === slug);
export const hasDirectoryPage = (profession: string, suburb: string) =>
  DIRECTORY_PAGES.some((d) => d.profession === profession && d.suburb === suburb);

export interface RouteSeo {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Defaults to website. Blog posts are prerendered as articles. */
  ogType?: 'website' | 'article';
  image?: string;
  /** Already-escaped HTML for crawler-visible article body. */
  articleHtml?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  keywords?: string;
}

export const professionTitle = (p: Profession) => `${p.plural} in ${CITY} | Find a ${p.singular} Near You | ${SITE_NAME}`;
export const professionDescription = (p: Profession) =>
  `Find ${p.plural.toLowerCase()} in Rondebosch, Claremont, Newlands and the Southern Suburbs. See what a ${p.singular.toLowerCase()} treats, when to see one, and book directly.`;
export const directoryTitle = (p: Profession, s: Suburb) => `${p.plural} in ${s.name}, ${CITY} | ${SITE_NAME}`;
export const directoryDescription = (p: Profession, s: Suburb) =>
  `Looking for a ${p.singular.toLowerCase()} in ${s.name}? Compare local ${p.plural.toLowerCase()} in ${s.name}, ${CITY}, see what they treat and book directly with the practice.`;

export function allRoutes(): RouteSeo[] {
  const routes: RouteSeo[] = [
    {
      path: '/',
      title: `${SITE_NAME} | Find a Physio, Chiropractor, Biokineticist or GP in ${CITY}`,
      description:
        'Find trusted physiotherapists, chiropractors, biokineticists and GPs in Rondebosch and the Southern Suburbs, or describe your problem and see who is the best fit to help. Free to use.',
      h1: `Find the right practitioner near you in ${CITY}`,
      intro:
        'Search physiotherapists, chiropractors, biokineticists and GPs in Rondebosch and the Southern Suburbs, or describe a simple problem and Predictiv will point you to the right type of practitioner.',
      priority: 1.0,
      changefreq: 'weekly',
    },
    {
      path: '/assistant',
      title: `Name Your Problem or Find a Practitioner | ${SITE_NAME}`,
      description:
        'Describe what is bothering you in plain language and see whether a physiotherapist, chiropractor, biokineticist or GP is the best fit, then find one near you in Cape Town.',
      h1: 'Name your problem and find the right practitioner',
      intro: 'Describe a simple problem in your own words and Predictiv suggests which type of practitioner is the best fit to see.',
      priority: 0.9,
      changefreq: 'weekly',
    },
    {
      path: '/practitioners',
      title: `Find a Practitioner in ${CITY} | Physios, Chiros, Biokineticists and GPs | ${SITE_NAME}`,
      description:
        'Browse physiotherapists, chiropractors, biokineticists and GPs across Rondebosch, Claremont, Newlands, Pinelands and the Southern Suburbs of Cape Town.',
      h1: `Find a practitioner in ${CITY}`,
      intro: 'Browse local practitioners by type and suburb.',
      priority: 0.9,
      changefreq: 'weekly',
    },
  ];
  for (const p of PROFESSIONS) {
    routes.push({
      path: `/practitioners/${p.slug}`,
      title: professionTitle(p),
      description: professionDescription(p),
      h1: `${p.plural} in ${CITY}`,
      intro: p.intro,
      priority: 0.8,
      changefreq: 'weekly',
    });
  }
  for (const d of DIRECTORY_PAGES) {
    const p = findProfession(d.profession)!;
    const s = findSuburb(d.suburb)!;
    routes.push({
      path: `/practitioners/${p.slug}/${s.slug}`,
      title: directoryTitle(p, s),
      description: directoryDescription(p, s),
      h1: `${p.plural} in ${s.name}`,
      intro: `${p.intro} Here are ${p.plural.toLowerCase()} practising in and around ${s.name}, ${CITY}.`,
      priority: 0.8,
      changefreq: 'weekly',
    });
  }
  routes.push(
    {
      path: '/blog',
      title: `Health and Injury Guides for ${CITY} | ${SITE_NAME} Blog`,
      description:
        'Plain language guides on back pain, sports injuries, seeing a physio, chiro, biokineticist or GP, and finding the right practitioner in Cape Town.',
      h1: 'The Predictiv blog',
      intro: 'Plain language guides to help you understand your problem and who to see.',
      priority: 0.8,
      changefreq: 'daily',
    },
    {
      path: '/about',
      title: `About ${SITE_NAME} | Helping Cape Town Find the Right Practitioner`,
      description:
        'Predictiv is a free Cape Town platform that connects people with local physiotherapists, chiropractors, biokineticists and GPs, and helps them understand who to see.',
      h1: `About ${SITE_NAME}`,
      intro: 'Predictiv helps people understand who to see and connects them with practitioners in their area.',
      priority: 0.5,
      changefreq: 'monthly',
    },
    {
      path: '/privacy',
      title: `Privacy Policy | ${SITE_NAME}`,
      description: 'How Predictiv collects, uses and protects your information under POPIA.',
      h1: 'Privacy policy',
      intro: 'How Predictiv handles your information.',
      priority: 0.3,
      changefreq: 'yearly',
    },
  );
  return routes;
}

export const routeSeo = (path: string) => allRoutes().find((r) => r.path === path);

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    image: OG_IMAGE,
    email: 'predictivpty@gmail.com',
    description:
      'Predictiv connects people in Cape Town with local physiotherapists, chiropractors, biokineticists and GPs, and helps them understand who is the best fit to see.',
    areaServed: SUBURBS.map((s) => ({ '@type': 'Place', name: `${s.name}, ${CITY}` })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export const HOME_FAQS: Faq[] = [
  {
    q: 'Is Predictiv free to use?',
    a: 'Yes. Predictiv is completely free for the public. You book and pay the practice directly.',
  },
  {
    q: 'How does Predictiv know who I should see?',
    a: 'Describe your problem in plain language and Predictiv suggests whether a physiotherapist, chiropractor, biokineticist or GP is usually the best fit. It gives directional guidance only and is not a diagnosis.',
  },
  {
    q: 'Which areas does Predictiv cover?',
    a: 'Predictiv is starting in the Southern Suburbs of Cape Town, including Rondebosch, Claremont, Newlands, Pinelands, Kenilworth and Wynberg, with more areas on the way.',
  },
  {
    q: 'What should I do in an emergency?',
    a: 'Predictiv is not for emergencies. For chest pain, difficulty breathing, signs of a stroke or a serious injury, call an ambulance or go to your nearest emergency unit immediately.',
  },
];
