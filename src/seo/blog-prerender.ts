/**
 * Maps published CMS blog posts onto the same RouteSeo shape the Vite
 * prerender plugin uses for static pages. Kept free of React / fetch so the
 * build plugin can import it from Node.
 */
import { renderMarkdown } from '../lib/markdown';
import { resolvedAuthorName } from './eeat';
import { SITE_NAME, SITE_URL, type RouteSeo } from './site';

/** Reject anything that could escape dist/blog/<slug>/ when writing HTML. */
export const SAFE_BLOG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishedBlogPost = {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string | null;
  author_credential?: string | null;
  reviewer_name?: string | null;
  reviewer_credential?: string | null;
  published_at: string | null;
  updated_at: string;
  target_keyword: string | null;
};

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function blogPageTitle(post: Pick<PublishedBlogPost, 'title' | 'meta_title'>): string {
  return `${(post.meta_title || post.title).trim()} | ${SITE_NAME}`;
}

export function blogPageDescription(
  post: Pick<PublishedBlogPost, 'meta_description' | 'excerpt'>,
): string {
  return (post.meta_description || post.excerpt || 'Health and injury guides from Predictiv.').trim();
}

export function blogCanonical(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function blogPostToRoute(post: PublishedBlogPost): RouteSeo | null {
  if (!SAFE_BLOG_SLUG.test(post.slug)) return null;
  const description = blogPageDescription(post);
  return {
    path: `/blog/${post.slug}`,
    title: blogPageTitle(post),
    description,
    h1: post.title,
    intro: (post.excerpt || description).trim(),
    priority: 0.7,
    changefreq: 'monthly',
    ogType: 'article',
    image: post.cover_image_url || undefined,
    articleHtml: renderMarkdown(post.content || ''),
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    authorName: resolvedAuthorName(post.author_name),
    authorCredential: post.author_credential?.trim() || undefined,
    reviewerName: post.reviewer_name?.trim() || undefined,
    reviewerCredential: post.reviewer_credential?.trim() || undefined,
    keywords: post.target_keyword || undefined,
  };
}

/**
 * Guardrail for the prerender plugin: the HTML written for a post must not be
 * the homepage shell (the live bug) and must carry post-specific head + H1.
 */
export function assertPrerenderedBlogHtml(html: string, post: PublishedBlogPost): void {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const expectedTitle = escapeHtml(blogPageTitle(post));
  const expectedDescription = escapeHtml(blogPageDescription(post));
  const expectedCanonical = blogCanonical(post.slug);
  const homepageCanonical = `${SITE_URL}/`;

  if (title !== expectedTitle) {
    throw new Error(`blog ${post.slug}: title was ${JSON.stringify(title)}, expected ${JSON.stringify(expectedTitle)}`);
  }
  if (canonical !== expectedCanonical) {
    throw new Error(`blog ${post.slug}: canonical was ${JSON.stringify(canonical)}, expected ${JSON.stringify(expectedCanonical)}`);
  }
  if (canonical === homepageCanonical || canonical === SITE_URL) {
    throw new Error(`blog ${post.slug}: canonical still points at the homepage`);
  }
  const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1];
  if (ogUrl !== expectedCanonical) {
    throw new Error(`blog ${post.slug}: og:url was ${JSON.stringify(ogUrl)}, expected ${JSON.stringify(expectedCanonical)}`);
  }
  if (description !== expectedDescription) {
    throw new Error(`blog ${post.slug}: description was ${JSON.stringify(description)}`);
  }
  if (!html.includes(`<h1>${escapeHtml(post.title)}</h1>`)) {
    throw new Error(`blog ${post.slug}: missing H1 "${post.title}" in initial HTML`);
  }
}
