import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Local guides on finding the right health practitioner, starting with Rondebosch.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-serif font-medium">Guides</h1>
      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <h2 className="text-xl font-semibold text-coldblue">{post.title}</h2>
            <p className="mt-1 text-marble/70">{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
