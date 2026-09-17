import { useEffect } from 'react';

import { SITE_URL, SITE_NAME, OG_IMAGE as DEFAULT_OG_IMAGE } from '@/seo/site';

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
export { breadcrumbJsonLd, faqJsonLd, organizationJsonLd } from '@/seo/site';

type JsonLd = Record<string, unknown>;

export interface SeoOptions {
  title: string;
  description: string;
  /** Path starting with "/", used for the canonical URL. */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-route on-page SEO for the client-rendered app: title, description,
 * canonical, robots, Open Graph / Twitter tags and page-level JSON-LD.
 */
export function useSeo(opts: SeoOptions) {
  const key = JSON.stringify(opts);
  useEffect(() => {
    const url = `${SITE_URL}${opts.path === '/' ? '/' : opts.path.replace(/\/$/, '')}`;
    const image = opts.image || DEFAULT_OG_IMAGE;
    document.title = opts.title;
    setMeta('name', 'description', opts.description);
    setMeta('name', 'robots', opts.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', opts.title);
    setMeta('property', 'og:description', opts.description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', opts.type || 'website');
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:locale', 'en_ZA');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', opts.title);
    setMeta('name', 'twitter:description', opts.description);
    setMeta('name', 'twitter:image', image);
    setCanonical(url);

    // The build prerenders static JSON-LD for the first page load; once React
    // takes over, this hook owns structured data, so drop those to avoid duplicates.
    document.querySelectorAll('script[data-prerendered]').forEach((el) => el.remove());
    const id = 'page-jsonld';
    document.getElementById(id)?.remove();
    if (opts.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.text = JSON.stringify(opts.jsonLd);
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function Seo(props: SeoOptions) {
  useSeo(props);
  return null;
}
