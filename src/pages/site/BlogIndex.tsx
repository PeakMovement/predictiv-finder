import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { useSeo } from '@/lib/seo';
import { blogTable, formatDate, readingMinutes, type BlogPost } from '@/lib/blog';
import { breadcrumbJsonLd, routeSeo, SITE_URL } from '@/seo/site';

const route = routeSeo('/blog')!;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
];

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogTable()
      .select('id,slug,title,excerpt,content,cover_image_url,published_at,updated_at,author_name')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }: { data: BlogPost[] | null }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  useSeo({
    title: route.title,
    description: route.description,
    path: route.path,
    keepPrerenderedJsonLd: loading,
    jsonLd: loading
      ? undefined
      : [
          breadcrumbJsonLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            url: `${SITE_URL}/blog`,
            name: 'The Predictiv blog',
            blogPost: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `${SITE_URL}/blog/${p.slug}`,
              datePublished: p.published_at,
            })),
          },
        ],
  });

  return (
    <PublicLayout crumbs={crumbs}>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{route.h1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Plain language guides to help you understand your problem, and who in Cape Town is the best fit to help.
      </p>
      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">New guides are on the way. In the meantime, <Link to="/practitioners" className="text-primary underline">find a practitioner</Link>.</p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <li key={p.id}>
              <article className="h-full rounded-2xl border border-border bg-card/50 overflow-hidden hover:border-primary/40">
                <Link to={`/blog/${p.slug}`} className="block h-full">
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt="" loading="lazy" className="w-full aspect-[1200/630] object-cover" />
                  )}
                  <div className="p-6">
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={p.published_at ?? undefined}>{formatDate(p.published_at)}</time> · {readingMinutes(p.content)} min read
                    </p>
                    <h2 className="mt-2 text-xl font-bold leading-snug">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </PublicLayout>
  );
}
