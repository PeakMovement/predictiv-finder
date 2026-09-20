/**
 * Post-build check: every prerendered /blog/:slug page must have unique
 * title, meta description, self-referencing canonical, and H1 — not the
 * homepage shell that Lovable serves as the SPA fallback.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const blogDir = path.join(dist, 'blog');
const SITE = 'https://predictiv.co.za';
const HOME_TITLE = 'Predictiv | Find a Physio, Chiropractor, Biokineticist or GP in Cape Town';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function tag(html, re) {
  return html.match(re)?.[1] ?? null;
}

if (!fs.existsSync(blogDir)) {
  console.error('dist/blog is missing. Run `npm run build` first.');
  process.exit(1);
}

const slugs = fs.readdirSync(blogDir).filter((name) => {
  const file = path.join(blogDir, name, 'index.html');
  return fs.existsSync(file);
});

if (slugs.length === 0) {
  console.error('No prerendered blog posts under dist/blog/<slug>/index.html');
  process.exit(1);
}

let failed = 0;
for (const slug of slugs) {
  const html = read(path.join(blogDir, slug, 'index.html'));
  const title = tag(html, /<title>([\s\S]*?)<\/title>/);
  const canonical = tag(html, /<link rel="canonical" href="([^"]*)"/);
  const description = tag(html, /<meta name="description" content="([^"]*)"/);
  const h1 = tag(html, /<h1>([\s\S]*?)<\/h1>/);
  const expectedCanonical = `${SITE}/blog/${slug}`;
  const problems = [];
  if (!title || title === HOME_TITLE) problems.push(`title is homepage or missing (${JSON.stringify(title)})`);
  if (canonical !== expectedCanonical) problems.push(`canonical ${JSON.stringify(canonical)} !== ${expectedCanonical}`);
  if (!description || description.includes('Find trusted physiotherapists, chiropractors, biokineticists and GPs')) {
    problems.push(`description looks like the homepage (${JSON.stringify(description)?.slice(0, 80)})`);
  }
  if (!h1) problems.push('missing H1');
  if (problems.length) {
    failed += 1;
    console.error(`FAIL /blog/${slug}:\n  - ${problems.join('\n  - ')}`);
  } else {
    console.log(`ok  /blog/${slug}  title=${JSON.stringify(title)}`);
  }
}

const indexHtml = read(path.join(blogDir, 'index.html'));
const indexCanon = tag(indexHtml, /<link rel="canonical" href="([^"]*)"/);
if (indexCanon !== `${SITE}/blog`) {
  failed += 1;
  console.error(`FAIL /blog: canonical ${JSON.stringify(indexCanon)}`);
} else {
  console.log('ok  /blog index still has its own canonical');
}

if (failed) {
  console.error(`\n${failed} prerendered blog page(s) failed SEO checks`);
  process.exit(1);
}

console.log(`\n${slugs.length} blog posts prerendered with unique head tags`);
