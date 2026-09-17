/**
 * Build-time SEO for the client-rendered app.
 *
 * For every public route in src/seo/site.ts this writes dist/<route>/index.html
 * with the right <title>, description, canonical, Open Graph tags, JSON-LD and
 * a readable HTML fallback inside #root (replaced by React on load). Crawlers
 * and AI answer engines that do not run JavaScript still get real content.
 *
 * It also generates sitemap.xml, llms.txt and llms-full.txt from the same data.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  HOME_FAQS, PROFESSIONS, SITE_URL, allRoutes, breadcrumbJsonLd, faqJsonLd, findProfession, findSuburb,
  organizationJsonLd, type RouteSeo,
} from '../src/seo/site';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setTag(html: string, re: RegExp, replacement: string) {
  return re.test(html) ? html.replace(re, replacement) : html.replace('</head>', `    ${replacement}\n  </head>`);
}

function crumbsFor(r: RouteSeo) {
  const parts = r.path.split('/').filter(Boolean);
  const crumbs = [{ name: 'Home', path: '/' }];
  if (parts[0] === 'practitioners') {
    crumbs.push({ name: 'Find a practitioner', path: '/practitioners' });
    const p = findProfession(parts[1]);
    if (p) crumbs.push({ name: p.plural, path: `/practitioners/${p.slug}` });
    const s = findSuburb(parts[2]);
    if (p && s) crumbs.push({ name: s.name, path: r.path });
  } else if (parts[0]) {
    crumbs.push({ name: r.h1, path: r.path });
  }
  return crumbs;
}

function jsonLdFor(r: RouteSeo) {
  const blocks: unknown[] = [];
  const parts = r.path.split('/').filter(Boolean);
  if (r.path === '/') blocks.push(faqJsonLd(HOME_FAQS));
  else blocks.push(breadcrumbJsonLd(crumbsFor(r)));
  const p = parts[0] === 'practitioners' ? findProfession(parts[1]) : undefined;
  if (p) blocks.push(faqJsonLd(p.faqs));
  if (r.path === '/about') blocks.push({ '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE_URL}/about`, mainEntity: organizationJsonLd() });
  return blocks;
}

function fallbackBody(r: RouteSeo, routes: RouteSeo[]) {
  const parts = r.path.split('/').filter(Boolean);
  const p = parts[0] === 'practitioners' ? findProfession(parts[1]) : undefined;
  const faqs = r.path === '/' ? HOME_FAQS : p?.faqs ?? [];
  let body = `<main style="max-width:860px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif">`;
  body += `<h1>${esc(r.h1)}</h1><p>${esc(r.intro)}</p>`;
  if (p) {
    body += `<h2>What does a ${esc(p.singular.toLowerCase())} treat?</h2><ul>${p.treats.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    body += `<h2>When should I see a ${esc(p.singular.toLowerCase())}?</h2><p>${esc(p.whenToSee)}</p>`;
  }
  if (r.path === '/') {
    body += `<h2>Which practitioner do I need?</h2><ul>${PROFESSIONS.map((x) => `<li><a href="/practitioners/${x.slug}">${esc(x.plural)} in Cape Town</a>: ${esc(x.whenToSee)}</li>`).join('')}</ul>`;
  }
  if (faqs.length) {
    body += `<h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  }
  body += `<nav aria-label="Site"><h2>Explore Predictiv</h2><ul>${routes
    .filter((x) => x.path !== r.path)
    .map((x) => `<li><a href="${x.path}">${esc(x.h1)}</a></li>`)
    .join('')}</ul></nav>`;
  body += `<p><small>Predictiv gives directional guidance only, not medical advice. In an emergency call an ambulance.</small></p></main>`;
  return body;
}

function renderRoute(template: string, r: RouteSeo, routes: RouteSeo[]) {
  const url = `${SITE_URL}${r.path}`;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(r.title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(r.description)}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(r.title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(r.description)}" />`);
  const ld = jsonLdFor(r)
    .map((b) => `<script type="application/ld+json" data-prerendered>${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  html = html.replace('</head>', `    ${ld}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallbackBody(r, routes)}</div>`);
  return html;
}

function sitemap(routes: RouteSeo[], lastmod: string) {
  const urls = routes
    .map((r) => `  <url><loc>${SITE_URL}${r.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function llmsTxt(routes: RouteSeo[]) {
  const lines = [
    '# Predictiv',
    '',
    '> Predictiv (predictiv.co.za) is a free Cape Town, South Africa platform that helps people find physiotherapists, chiropractors, biokineticists and GPs near them, and helps them understand which type of practitioner is the best fit for a simple problem. It gives directional guidance only, not a diagnosis.',
    '',
    'Coverage: Rondebosch, Claremont, Newlands, Pinelands, Kenilworth, Wynberg and Plumstead in the Southern Suburbs of Cape Town. Listings link to each practice\'s own website; people book directly with the practice. Contact: predictivpty@gmail.com.',
    '',
    '## Key pages',
    ...routes.filter((r) => r.path.split('/').length <= 3).map((r) => `- [${r.h1}](${SITE_URL}${r.path}): ${r.description}`),
    '',
    '## Practitioners by suburb',
    ...routes.filter((r) => r.path.split('/').length === 4).map((r) => `- [${r.h1}](${SITE_URL}${r.path})`),
    '',
    '## Optional',
    `- [Full plain text guide](${SITE_URL}/llms-full.txt)`,
    `- [Blog sitemap](https://zpddlphtoeluytrejioj.supabase.co/functions/v1/blog-sitemap)`,
    '',
  ];
  return lines.join('\n');
}

function llmsFull() {
  const out = ['# Predictiv: who to see for what, in Cape Town', ''];
  out.push('Predictiv helps people in Cape Town work out which type of practitioner to see and find one nearby. This is general, directional information, not medical advice. In an emergency (chest pain, difficulty breathing, stroke signs, serious injury) call an ambulance or go to the nearest emergency unit.', '');
  for (const p of PROFESSIONS) {
    out.push(`## ${p.plural}`, '', p.intro, '', `When to see one: ${p.whenToSee}`, '', 'Commonly helps with:');
    out.push(...p.treats.map((t) => `- ${t}`), '');
    for (const f of p.faqs) out.push(`### ${f.q}`, '', f.a, '');
    out.push(`Find ${p.plural.toLowerCase()} in Cape Town: ${SITE_URL}/practitioners/${p.slug}`, '');
  }
  out.push('## About Predictiv', '');
  for (const f of HOME_FAQS) out.push(`### ${f.q}`, '', f.a, '');
  return out.join('\n');
}

export function seoPrerender(): Plugin {
  let outDir = 'dist';
  return {
    name: 'predictiv-seo-prerender',
    apply: 'build',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const template = fs.readFileSync(indexPath, 'utf8');
      const routes = allRoutes();
      for (const r of routes) {
        const html = renderRoute(template, r, routes);
        const file = r.path === '/' ? indexPath : path.join(outDir, r.path, 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
      }
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap(routes, today));
      fs.writeFileSync(path.join(outDir, 'llms.txt'), llmsTxt(routes));
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), llmsFull());
      console.log(`[seo] prerendered ${routes.length} routes, wrote sitemap.xml, llms.txt, llms-full.txt`);
    },
  };
}
