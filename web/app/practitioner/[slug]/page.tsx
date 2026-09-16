import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfessionalBySlug } from "@/lib/supabase";
import { localBusinessJsonLd, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfessionalBySlug(slug);
  if (!p) return {};
  const title = `${p.name} — ${p.profession}${p.location ? ` in ${p.location}` : ""}`;
  const description =
    p.bio?.slice(0, 155) ??
    `${p.name} is a ${p.profession.toLowerCase()}${p.location ? ` based in ${p.location}` : ""}.`;
  return {
    title,
    description,
    alternates: { canonical: `/practitioner/${slug}` },
  };
}

export default async function PractitionerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProfessionalBySlug(slug);
  if (!p) notFound();

  const jsonLd = localBusinessJsonLd({
    name: p.name,
    profession: p.profession,
    slug: p.slug ?? p.id,
    bio: p.bio,
    location: p.location,
    latitude: p.latitude,
    longitude: p.longitude,
    rating: p.rating,
    reviewCount: p.review_count,
    photoUrl: p.photo_url,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Find a Practitioner", url: `${SITE_URL}/find-a-practitioner` },
    { name: p.name, url: `${SITE_URL}/practitioner/${p.slug ?? p.id}` },
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <h1 className="text-3xl font-serif font-medium">{p.name}</h1>
      <p className="mt-1 text-marble/70">
        {p.profession}
        {p.practice_name ? ` · ${p.practice_name}` : ""}
        {p.location ? ` · ${p.location}` : ""}
      </p>

      {p.rating != null && (
        <p className="mt-2 text-sm text-marble/80">
          ★ {p.rating.toFixed(1)} ({p.review_count} reviews)
        </p>
      )}

      {p.bio && <p className="mt-6 text-marble/90">{p.bio}</p>}

      {p.expertise_areas?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-marble/50">
            Areas of expertise
          </h2>
          <p className="mt-1 text-marble/80">{p.expertise_areas.join(", ")}</p>
        </div>
      )}

      {p.calendly_url && (
        <a
          href={p.calendly_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-full bg-coldblue px-6 py-3 text-sm font-medium text-void"
        >
          Book with {p.name.split(" ")[0]}
        </a>
      )}
    </main>
  );
}
