import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProfessionals } from "@/lib/supabase";
import { PractitionerCard } from "@/components/PractitionerCard";
import { SITE_URL, itemListJsonLd, breadcrumbJsonLd, faqJsonLd, safeJsonLd } from "@/lib/seo";

// Pilot suburb list. Rondebosch is the launch target; add the next suburb
// here once it has real, approved practitioners in the professionals table.
const LAUNCH_SUBURBS = ["rondebosch"];
const LAUNCH_PROFESSIONS = [
  "physiotherapist",
  "biokineticist",
  "chiropractor",
  "general-practitioner",
];

export function generateStaticParams() {
  return LAUNCH_SUBURBS.flatMap((suburb) =>
    LAUNCH_PROFESSIONS.map((profession) => ({ suburb, profession }))
  );
}

function titleCase(s: string) {
  return s
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function pluralProfession(profession: string) {
  return profession.endsWith("s") ? profession : `${profession}s`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ suburb: string; profession: string }>;
}): Promise<Metadata> {
  const { suburb, profession } = await params;
  const suburbName = titleCase(suburb);
  const professionName = titleCase(profession);
  const title = `${professionName}s in ${suburbName} | Reviewed & Ranked`;
  const description = `Compare ${professionName.toLowerCase()}s in ${suburbName}, ranked by real reviews and distance. See pricing, specialities and book directly.`;
  return {
    title,
    description,
    alternates: { canonical: `/practitioners/${suburb}/${profession}` },
    openGraph: { title, description, url: `${SITE_URL}/practitioners/${suburb}/${profession}` },
  };
}

export default async function SuburbProfessionPage({
  params,
}: {
  params: Promise<{ suburb: string; profession: string }>;
}) {
  const { suburb, profession } = await params;
  const suburbName = titleCase(suburb);
  const professionName = titleCase(profession);
  // Tolerate Supabase being unreachable at build/render time (e.g. a network
  // hiccup, or a locked-down build sandbox) rather than 500'ing the whole
  // page -- it just falls back to the "we're onboarding here" empty state.
  const professionals = await getApprovedProfessionals({
    suburb: suburbName,
    profession: professionName,
  }).catch(() => []);

  const pageUrl = `${SITE_URL}/practitioners/${suburb}/${profession}`;
  const itemListLd = itemListJsonLd(
    professionals.map((p) => ({ name: p.name, url: `${SITE_URL}/practitioner/${p.slug ?? p.id}` }))
  );
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Find a Practitioner", url: `${SITE_URL}/find-a-practitioner` },
    { name: `${professionName}s in ${suburbName}`, url: pageUrl },
  ]);
  const faqLd = faqJsonLd([
    {
      question: `How do I choose a ${professionName.toLowerCase()} in ${suburbName}?`,
      answer: `Compare real patient reviews, proximity to home or work, and specific specialities relevant to your issue. All practitioners listed here are approved and verified before appearing.`,
    },
    {
      question: `Can I book directly?`,
      answer: `Yes, each listing links straight to that practitioner's own booking page.`,
    },
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />

      <nav className="text-sm text-marble/50">
        <Link href="/">Home</Link> / <Link href="/find-a-practitioner">Find a Practitioner</Link> /{" "}
        {professionName}s in {suburbName}
      </nav>

      <h1 className="mt-4 text-3xl font-serif font-medium">
        {professionName}s in {suburbName}
      </h1>
      <p className="mt-2 text-marble/70">
        Ranked by real reviews and distance. Every practitioner below is approved and verified.
      </p>

      <div className="mt-8 space-y-4">
        {professionals.length === 0 && (
          <p className="text-marble/60">
            We're onboarding {professionName.toLowerCase()}s in {suburbName} right now. Are you one?{" "}
            <Link href="/join" className="text-coldblue underline">
              List your practice
            </Link>
            .
          </p>
        )}
        {professionals.map((p) => (
          <PractitionerCard key={p.id} p={p} />
        ))}
      </div>
    </main>
  );
}
