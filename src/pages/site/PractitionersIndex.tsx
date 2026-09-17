import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/site/PublicLayout';
import { useSeo } from '@/lib/seo';
import { DIRECTORY_PAGES, PROFESSIONS, SUBURBS, breadcrumbJsonLd, routeSeo } from '@/seo/site';

const route = routeSeo('/practitioners')!;
const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'Find a practitioner', path: '/practitioners' },
];

export default function PractitionersIndex() {
  useSeo({ title: route.title, description: route.description, path: route.path, jsonLd: breadcrumbJsonLd(crumbs) });
  return (
    <PublicLayout crumbs={crumbs}>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{route.h1}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Browse physiotherapists, chiropractors, biokineticists and GPs across the Southern Suburbs. Not sure who you need?{' '}
        <Link to="/assistant" className="text-primary underline underline-offset-4">Describe your problem</Link> and we will point you in the right direction.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {PROFESSIONS.map((p) => {
          const suburbs = DIRECTORY_PAGES.filter((d) => d.profession === p.slug)
            .map((d) => SUBURBS.find((s) => s.slug === d.suburb)!)
            .filter(Boolean);
          return (
            <section key={p.slug} className="rounded-2xl border border-border bg-card/50 p-6">
              <h2 className="text-xl font-bold">
                <Link to={`/practitioners/${p.slug}`} className="hover:text-primary">{p.plural} in Cape Town</Link>
              </h2>
              <p className="text-sm text-muted-foreground mt-2">{p.intro}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {suburbs.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/practitioners/${p.slug}/${s.slug}`} className="inline-block text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:text-primary">
                      {p.plural} in {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </PublicLayout>
  );
}
