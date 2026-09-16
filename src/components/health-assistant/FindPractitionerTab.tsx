import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Loader2, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Professional = Tables<'professionals'>;

const PROFESSIONS = [
  'All',
  'Physiotherapist',
  'Biokineticist',
  'Dietician',
  'Sports Medicine',
  'Chiropractor',
  'General Practitioner',
];

// Same suburb centroids as the public finder app (web/lib/geo.ts) -- keep
// these two lists in sync if either grows.
const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  rondebosch: { lat: -33.9578, lng: 18.4747 },
  'cape-town-cbd': { lat: -33.9249, lng: 18.4241 },
  claremont: { lat: -33.9814, lng: 18.4642 },
  newlands: { lat: -33.9736, lng: 18.4589 },
  mowbray: { lat: -33.9483, lng: 18.4685 },
  observatory: { lat: -33.9394, lng: 18.4696 },
  pinelands: { lat: -33.9309, lng: 18.5119 },
};

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function rankScore(p: Professional, d: number | null): number {
  const reviewScore = (p.rating ?? 0) * Math.log10((p.review_count ?? 0) + 1);
  const proximityScore = d != null ? Math.max(0, 10 - d) : 0;
  const featuredBoost = p.is_featured ? 5 : 0;
  return reviewScore * 2 + proximityScore + featuredBoost;
}

// Real, self-serve website screenshot service -- no API key required.
// Renders in the visitor's own browser at view time, so it isn't testable
// from this dev sandbox's restricted network, but it's a standard public
// endpoint used widely for link-preview thumbnails.
function screenshotUrl(websiteUrl: string): string {
  return `https://image.thum.io/get/width/480/crop/480/noanimate/${encodeURIComponent(websiteUrl)}`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// Deterministic colour per practitioner so the fallback tiles stay visually
// distinct instead of all defaulting to the same brand colour.
const AVATAR_PALETTE = [
  'bg-rose-500/20 text-rose-300',
  'bg-amber-500/20 text-amber-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
  'bg-fuchsia-500/20 text-fuchsia-300',
];

function avatarClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

interface FindPractitionerTabProps {
  initialProfession?: string | null;
}

export function FindPractitionerTab({ initialProfession }: FindPractitionerTabProps) {
  const [all, setAll] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profession, setProfession] = useState(
    PROFESSIONS.find((p) => p.toLowerCase() === initialProfession?.toLowerCase()) ?? 'All'
  );
  const [suburb, setSuburb] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('professionals')
      .select('*')
      .eq('is_approved', true)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError('Could not load practitioners right now.');
        } else {
          setAll(data ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError("Your browser doesn't support location -- try typing a suburb instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Couldn't access your location. Try entering a suburb instead.");
        setLocating(false);
      }
    );
  };

  const resolvedCoords = useMemo(() => {
    if (coords) return coords;
    const key = suburb.trim().toLowerCase().replace(/\s+/g, '-');
    return SUBURB_COORDS[key] ?? null;
  }, [coords, suburb]);

  const results = useMemo(() => {
    const filtered = all.filter((p) => profession === 'All' || p.profession === profession);
    const withDistance = filtered.map((p) => {
      const d =
        resolvedCoords && p.latitude != null && p.longitude != null
          ? distanceKm(resolvedCoords.lat, resolvedCoords.lng, p.latitude, p.longitude)
          : null;
      return { p, d };
    });
    return withDistance.sort((a, b) => rankScore(b.p, b.d) - rankScore(a.p, a.d));
  }, [all, profession, resolvedCoords]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-sm text-muted-foreground">
          Search real, reviewed practitioners near you -- ranked by distance and rating.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={useMyLocation} disabled={locating} className="gap-2">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          Use my location
        </Button>
        <Input
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder="Or type a suburb, e.g. Rondebosch"
          className="max-w-xs"
        />
        <Select value={profession} onValueChange={setProfession}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFESSIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading practitioners…
        </p>
      )}
      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No practitioners match yet in this area -- try widening your search or a different specialty.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map(({ p, d }) => (
          <PractitionerCard key={p.id} p={p} d={d} />
        ))}
      </div>
    </div>
  );
}

function PractitionerCard({ p, d }: { p: Professional; d: number | null }) {
  const [imgFailed, setImgFailed] = useState(false);
  const website = p.calendly_url;
  const showImage = !!website && !imgFailed;

  return (
    <Card className="overflow-hidden border border-glass-border bg-glass backdrop-blur-xl flex flex-col">
      <div className="relative aspect-square w-full bg-muted/40">
        {showImage ? (
          <img
            src={screenshotUrl(website!)}
            alt={`${p.practice_name || p.name} website preview`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${avatarClass(p.name)}`}>
            {initials(p.name)}
          </div>
        )}
        {p.is_featured && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow">
            Featured
          </span>
        )}
        {p.rating != null && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white">
            <Star className="h-3 w-3 fill-current text-amber-400" />
            {p.rating.toFixed(1)}
            <span className="text-white/70 font-normal">({p.review_count ?? 0})</span>
          </span>
        )}
      </div>

      <CardContent className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h4 className="font-semibold text-foreground text-sm leading-tight truncate">{p.name}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {p.profession}
            {p.practice_name ? ` · ${p.practice_name}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          {p.location && <span className="truncate">{p.location}</span>}
          {d != null && <span>{d.toFixed(1)} km</span>}
          {p.price_min != null && (
            <span>
              R{p.price_min}
              {p.price_max ? `–R${p.price_max}` : ''}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          {p.calendly_url && (
            <Button asChild size="sm" className="flex-1">
              <a href={p.calendly_url} target="_blank" rel="noopener noreferrer">
                Book with {p.name.split(' ')[0]}
              </a>
            </Button>
          )}
          {p.google_reviews_url && (
            <Button asChild size="icon" variant="outline" className="shrink-0" title="View Google reviews">
              <a href={p.google_reviews_url} target="_blank" rel="noopener noreferrer">
                <Star className="h-4 w-4" />
              </a>
            </Button>
          )}
          {!p.google_reviews_url && p.calendly_url && (
            <Button asChild size="icon" variant="outline" className="shrink-0" title="Visit website">
              <a href={p.calendly_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FindPractitionerTab;
