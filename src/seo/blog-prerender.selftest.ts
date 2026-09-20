import { blogCanonical, blogPageDescription, blogPageTitle, blogPostToRoute, type PublishedBlogPost } from './blog-prerender';
import { SITE_NAME, SITE_URL } from './site';

const post: PublishedBlogPost = {
  slug: 'what-does-a-biokineticist-do',
  title: 'What Does a Biokineticist Do? A Plain-Language Guide',
  meta_title: 'What Does a Biokineticist Do? A Simple Guide',
  meta_description:
    'What does a biokineticist do? Learn how this South African exercise profession helps with injuries and chronic conditions, and what to expect.',
  excerpt: 'Biokinetics is a uniquely South African profession.',
  content: 'A biokineticist uses **exercise** to rehabilitate injuries.\n\n## Who they help\n\nPeople recovering from injury.',
  cover_image_url: null,
  author_name: 'Predictiv',
  published_at: '2026-09-17T00:49:21.143826+00:00',
  updated_at: '2026-09-17T06:49:21.143826+00:00',
  target_keyword: 'what does a biokineticist do',
};

const route = blogPostToRoute(post);
if (!route) throw new Error('expected a route for a safe slug');
if (route.path !== '/blog/what-does-a-biokineticist-do') throw new Error(route.path);
if (route.title !== `What Does a Biokineticist Do? A Simple Guide | ${SITE_NAME}`) throw new Error(route.title);
if (route.h1 !== post.title) throw new Error(route.h1);
if (route.description !== post.meta_description) throw new Error(route.description);
if (route.ogType !== 'article') throw new Error(String(route.ogType));
if (!route.articleHtml?.includes('<h2>Who they help</h2>')) throw new Error(String(route.articleHtml));
if (blogCanonical(post.slug) !== `${SITE_URL}/blog/${post.slug}`) throw new Error('canonical');
if (blogPageTitle(post).includes('Find a Physio')) throw new Error('title leaked homepage copy');
if (blogPageDescription(post).includes('Find trusted physiotherapists')) throw new Error('description leaked homepage copy');

const unsafe = blogPostToRoute({ ...post, slug: '../etc/passwd' });
if (unsafe !== null) throw new Error('unsafe slug must be rejected');

console.log('blog-prerender unit checks passed');
