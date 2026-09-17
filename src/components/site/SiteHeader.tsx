import { Link, NavLink } from 'react-router-dom';

const nav = [
  { to: '/practitioners', label: 'Find a practitioner' },
  { to: '/assistant', label: 'Name your problem' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Predictiv home">
          <img src="/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-bold text-lg tracking-tight">Predictiv.</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 overflow-x-auto text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
