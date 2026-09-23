import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { FaqSection } from '@/components/site/FaqSection';
import { DirectoryList, listingsJsonLd, useListings } from '@/components/site/DirectoryList';
import { useSeo } from '@/lib/seo';
import { track } from '@/lib/track';

import {
  CITY, DIRECTORY_PAGES, SUBURBS, breadcrumbJsonLd, faqJsonLd, findProfession, phrasePlural, phraseSingular,
  professionDescription, professionTitle,
} from '@/seo/site';

export default function ProfessionPage() {
  const { profession } = useParams();
  const p = findProfession(profession);
  const { listings, loading, error } = useListings(p?.db ?? '', undefined);
  const path = `/practitioners/${profession}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Find a practitioner', path: '/practitioners' },
    { name: p ? p.plural : '', path },
  ];
  useSeo({
    title: p ? professionTitle(p) : 'Not found | Predictiv',
    description: p ? professionDescription(p) : '',
    path,
    noindex: !p,
    keepPrerenderedJsonLd: loading || !!error,
    jsonLd: p && !loading && !error ? [breadcrumbJsonLd(crumbs), faqJsonLd(p.faqs), listingsJsonLd(listings, path)] : undefined,
  });
  useEffect(() => {
    if (!p) return;
    track({ event_type: 'search', profession: p.slug, suburb: null });
  }, [p?.slug]);
  if (!p) return <Navigate to="/practitioners" replace />;


  const suburbs = DIRECTORY_PAGES.filter((d) => d.profession === p.slug).map((d) => SUBURBS.find((s) => s.slug === d.suburb)!);

  return (
    <PublicLayout crumbs={crumbs}>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{p.plural} in {CITY}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{p.intro}</p>

      <nav aria-label={`${p.plural} by suburb`} className="mt-6 flex flex-wrap gap-2">
        {suburbs.map((s) => (
          <Link key={s.slug} to={`/practitioners/${p.slug}/${s.slug}`} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:text-primary">
            {p.plural} in {s.name}
          </Link>
        ))}
      </nav>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">{p.plural} near you</h2>
          <DirectoryList listings={listings} loading={loading} error={error} profession={p.slug} emptyText={`We are still adding ${phrasePlural(p)} in ${CITY}.`} />
        </section>
        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="font-bold mb-2">What does a {phraseSingular(p)} treat?</h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {p.treats.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
          <section className="rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="font-bold mb-2">When should I see a {phraseSingular(p)}?</h2>
            <p className="text-sm text-muted-foreground">{p.whenToSee}</p>
            <Link to="/assistant" className="inline-block mt-3 text-sm text-primary underline underline-offset-4">
              Not sure? Describe your problem
            </Link>
          </section>
        </aside>
      </div>

      <FaqSection faqs={p.faqs} title={`${p.plural} in ${CITY}: common questions`} />
    </PublicLayout>
  );
}
