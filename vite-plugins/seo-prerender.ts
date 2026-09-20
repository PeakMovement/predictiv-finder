/**
 * Build-time SEO for the client-rendered app.
 *
 * For every public route in src/seo/site.ts this writes dist/<route>/index.html
 * with the right <title>, description, canonical, Open Graph tags, JSON-LD and
 * a readable HTML fallback inside #root (replaced by React on load). Crawlers
 * and AI answer engines that do not run JavaScript still get real content.
 *
 * Published blog posts live in Supabase, not in allRoutes(), so they are
 * fetched here at build time and written to dist/blog/<slug>/index.html.
 * Without that step, Lovable's SPA fallback serves the homepage shell for
 * every /blog/:slug URL (homepage title + canonical https://predictiv.co.za/).
 *
 * It also generates sitemap.xml, llms.txt and llms-full.txt from the same data.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../src/integrations/supabase/client';
import {
  assertPrerenderedBlogHtml,
  blogPostToRoute,
  escapeHtml,
  type PublishedBlogPost,
} from '../src/seo/blog-prerender';
import { isNamedPerson, organizationAuthorJsonLd, personJsonLd } from '../src/seo/eeat';
import {
  LISTING_SELECT,
  assertPrerenderedDirectoryHtml,
  listingsFallbackHtml,
  listingsFor,
  listingsJsonLd,
  type Listing,
} from '../src/seo/listings';
import { aboutFallbackHtml, practitionersIndexFallbackHtml, privacyFallbackHtml } from '../src/seo/static-pages';
import {
  CITY, HOME_FAQS, PROFESSIONS, SITE_NAME, SITE_URL, allRoutes, breadcrumbJsonLd, directoryFaqs,
  faqJsonLd, findProfession, findSuburb, organizationJsonLd, phraseSingular, type RouteSeo,
} from '../src/seo/site';

const esc = escapeHtml;

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
  } else if (parts[0] === 'blog' && parts[1]) {
    crumbs.push({ name: 'Blog', path: '/blog' });
    crumbs.push({ name: r.h1, path: r.path });
  } else if (parts[0]) {
    crumbs.push({ name: r.h1, path: r.path });
  }
  return crumbs;
}

function blogAuthorJsonLd(r: RouteSeo) {
  if (isNamedPerson(r.authorName)) {
    return personJsonLd(r.authorName!, { credential: r.authorCredential, url: `${SITE_URL}/about` });
  }
  return organizationAuthorJsonLd(r.authorName || SITE_NAME, SITE_URL);
}

function blogPostingJsonLd(r: RouteSeo) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: r.h1,
    description: r.description,
    image: r.image || `${SITE_URL}/og-image.png`,
    datePublished: r.datePublished,
    dateModified: r.dateModified || r.datePublished,
    author: blogAuthorJsonLd(r),
    publisher: {
      '@id': `${SITE_URL}/#organization`,
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: `${SITE_URL}${r.path}`,
    keywords: r.keywords,
    inLanguage: 'en-ZA',
  };
  if (isNamedPerson(r.reviewerName)) {
    node.reviewedBy = personJsonLd(r.reviewerName!, { credential: r.reviewerCredential });
  }
  return node;
}

function listingsForRoute(r: RouteSeo, listings: Listing[]): Listing[] {
  const parts = r.path.split('/').filter(Boolean);
  if (parts[0] !== 'practitioners' || !parts[1]) return [];
  const p = findProfession(parts[1]);
  if (!p) return [];
  const s = parts[2] ? findSuburb(parts[2]) : undefined;
  return listingsFor(listings, p.db, s?.name);
}

function jsonLdFor(r: RouteSeo, listings: Listing[]) {
  const blocks: unknown[] = [];
  const parts = r.path.split('/').filter(Boolean);
  if (r.path === '/') blocks.push(faqJsonLd(HOME_FAQS));
  else blocks.push(breadcrumbJsonLd(crumbsFor(r)));
  if (r.articleHtml) {
    blocks.push(blogPostingJsonLd(r));
    return blocks;
  }
  const p = parts[0] === 'practitioners' ? findProfession(parts[1]) : undefined;
  const s = parts[2] ? findSuburb(parts[2]) : undefined;
  if (listings.length) blocks.push(listingsJsonLd(listings, r.path));
  // City profession pages keep the shared clinical FAQs. Suburb pages use
  // locally distinct directory FAQs and point at the city page instead of
  // duplicating the same FAQPage JSON-LD.
  if (p && s) blocks.push(faqJsonLd(directoryFaqs(p, s)));
  else if (p) blocks.push(faqJsonLd(p.faqs));
  if (r.path === '/about') blocks.push({ '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE_URL}/about`, mainEntity: organizationJsonLd() });
  return blocks;
}

function fallbackBody(r: RouteSeo, routes: RouteSeo[], listings: Listing[]) {
  const parts = r.path.split('/').filter(Boolean);
  const p = parts[0] === 'practitioners' ? findProfession(parts[1]) : undefined;
  const s = parts[2] ? findSuburb(parts[2]) : undefined;
  let faqs = r.path === '/' ? HOME_FAQS : [];
  if (p && s) faqs = directoryFaqs(p, s);
  else if (p) faqs = p.faqs;
  let body = `<main style="max-width:860px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif">`;
  body += `<h1>${esc(r.h1)}</h1><p>${esc(r.intro)}</p>`;
  if (r.articleHtml) {
    if (isNamedPerson(r.authorName) || isNamedPerson(r.reviewerName)) {
      const bits: string[] = [];
      if (isNamedPerson(r.authorName)) {
        bits.push(`By ${esc(r.authorName!)}${r.authorCredential ? `, ${esc(r.authorCredential)}` : ''}`);
      }
      if (isNamedPerson(r.reviewerName)) {
        bits.push(`Reviewed by ${esc(r.reviewerName!)}${r.reviewerCredential ? `, ${esc(r.reviewerCredential)}` : ''}`);
      }
      body += `<p>${bits.join(' · ')}</p>`;
    }
    body += r.articleHtml;
    body += `<nav aria-label="Related"><p><a href="/blog">All guides</a> · <a href="/practitioners">Find a practitioner</a> · <a href="/assistant">Name your problem</a></p></nav>`;
    body += `<p><small>Predictiv gives directional guidance only, not medical advice. In an emergency call an ambulance.</small></p></main>`;
    return body;
  }
  if (r.path === '/blog') {
    const posts = routes.filter((x) => x.path.startsWith('/blog/') && x.path !== '/blog');
    if (posts.length) {
      body += `<h2>Latest guides</h2><ul>${posts.map((post) => `<li><a href="${post.path}">${esc(post.h1)}</a> — ${esc(post.description)}</li>`).join('')}</ul>`;
    }
  }
  if (r.path === '/about') body += aboutFallbackHtml();
  if (r.path === '/privacy') body += privacyFallbackHtml();
  if (r.path === '/practitioners') body += practitionersIndexFallbackHtml();
  if (p && listings.length) {
    body += `<h2>${esc(s ? `${p.plural} in ${s.name}` : `${p.plural} near you`)}</h2>`;
    body += listingsFallbackHtml(listings);
  } else if (p && !listings.length) {
    body += `<p>We are still adding ${esc(p.plural === 'GPs' ? 'GPs' : p.plural.toLowerCase())} in ${esc(s?.name ?? CITY)}.</p>`;
  }
  if (p) {
    body += `<h2>What does a ${esc(phraseSingular(p))} treat?</h2><ul>${p.treats.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    body += `<h2>When should I see a ${esc(phraseSingular(p))}?</h2><p>${esc(p.whenToSee)}</p>`;
    if (s) {
      body += `<p>Shared questions about what a ${esc(phraseSingular(p))} treats are on <a href="/practitioners/${p.slug}">${esc(p.plural)} in ${esc(CITY)}</a>.</p>`;
    }
  }
  if (r.path === '/') {
    body += `<h2>Which practitioner do I need?</h2><ul>${PROFESSIONS.map((x) => `<li><a href="/practitioners/${x.slug}">${esc(x.plural)} in Cape Town</a>: ${esc(x.whenToSee)}</li>`).join('')}</ul>`;
  }
  if (faqs.length) {
    body += `<h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
  }
  body += `<nav aria-label="Site"><h2>Explore Predictiv</h2><ul>${routes
    .filter((x) => x.path !== r.path && !x.articleHtml)
    .map((x) => `<li><a href="${x.path}">${esc(x.h1)}</a></li>`)
    .join('')}</ul></nav>`;
  body += `<p><small>Predictiv gives directional guidance only, not medical advice. In an emergency call an ambulance.</small></p></main>`;
  return body;
}

function renderRoute(template: string, r: RouteSeo, routes: RouteSeo[], listings: Listing[]) {
  const url = `${SITE_URL}${r.path}`;
  const image = r.image || `${SITE_URL}/og-image.png`;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(r.description)}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${r.ogType || 'website'}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(r.title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(r.description)}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(image)}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(r.title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(r.description)}" />`);
  html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(image)}" />`);
  if (r.datePublished) {
    html = setTag(html, /<meta property="article:published_time"[^>]*>/, `<meta property="article:published_time" content="${esc(r.datePublished)}" />`);
  }
  const ld = jsonLdFor(r, listings)
    .map((b) => `<script type="application/ld+json" data-prerendered>${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
  html = html.replace('</head>', `    ${ld}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${fallbackBody(r, routes, listings)}</div>`);
  return html;
}

function sitemap(routes: RouteSeo[], lastmod: string) {
  const urls = routes
    .map((r) => {
      const mod = (r.dateModified || r.datePublished || lastmod).slice(0, 10);
      return `  <url><loc>${SITE_URL}${r.path}</loc><lastmod>${mod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function llmsTxt(routes: RouteSeo[]) {
  const blogPosts = routes.filter((r) => r.path.startsWith('/blog/') && r.path !== '/blog');
  const lines = [
    '# Predictiv',
    '',
    '> Predictiv (predictiv.co.za) is a free Cape Town, South Africa platform that helps people find physiotherapists, chiropractors, biokineticists and GPs near them, and helps them understand which type of practitioner is the best fit for a simple problem. It gives directional guidance only, not a diagnosis.',
    '',
    'Coverage: Rondebosch, Claremont, Newlands, Pinelands, Kenilworth, Wynberg and Plumstead in the Southern Suburbs of Cape Town. Listings link to each practice\'s own website; people book directly with the practice. Contact: predictivpty@gmail.com.',
    '',
    '## Key pages',
    ...routes.filter((r) => r.path.split('/').length <= 3 && !r.articleHtml).map((r) => `- [${r.h1}](${SITE_URL}${r.path}): ${r.description}`),
    '',
    '## Practitioners by suburb',
    ...routes.filter((r) => r.path.split('/').length === 4).map((r) => `- [${r.h1}](${SITE_URL}${r.path})`),
    '',
    '## Blog',
    ...blogPosts.map((r) => `- [${r.h1}](${SITE_URL}${r.path}): ${r.description}`),
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

async function supabaseGet<T>(restPath: string): Promise<T> {
  const url = `${SUPABASE_URL}/rest/v1/${restPath}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`[seo] ${restPath} fetch failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function fetchPublishedBlogPosts(): Promise<PublishedBlogPost[]> {
  const core = [
    'slug',
    'title',
    'meta_title',
    'meta_description',
    'excerpt',
    'content',
    'cover_image_url',
    'author_name',
    'published_at',
    'updated_at',
    'target_keyword',
  ];
  const eeat = ['author_credential', 'reviewer_name', 'reviewer_credential'];
  try {
    return await supabaseGet<PublishedBlogPost[]>(
      `blog_posts?select=${[...core, ...eeat].join(',')}&status=eq.published&order=published_at.desc`,
    );
  } catch (err) {
    console.warn('[seo] blog_posts E-E-A-T columns unavailable, fetching without them:', err);
    return supabaseGet<PublishedBlogPost[]>(
      `blog_posts?select=${core.join(',')}&status=eq.published&order=published_at.desc`,
    );
  }
}

async function fetchApprovedListings(): Promise<Listing[]> {
  return supabaseGet<Listing[]>(
    `professionals?select=${LISTING_SELECT}&is_approved=eq.true&suburb=not.is.null&order=is_featured.desc,name.asc`,
  );
}

export function seoPrerender(): Plugin {
  let outDir = 'dist';
  return {
    name: 'predictiv-seo-prerender',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    // Vite preview's SPA fallback serves dist/index.html for extensionless
    // URLs even when dist/<route>/index.html exists. Lovable (and Netlify)
    // resolve those to the nested file, which is why /blog and /practitioners/...
    // already work in production. Rewrite here so `vite preview` matches that.
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [rawPath, search = ''] = (req.url ?? '').split('?');
        const pathname = decodeURIComponent(rawPath).replace(/\/+$/, '') || '/';
        if (pathname === '/' || path.extname(pathname)) {
          next();
          return;
        }
        const indexFile = path.join(outDir, pathname.replace(/^\//, ''), 'index.html');
        if (fs.existsSync(indexFile)) {
          req.url = `${pathname}/index.html${search ? `?${search}` : ''}`;
        }
        next();
      });
    },
    async closeBundle() {
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const template = fs.readFileSync(indexPath, 'utf8');
      const posts = await fetchPublishedBlogPosts();
      const listings = await fetchApprovedListings();
      const blogRoutes: RouteSeo[] = [];
      const skipped: string[] = [];
      for (const post of posts) {
        const route = blogPostToRoute(post);
        if (!route) {
          skipped.push(post.slug);
          continue;
        }
        blogRoutes.push(route);
      }
      if (skipped.length) {
        console.warn(`[seo] skipped blog slugs that are not safe path segments: ${skipped.join(', ')}`);
      }
      const routes = [...allRoutes(), ...blogRoutes];
      for (const r of routes) {
        const pageListings = listingsForRoute(r, listings);
        const html = renderRoute(template, r, routes, pageListings);
        const file = r.path === '/' ? indexPath : path.join(outDir, r.path, 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
      }
      for (const post of posts) {
        if (!blogRoutes.some((r) => r.path === `/blog/${post.slug}`)) continue;
        const html = fs.readFileSync(path.join(outDir, 'blog', post.slug, 'index.html'), 'utf8');
        assertPrerenderedBlogHtml(html, post);
      }
      for (const r of routes) {
        if (!r.path.startsWith('/practitioners/') || r.path.split('/').filter(Boolean).length < 3) continue;
        const pageListings = listingsForRoute(r, listings);
        const html = fs.readFileSync(path.join(outDir, r.path, 'index.html'), 'utf8');
        assertPrerenderedDirectoryHtml(html, pageListings, r.path);
      }
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap(routes, today));
      fs.writeFileSync(path.join(outDir, 'llms.txt'), llmsTxt(routes));
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), llmsFull());
      console.log(
        `[seo] prerendered ${routes.length} routes (${blogRoutes.length} blog posts, ${listings.length} listings), wrote sitemap.xml, llms.txt, llms-full.txt`,
      );
    },
  };
}
