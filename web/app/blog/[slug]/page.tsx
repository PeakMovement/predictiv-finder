import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/posts";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: post.title, description: post.description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Guides", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <nav className="text-sm text-marble/50">
        <Link href="/blog">Guides</Link>
      </nav>
      <h1 className="mt-4 text-3xl font-serif font-medium">{post.title}</h1>
      <p className="mt-2 text-sm text-marble/50">
        {new Date(post.publishedAt).toLocaleDateString("en-ZA", { dateStyle: "long" })}
      </p>
      <div className="mt-8 space-y-4 text-marble/90">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="text-marble/80">Ready to book?</p>
        <Link href="/practitioners/rondebosch/physiotherapist" className="text-coldblue underline">
          See reviewed physiotherapists in Rondebosch
        </Link>
      </div>
    </main>
  );
}
