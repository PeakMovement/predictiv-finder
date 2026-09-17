import { supabase } from '@/integrations/supabase/client';
import { plainText } from './markdown';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;

// blog_posts isn't in the generated Supabase types yet, so go through an
// untyped handle and cast results to BlogPost at the call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blogTable = () => (supabase as any).from('blog_posts');

/** Must match public.is_blog_admin() in the blog_posts migration. */
export const BLOG_ADMIN_EMAILS = ['predictivpty@gmail.com'];

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function wordCount(md: string): number {
  const t = plainText(md);
  return t ? t.split(' ').length : 0;
}

export function readingMinutes(md: string): number {
  return Math.max(1, Math.round(wordCount(md) / 220));
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface SeoCheck {
  label: string;
  pass: boolean;
  tip: string;
}

/** Live on-page SEO checklist shown in the blog editor. */
export function analyseSeo(p: Pick<BlogPostInput, 'title' | 'meta_title' | 'meta_description' | 'target_keyword' | 'slug' | 'content' | 'excerpt'>): SeoCheck[] {
  const kw = (p.target_keyword || '').trim().toLowerCase();
  const title = (p.meta_title || p.title || '').trim();
  const desc = (p.meta_description || '').trim();
  const text = plainText(p.content).toLowerCase();
  const words = text ? text.split(' ') : [];
  const first100 = words.slice(0, 100).join(' ');
  const h2s = [...p.content.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].toLowerCase());
  const kwWords = kw.split(/\s+/).filter(Boolean);
  const occurrences = kw ? (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length : 0;
  const density = words.length && kwWords.length ? (occurrences * kwWords.length * 100) / words.length : 0;
  const internalLinks = (p.content.match(/\]\((\/|https:\/\/(www\.)?predictiv\.co\.za)/g) || []).length;
  const externalLinks = (p.content.match(/\]\(https?:\/\/(?!(www\.)?predictiv\.co\.za)/g) || []).length;

  return [
    { label: 'Target keyword set', pass: !!kw, tip: 'Pick one search phrase this post should rank for, e.g. "physiotherapist Rondebosch".' },
    { label: 'Keyword in the SEO title', pass: !!kw && title.toLowerCase().includes(kw), tip: 'Put the exact keyword in the title, ideally near the start.' },
    { label: 'SEO title is 30 to 60 characters', pass: title.length >= 30 && title.length <= 60, tip: `Currently ${title.length}. Google cuts titles off at around 60.` },
    { label: 'Meta description is 120 to 160 characters', pass: desc.length >= 120 && desc.length <= 160, tip: `Currently ${desc.length}. This is the snippet people see in Google.` },
    { label: 'Keyword in the meta description', pass: !!kw && desc.toLowerCase().includes(kw), tip: 'Google bolds matching words in the snippet, which lifts clicks.' },
    { label: 'Short URL containing the keyword', pass: !!p.slug && p.slug.length <= 60 && kwWords.every((w) => p.slug.includes(slugify(w))), tip: 'Keep the URL short and include the keyword words.' },
    { label: 'Keyword in the first 100 words', pass: !!kw && first100.includes(kw), tip: 'Mention the keyword early so Google knows what the page is about.' },
    { label: 'At least 2 subheadings (##)', pass: h2s.length >= 2, tip: 'Break the post into sections with ## headings.' },
    { label: 'Keyword in at least one subheading', pass: !!kw && h2s.some((h) => kwWords.every((w) => h.includes(w))), tip: 'Use the keyword, or a close variation, in a ## heading.' },
    { label: 'At least 800 words', pass: words.length >= 800, tip: `Currently ${words.length}. Longer, genuinely useful posts rank better for local health searches.` },
    { label: 'Keyword density between 0.5% and 2.5%', pass: density >= 0.5 && density <= 2.5, tip: `Currently ${density.toFixed(1)}%. Use the keyword naturally, not stuffed.` },
    { label: 'Links to another Predictiv page', pass: internalLinks >= 1, tip: 'Link to [Find a practitioner](/assistant) or another blog post.' },
    { label: 'Links to a trusted outside source', pass: externalLinks >= 1, tip: 'Cite a reputable source, e.g. HPCSA, SASP, BASA or CASA.' },
    { label: 'Excerpt written', pass: !!(p.excerpt || '').trim(), tip: 'A one or two sentence summary shown on the blog list.' },
  ];
}

/** Local, low competition keyword ideas for Predictiv's launch suburbs. */
export const KEYWORD_IDEAS = [
  'physiotherapist Rondebosch',
  'chiropractor Claremont',
  'biokineticist Cape Town',
  'GP Rondebosch',
  'physiotherapist Newlands',
  'biokineticist Pinelands',
  'physio or chiro for back pain',
  'what does a biokineticist do',
  'who to see for knee pain Cape Town',
  'sports injury physio Southern Suburbs',
  'does medical aid cover physiotherapy',
  'chiropractor vs physiotherapist South Africa',
];
