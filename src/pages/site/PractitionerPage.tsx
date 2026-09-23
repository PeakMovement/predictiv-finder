import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, MapPin, Phone, Star } from 'lucide-react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { supabase } from '@/integrations/supabase/client';
import { useSeo } from '@/lib/seo';
import { track } from '@/lib/track';
import {
  LISTING_SELECT,
  UNCLAIMED_NOTICE,
  hasPublicRating,
  isUnclaimedListing,
  listingDisplayName,
  type Listing,
} from '@/seo/listings';
import {
  practitionerCrumbs,
  practitionerDescription,
  practitionerJsonLd,
  practitionerSlug,
  practitionerTitle,
  professionLabel,
} from '@/seo/practitioners';
import { CITY, PROFESSIONS, breadcrumbJsonLd } from '@/seo/site';

type LoadState = 'loading' | 'found' | 'missing';

export default function PractitionerPage() {
  const { slug } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    // slug is a generated column on some rows and derived from the practice
    // name on others, so match on the column first and fall back to scanning
    // approved listings for a derived match.
    (supabase as any)
      .from('professionals')
      .select(LISTING_SELECT)
      .eq('is_approved', true)
      .eq('slug', slug ?? '')
      .limit(1)
      .then(async ({ data }: { data: Listing[] | null }) => {
        if (cancelled) return;
        if (data && data.length) {
          setListing(data[0]);
          setState('found');
          return;
        }
        const { data: all } = await (supabase as any)
          .from('professionals')
          .select(LISTING_SELECT)
          .eq('is_approved', true);
        if (cancelled) return;
        const match = ((all ?? []) as Listing[]).find((l) => practitionerSlug(l) === slug);
        setListing(match ?? null);
        setState(match ? 'found' : 'missing');
      })
      .catch(() => {
        if (cancelled) return;
        setListing(null);
        setState('missing');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const path = `/practitioner/${slug ?? ''}`;

  useSeo({
    title: listing ? practitionerTitle(listing) : `Practitioner | ${CITY} | Predictiv`,
    description: listing ? practitionerDescription(listing) : '',
    path,
    // Never emit noindex from this page. Google renders it with JavaScript and
    // a slow or blocked lookup would otherwise drop a perfectly good profile
    // out of the index, which is exactly what happened to the blog in Sep 2026.
    keepPrerenderedJsonLd: state !== 'found',
    jsonLd: listing
      ? [breadcrumbJsonLd(practitionerCrumbs(listing)), practitionerJsonLd(listing, path)]
      : undefined,
  });

  useEffect(() => {
    if (state !== 'found' || !listing) return;
    track({ event_type: 'profile_view', professional_id: listing.id, profession: listing.profession, suburb: listing.suburb });
  }, [state, listing]);

  if (state === 'loading') {
    return (
      <PublicLayout>
        <p className="text-muted-foreground">Loading practitioner…</p>
      </PublicLayout>
    );
  }

  if (state === 'missing' || !listing) {
    return (
      <PublicLayout>
        <h1 className="text-3xl font-bold mb-3">Practitioner not found</h1>
        <p className="text-muted-foreground mb-6">
          This listing may have been removed at the practice's request, or the link may be out of date.
        </p>
        <Link to="/practitioners" className="text-primary font-semibold">
          Find a practitioner in {CITY}
        </Link>
      </PublicLayout>
    );
  }

  const name = listingDisplayName(listing);
  const professionSlug = PROFESSIONS.find((x) => x.db === listing.profession)?.slug ?? null;
  const backPath = professionSlug ? `/practitioners/${professionSlug}` : '/practitioners';

  return (
    <PublicLayout>
      <nav className="text-sm text-muted-foreground mb-4">
        <Link to="/practitioners" className="hover:text-foreground">Find a practitioner</Link>
        {professionSlug && (
          <>
            {' · '}
            <Link to={backPath} className="hover:text-foreground">
              {PROFESSIONS.find((x) => x.slug === professionSlug)?.plural}
            </Link>
          </>
        )}
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{name}</h1>
      <p className="text-muted-foreground mt-2">
        {professionLabel(listing)}
        {listing.suburb ? ` in ${listing.suburb}, ${CITY}` : ` in ${CITY}`}
      </p>

      {listing.practice_name && listing.name && listing.practice_name !== listing.name && (
        <p className="text-sm text-muted-foreground mt-1">{listing.name}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-4">
        {listing.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" aria-hidden />
            {listing.location}
          </span>
        )}
        {listing.contact_number && (
          <a
            href={`tel:${listing.contact_number.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => track({ event_type: 'outbound_click', professional_id: listing.id, link_type: 'phone' })}
          >
            <Phone className="h-4 w-4" aria-hidden />
            {listing.contact_number}
          </a>
        )}
        {hasPublicRating(listing) && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400" aria-hidden />
            {listing.rating!.toFixed(1)} ({listing.review_count} Google reviews)
          </span>
        )}
      </div>

      {listing.bio && <p className="mt-6 max-w-2xl leading-relaxed">{listing.bio}</p>}

      {listing.calendly_url && (
        <a
          href={listing.calendly_url}
          target="_blank"
          rel="noopener nofollow"
          onClick={() =>
            track({
              event_type: 'outbound_click',
              professional_id: listing.id,
              link_type: /calendly|book/i.test(listing.calendly_url ?? '') ? 'booking' : 'website',
            })
          }
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Visit practice website <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      )}

      {isUnclaimedListing(listing) && (
        <p className="mt-6 text-xs text-muted-foreground max-w-2xl">
          {UNCLAIMED_NOTICE}. If this is your practice and you would like the listing updated or
          removed, email predictivpty@gmail.com and we will action it.
        </p>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <Link to={backPath} className="text-primary font-semibold">
          See other {professionLabel(listing).toLowerCase()}s
          {listing.suburb ? ` near ${listing.suburb}` : ` in ${CITY}`}
        </Link>
      </div>
    </PublicLayout>
  );
}
