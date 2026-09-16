import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Loader2 } from 'lucide-react';
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

      <div className="space-y-3">
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
        {results.map(({ p, d }) => (
          <Card key={p.id} className="border border-glass-border bg-glass backdrop-blur-xl">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{p.name}</h4>
                  {p.is_featured && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.profession}
                  {p.practice_name ? ` · ${p.practice_name}` : ''}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {p.rating != null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> {p.rating.toFixed(1)} (
                      {p.review_count ?? 0})
                    </span>
                  )}
                  {p.location && <span>{p.location}</span>}
                  {d != null && <span>{d.toFixed(1)} km away</span>}
                  {p.price_min != null && (
                    <span>
                      R{p.price_min}
                      {p.price_max ? `–R${p.price_max}` : ''}
                    </span>
                  )}
                </div>
              </div>
              {p.calendly_url && (
                <Button asChild size="sm" className="shrink-0">
                  <a href={p.calendly_url} target="_blank" rel="noopener noreferrer">
                    Book with {p.name.split(' ')[0]}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FindPractitionerTab;
