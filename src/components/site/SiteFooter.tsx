import { Link } from 'react-router-dom';
import { DIRECTORY_PAGES, PROFESSIONS, findProfession, findSuburb } from '@/seo/site';

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div className="space-y-2">
          <p className="font-bold text-base">Predictiv.</p>
          <p className="text-muted-foreground">
            Helping people in Cape Town understand who to see and find the right practitioner near them.
          </p>
          <p className="text-muted-foreground text-xs">
            Directional guidance only, not medical advice. In an emergency call an ambulance.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Practitioners</p>
          <ul className="space-y-1">
            {PROFESSIONS.map((p) => (
              <li key={p.slug}>
                <Link to={`/practitioners/${p.slug}`} className="text-muted-foreground hover:text-foreground">
                  {p.plural} in Cape Town
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">By suburb</p>
          <ul className="space-y-1">
            {DIRECTORY_PAGES.slice(0, 9).map((d) => {
              const p = findProfession(d.profession)!;
              const s = findSuburb(d.suburb)!;
              return (
                <li key={`${d.profession}-${d.suburb}`}>
                  <Link to={`/practitioners/${p.slug}/${s.slug}`} className="text-muted-foreground hover:text-foreground">
                    {p.plural} in {s.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Predictiv</p>
          <ul className="space-y-1">
            <li><Link to="/assistant" className="text-muted-foreground hover:text-foreground">Name your problem</Link></li>
            <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
            <li><a href="mailto:predictivpty@gmail.com" className="text-muted-foreground hover:text-foreground">Practitioners: get listed</a></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground pb-8">© {new Date().getFullYear()} Predictiv. Cape Town, South Africa.</p>
    </footer>
  );
}
