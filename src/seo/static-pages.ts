/**
 * Crawler-visible HTML for pages whose React trees are static copy
 * (about, privacy, practitioners index). Keep in lockstep with the
 * matching page components.
 */
import { CURRENT_CONSENT_VERSION } from '../config/popia';
import { escapeHtml } from './blog-prerender';
import { CITY, DIRECTORY_PAGES, PROFESSIONS, SUBURBS, findSuburb } from './site';

const esc = escapeHtml;

export function aboutFallbackHtml(): string {
  return [
    '<h2>Why we built it</h2>',
    '<p>When something hurts or does not feel right, the first question is often the hardest one: who do I see? A physiotherapist, a chiropractor, a biokineticist or a GP? Predictiv answers that in plain language and then helps you find a trusted practice nearby, starting in Rondebosch and the Southern Suburbs of Cape Town.</p>',
    '<h2>How it works</h2>',
    '<ul>',
    '<li>Search local practitioners by type and suburb on our <a href="/practitioners">practitioner directory</a>.</li>',
    '<li>Or <a href="/assistant">describe your problem</a> and see which type of practitioner is usually the best fit.</li>',
    '<li>Book directly with the practice. Predictiv is free and does not take a cut of your appointment.</li>',
    '</ul>',
    '<h2>Built with clinical input</h2>',
    '<p>Predictiv is built with input from registered healthcare practitioners in Cape Town. Its guidance is directional only and is never a diagnosis. In an emergency, call an ambulance or go to your nearest emergency unit.</p>',
    '<h2>For practitioners</h2>',
    '<p>Predictiv is free while it is in testing. Listings are compiled from practices\' own public websites and any practice can ask to update or remove its listing at any time. To get listed, update your details or be removed, visit <a href="/join">List your practice</a> or email <a href="mailto:predictivpty@gmail.com">predictivpty@gmail.com</a>.</p>',
  ].join('');
}

export function joinFallbackHtml(): string {
  return [
    '<p>Predictiv is in testing in Cape Town. Practitioner sign-up is not self-serve yet. Directory cards marked as unclaimed were compiled from the practice\'s own public website — they are not claimed or managed by the practitioner until we hear from you.</p>',
    '<ul>',
    '<li>Ask to be listed, or to update a listing we already compiled</li>',
    '<li>Claim a listing so you can manage your own profile later</li>',
    '<li>Ask us to remove a listing at any time</li>',
    '</ul>',
    '<p>Email <a href="mailto:predictivpty@gmail.com">predictivpty@gmail.com</a> with your practice name, suburb, and what you would like us to do.</p>',
  ].join('');
}

export function privacyFallbackHtml(): string {
  const version = esc(CURRENT_CONSENT_VERSION);
  return [
    `<p>Version ${version}. This is a working draft pending review by South African privacy counsel.</p>`,
    '<h2>1. Who we are</h2>',
    '<p>Predictiv ("we") provides directional guidance about South African healthcare costs and which type of specialist to see. We act as the responsible party under the Protection of Personal Information Act, 2013 (POPIA).</p>',
    '<h2>2. What we collect</h2>',
    '<ul>',
    '<li>The free-text health description you type into the assistant.</li>',
    '<li>Technical metadata (browser type, approximate region) used to keep the service reliable.</li>',
    '<li>If you sign in (future): your email and a record of your consent version.</li>',
    '</ul>',
    '<h2>3. Why we process it</h2>',
    '<p>We process your health description only to: (a) extract the apparent concern, (b) suggest a relevant medical specialty, and (c) estimate a price range in Rand. We rely on your explicit consent as the lawful basis under POPIA section 27 for processing health information.</p>',
    '<h2>4. Who else sees it</h2>',
    '<p>Your description is forwarded (without your identifiers) to our backend and then to Google\'s Gemini model via the Lovable AI Gateway. The model returns a structured analysis. The AI provider does not train on your input. Servers may be located outside South Africa; by consenting you authorise this trans-border transfer under POPIA section 72.</p>',
    '<h2>5. Retention</h2>',
    '<p>Anonymous sessions are not stored beyond what your browser keeps locally. If you create an account in a future release, interaction logs will be retained for up to 30 days for safety and quality purposes, then automatically redacted.</p>',
    '<h2>6. Your rights</h2>',
    '<p>You may withdraw consent at any time, request access to or deletion of any account-linked data, and lodge a complaint with the Information Regulator (South Africa). Contact us at <a href="mailto:privacy@predictiv.health">privacy@predictiv.health</a>.</p>',
    '<h2>7. Not medical advice</h2>',
    '<p>Predictiv does not diagnose, treat, or replace a registered healthcare practitioner. In an emergency, call 10177.</p>',
  ].join('');
}

export function practitionersIndexFallbackHtml(): string {
  const sections = PROFESSIONS.map((p) => {
    const suburbs = DIRECTORY_PAGES.filter((d) => d.profession === p.slug)
      .map((d) => SUBURBS.find((s) => s.slug === d.suburb) ?? findSuburb(d.suburb))
      .filter((s): s is NonNullable<typeof s> => !!s);
    const links = suburbs
      .map(
        (s) =>
          `<li><a href="/practitioners/${p.slug}/${s.slug}">${esc(p.plural)} in ${esc(s.name)}</a></li>`,
      )
      .join('');
    return [
      `<section>`,
      `<h2><a href="/practitioners/${p.slug}">${esc(p.plural)} in ${esc(CITY)}</a></h2>`,
      `<p>${esc(p.intro)}</p>`,
      links ? `<ul>${links}</ul>` : '',
      `</section>`,
    ].join('');
  }).join('');
  return `${sections}<p>Not sure who you need? <a href="/assistant">Describe your problem</a> and we will point you in the right direction.</p>`;
}
