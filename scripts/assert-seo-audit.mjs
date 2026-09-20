/**
 * Post-build SEO audit: directory listings in initial HTML, static page
 * bodies, GP casing, unique blog head tags, blog URLs in sitemap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://predictiv.co.za';
const HOME_TITLE = 'Predictiv | Find a Physio, Chiropractor, Biokineticist or GP in Cape Town';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function tag(html, re) {
  return html.match(re)?.[1] ?? null;
}

function fail(msg) {
  console.error(`FAIL ${msg}`);
  return 1;
}

if (!fs.existsSync(dist)) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

let failed = 0;

const suburbFile = path.join(dist, 'practitioners/physiotherapists/rondebosch/index.html');
if (!fs.existsSync(suburbFile)) {
  failed += fail('missing dist/practitioners/physiotherapists/rondebosch/index.html');
} else {
  const html = read(suburbFile);
  const checks = [
    ['Marcela Cawood', html.includes('Marcela Cawood') || html.includes('Kinnell Physiotherapy')],
    ['phone', /0\d{2}\s?\d{3}\s?\d{4}/.test(html)],
    ['website href', /https?:\/\/[^\s"]+/.test(html) && (html.includes('cwphysio') || html.includes('bookem') || html.includes('Visit practice website'))],
    ['suburb text', html.includes('Rondebosch')],
    ['not loading shell', !html.includes('Loading practitioners')],
    ['ItemList JSON-LD', html.includes('ItemList')],
    ['MedicalBusiness JSON-LD', html.includes('MedicalBusiness') || html.includes('MedicalClinic')],
    ['local FAQ not city duplicate', html.includes('How do I find a physiotherapist in Rondebosch') && !html.includes('Do I need a referral to see a physiotherapist in South Africa?')],
    ['canonical city FAQ link', html.includes('/practitioners/physiotherapists')],
  ];
  for (const [label, ok] of checks) {
    if (!ok) failed += fail(`/practitioners/physiotherapists/rondebosch: ${label}`);
    else console.log(`ok  directory ${label}`);
  }
}

const gpsFile = path.join(dist, 'practitioners/gps/index.html');
if (!fs.existsSync(gpsFile)) {
  failed += fail('missing /practitioners/gps');
} else {
  const html = read(gpsFile);
  const desc = tag(html, /<meta name="description" content="([^"]*)"/) || '';
  if (/\bgps\b/.test(desc) || /\bgp\b/.test(desc)) failed += fail(`/practitioners/gps description still lowercased: ${desc}`);
  else if (!desc.includes('GPs') || !desc.includes('GP')) failed += fail(`/practitioners/gps description missing GPs/GP: ${desc}`);
  else console.log('ok  GP meta description casing');
}

const about = read(path.join(dist, 'about/index.html'));
if (!about.includes('Why we built it') || !about.includes('predictivpty@gmail.com')) {
  failed += fail('/about missing full body copy');
} else console.log('ok  /about full body');

const privacy = read(path.join(dist, 'privacy/index.html'));
if (!privacy.includes('POPIA') || !privacy.includes('Who we are')) {
  failed += fail('/privacy missing full body copy');
} else console.log('ok  /privacy full body');

const practitioners = read(path.join(dist, 'practitioners/index.html'));
if (!practitioners.includes('/practitioners/physiotherapists/rondebosch') || !practitioners.includes('Physiotherapists in Cape Town')) {
  failed += fail('/practitioners missing type/suburb links');
} else console.log('ok  /practitioners index links');

const blogIndex = read(path.join(dist, 'blog/index.html'));
if (!blogIndex.includes('/blog/') || !/href="\/blog\/[a-z0-9-]+"/.test(blogIndex)) {
  failed += fail('/blog missing post list links');
} else console.log('ok  /blog post list links');

const sitemap = read(path.join(dist, 'sitemap.xml'));
if (!sitemap.includes(`${SITE}/blog/what-does-a-biokineticist-do`)) {
  failed += fail('primary sitemap missing blog post URLs');
} else console.log('ok  sitemap includes blog posts');

const blogDir = path.join(dist, 'blog');
const slugs = fs.readdirSync(blogDir).filter((name) => fs.existsSync(path.join(blogDir, name, 'index.html')));
for (const slug of slugs) {
  const html = read(path.join(blogDir, slug, 'index.html'));
  const title = tag(html, /<title>([\s\S]*?)<\/title>/);
  const canonical = tag(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = tag(html, /<meta property="og:url" content="([^"]*)"/);
  const expected = `${SITE}/blog/${slug}`;
  if (!title || title === HOME_TITLE) failed += fail(`/blog/${slug} title is homepage`);
  if (canonical !== expected) failed += fail(`/blog/${slug} canonical ${canonical}`);
  if (ogUrl !== expected) failed += fail(`/blog/${slug} og:url ${ogUrl}`);
}

if (failed) {
  console.error(`\n${failed} SEO audit check(s) failed`);
  process.exit(1);
}

console.log('\nSEO audit prerender checks passed');
