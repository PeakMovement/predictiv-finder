export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://predictiv.co.za";

export function localBusinessJsonLd(p: {
  name: string;
  profession: string;
  slug: string;
  bio?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  reviewCount?: number;
  photoUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: p.name,
    description: p.bio ?? undefined,
    url: `${SITE_URL}/practitioner/${p.slug}`,
    image: p.photoUrl ?? undefined,
    address: p.location
      ? { "@type": "PostalAddress", addressLocality: p.location, addressCountry: "ZA" }
      : undefined,
    geo:
      p.latitude && p.longitude
        ? { "@type": "GeoCoordinates", latitude: p.latitude, longitude: p.longitude }
        : undefined,
    medicalSpecialty: p.profession,
    aggregateRating:
      p.rating && p.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviewCount,
          }
        : undefined,
  };
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(pairs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: { "@type": "Answer", text: p.answer },
    })),
  };
}

// Practitioner bios/names are practitioner-supplied text that flows straight
// into JSON-LD <script> tags. JSON.stringify alone doesn't escape "</", so a
// bio containing "</script><script>..." could break out of the tag and
// execute. Escape it before ever handing JSON-LD to dangerouslySetInnerHTML.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
