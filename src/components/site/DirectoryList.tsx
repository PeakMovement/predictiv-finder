import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, Phone, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LISTING_SELECT, listingsJsonLd, type Listing } from '@/seo/listings';

export type { Listing };
export { listingsJsonLd };

export function useListings(professionDb: string, suburbName?: string) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase as any)
      .from('professionals')
      .select(LISTING_SELECT)
      .eq('is_approved', true)
      .eq('profession', professionDb)
      .not('suburb', 'is', null)
      .order('is_featured', { ascending: false })
      .order('name');
    if (suburbName) q = q.eq('suburb', suburbName);
    q.then(({ data }: { data: Listing[] | null }) => {
      if (cancelled) return;
      setListings(data ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [professionDb, suburbName]);
  return { listings, loading };
}

export function DirectoryList({ listings, loading, emptyText }: { listings: Listing[]; loading: boolean; emptyText: string }) {
  if (loading) return <p className="text-muted-foreground">Loading practitioners…</p>;
  if (!listings.length) return <p className="text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <li key={l.id} className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold leading-tight">{l.practice_name || l.name}</h3>
            {l.practice_name && l.practice_name !== l.name && (
              <p className="text-sm text-muted-foreground">{l.name}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {l.suburb && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{l.suburb}</span>
            )}
            {l.rating != null && (
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" aria-hidden />{l.rating.toFixed(1)} ({l.review_count ?? 0})</span>
            )}
            {l.contact_number && (
              <a href={`tel:${l.contact_number.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1 hover:text-foreground">
                <Phone className="h-3 w-3" aria-hidden />{l.contact_number}
              </a>
            )}
          </div>
          {l.calendly_url && (
            <a
              href={l.calendly_url}
              target="_blank"
              rel="noopener nofollow"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Visit practice website <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
