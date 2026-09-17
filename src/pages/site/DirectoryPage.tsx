import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { FaqSection } from '@/components/site/FaqSection';
import { DirectoryList, listingsJsonLd, useListings } from '@/components/site/DirectoryList';
import { useSeo } from '@/lib/seo';
import {
  CITY, DIRECTORY_PAGES, PROFESSIONS, breadcrumbJsonLd, directoryDescription, directoryTitle, faqJsonLd,
  findProfession, findSuburb, hasDirectoryPage,
} from '@/seo/site';

export default function DirectoryPage() {
  const { profession, suburb } = useParams();
  const p = findProfession(profession);
  const s = findSuburb(suburb);
  const valid = !!p && !!s && hasDirectoryPage(p.slug, s.slug);
  const { listings, loading } = useListings(p?.db ?? '', s?.name);
  const path = `/practitioners/${profession}/${suburb}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Find a practitioner', path: '/practitioners' },
    { name: p?.plural ?? '', path: `/practitioners/${profession}` },
    { name: s?.name ?? '', path },
  ];
  useSeo({
    title: valid ? directoryTitle(p!, s!) : 'Not found | Predictiv',
    description: valid ? directoryDescription(p!, s!) : '',
    path,
    noindex: !valid,
    jsonLd: valid ? [breadcrumbJsonLd(crumbs), listingsJsonLd(listings, path), faqJsonLd(p!.faqs)] : undefined,
  });
  if (!valid) return <Navigate to={p ? `/practitioners/${p.slug}` : '/practitioners'} replace />;

  const otherTypes = PROFESSIONS.filter((o) => o.slug !== p!.slug && hasDirectoryPage(o.slug, s!.slug));
  const nearby = DIRECTORY_PAGES.filter((d) => d.profession === p!.slug && d.suburb !== s!.slug).map((d) => findSuburb(d.suburb)!);

  return (
    <PublicLayout crumbs={crumbs}>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{p!.plural} in {s!.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        Looking for a {p!.singular.toLowerCase()} in {s!.name}, {CITY}? {p!.intro} Below are {p!.plural.toLowerCase()} practising in and
        around {s!.name}. Book directly with the practice.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">{p!.plural} in {s!.name}</h2>
        <DirectoryList listings={listings} loading={loading} emptyText={`We are still adding ${p!.plural.toLowerCase()} in ${s!.name}.`} />
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-bold mb-2">What a {p!.singular.toLowerCase()} in {s!.name} can help with</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {p!.treats.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-bold mb-2">Not sure a {p!.singular.toLowerCase()} is right for you?</h2>
          <p className="text-sm text-muted-foreground">{p!.whenToSee}</p>
          <Link to="/assistant" className="inline-block mt-3 text-sm text-primary underline underline-offset-4">Describe your problem and see who fits best</Link>
        </div>
      </section>

      {(otherTypes.length > 0 || nearby.length > 0) && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-3">Related searches</h2>
          <ul className="flex flex-wrap gap-2">
            {otherTypes.map((o) => (
              <li key={o.slug}>
                <Link to={`/practitioners/${o.slug}/${s!.slug}`} className="inline-block text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:text-primary">
                  {o.plural} in {s!.name}
                </Link>
              </li>
            ))}
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link to={`/practitioners/${p!.slug}/${n.slug}`} className="inline-block text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:text-primary">
                  {p!.plural} in {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FaqSection faqs={p!.faqs} />
    </PublicLayout>
  );
}
