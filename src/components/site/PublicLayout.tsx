import { Link } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

export interface Crumb { name: string; path: string }

export function PublicLayout({ children, crumbs }: { children: React.ReactNode; crumbs?: Crumb[] }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {crumbs && crumbs.length > 1 && (
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden>/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link to={c.path} className="hover:text-foreground">{c.name}</Link>
                  ) : (
                    <span aria-current="page" className="text-foreground">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
