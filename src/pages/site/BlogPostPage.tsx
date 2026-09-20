import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { useSeo } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import { blogTable, formatDate, readingMinutes, type BlogPost } from '@/lib/blog';
import { blogAuthorJsonLd, isNamedPerson, personJsonLd, resolvedAuthorName } from '@/seo/eeat';
import { breadcrumbJsonLd, OG_IMAGE, SITE_URL } from '@/seo/site';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    setState('loading');
    blogTable()
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }: { data: BlogPost | null }) => {
        setPost(data);
        setState(data ? 'ready' : 'missing');
      });
  }, [slug]);

  const html = useMemo(() => (post ? renderMarkdown(post.content) : ''), [post]);
  const authorName = resolvedAuthorName(post?.author_name);
  const path = `/blog/${slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post?.title ?? 'Post', path },
  ];

  useSeo({
    title: post ? `${post.meta_title || post.title} | Predictiv` : state === 'missing' ? 'Post not found | Predictiv' : 'Predictiv blog',
    description: post?.meta_description || post?.excerpt || 'Health and injury guides from Predictiv.',
    path,
    type: 'article',
    image: post?.cover_image_url || undefined,
    noindex: state === 'missing',
    keepPrerenderedJsonLd: state === 'loading',
    jsonLd: post
      ? [
          breadcrumbJsonLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.meta_description || post.excerpt || undefined,
            image: post.cover_image_url || OG_IMAGE,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: blogAuthorJsonLd(post.author_name, post.author_credential, `${SITE_URL}/about`),
            ...(isNamedPerson(post.reviewer_name)
              ? { reviewedBy: personJsonLd(post.reviewer_name!, { credential: post.reviewer_credential }) }
              : {}),
            publisher: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: 'Predictiv', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
            mainEntityOfPage: `${SITE_URL}${path}`,
            keywords: post.target_keyword || undefined,
            inLanguage: 'en-ZA',
          },
        ]
      : undefined,
  });

  if (state === 'loading') {
    return <PublicLayout><p className="text-muted-foreground">Loading…</p></PublicLayout>;
  }
  if (!post) {
    return (
      <PublicLayout>
        <h1 className="text-3xl font-bold">Post not found</h1>
        <p className="mt-4 text-muted-foreground">This guide may have moved. <Link to="/blog" className="text-primary underline">See all guides</Link>.</p>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout crumbs={crumbs}>
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <p className="text-sm text-muted-foreground">
            <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time> · {readingMinutes(post.content)} min read
            {isNamedPerson(authorName) ? (
              <>
                {' · '}
                <span itemProp="author">{authorName}{post.author_credential ? `, ${post.author_credential}` : ''}</span>
              </>
            ) : (
              <> · {authorName}</>
            )}
          </p>
          {isNamedPerson(post.reviewer_name) && (
            <p className="mt-1 text-sm text-muted-foreground">
              Reviewed by {post.reviewer_name}{post.reviewer_credential ? `, ${post.reviewer_credential}` : ''}
            </p>
          )}
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
        </header>
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mb-8 aspect-[1200/630] object-cover" />
        )}
        <div className="prose prose-invert prose-lg max-w-none prose-a:text-primary" dangerouslySetInnerHTML={{ __html: html }} />
        <aside className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="text-xl font-bold">Not sure who to see?</h2>
          <p className="mt-2 text-muted-foreground">Describe your problem and Predictiv will point you to the right type of practitioner near you in Cape Town.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/assistant" className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Name your problem</Link>
            <Link to="/practitioners" className="rounded-xl border border-primary/40 px-5 py-2.5 font-semibold">Find a practitioner</Link>
          </div>
        </aside>
        <p className="mt-8 text-xs text-muted-foreground">
          This article is general information, not medical advice. If you are worried about your health, see a registered practitioner. In an emergency, call an ambulance.
        </p>
      </article>
    </PublicLayout>
  );
}
