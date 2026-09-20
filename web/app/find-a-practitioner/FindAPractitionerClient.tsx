"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApprovedProfessionals, type Professional } from "@/lib/supabase";
import { distanceKm, rankScore, SUBURB_COORDS } from "@/lib/geo";
import { PractitionerCard } from "@/components/PractitionerCard";

const PROFESSIONS = [
  "All",
  "Physiotherapist",
  "Biokineticist",
  "Chiropractor",
  "General Practitioner",
];

// Coming from the "Name Your Problem" / directional-guidance flow (either
// in this app or the legacy assistant app) with ?profession=Physiotherapist
// should land here pre-filtered, not dump the person back into "All" and
// make them redo the choice they already made. Matching is case-insensitive
// and tolerant of a couple of common label mismatches between the two apps.
function resolveProfessionParam(raw: string | null): string {
  if (!raw) return "All";
  const norm = raw.trim().toLowerCase();
  const alias: Record<string, string> = {
    gp: "General Practitioner",
    "general physician": "General Practitioner",
    physio: "Physiotherapist",
    biokinetics: "Biokineticist",
  };
  if (alias[norm]) return alias[norm];
  const match = PROFESSIONS.find((p) => p.toLowerCase() === norm);
  return match ?? "All";
}

export function FindAPractitionerClient() {
  const searchParams = useSearchParams();
  const [all, setAll] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profession, setProfession] = useState(() =>
    resolveProfessionParam(searchParams.get("profession"))
  );
  const [suburb, setSuburb] = useState(() => searchParams.get("suburb") ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getApprovedProfessionals()
      .then(setAll)
      .catch((e) => setError(e.message ?? "Could not load practitioners."))
      .finally(() => setLoading(false));
  }, []);

  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Couldn't access your location. Try entering a suburb instead.")
    );
  }

  const resolvedCoords = useMemo(() => {
    if (coords) return coords;
    const key = suburb.trim().toLowerCase().replace(/\s+/g, "-");
    return SUBURB_COORDS[key] ?? null;
  }, [coords, suburb]);

  const results = useMemo(() => {
    const filtered = all.filter(
      (p) => profession === "All" || p.profession === profession
    );
    const withDistance = filtered.map((p) => {
      const d =
        resolvedCoords && p.latitude != null && p.longitude != null
          ? distanceKm(resolvedCoords.lat, resolvedCoords.lng, p.latitude, p.longitude)
          : null;
      return { p, d };
    });
    return withDistance.sort(
      (a, b) =>
        rankScore({ ...b.p, distanceKm: b.d }) - rankScore({ ...a.p, distanceKm: a.d })
    );
  }, [all, profession, resolvedCoords]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-serif font-medium">Find a Practitioner</h1>
      <p className="mt-2 text-marble/70">
        Filter by specialty and suburb. Distance ranking uses your location when you share it.
      </p>
      {profession !== "All" && searchParams.get("profession") && (
        <p className="mt-3 inline-block rounded-full bg-coldblue/15 px-4 py-1.5 text-sm text-coldblue">
          Showing {profession}s based on what you told us -- change the filter below anytime.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={useMyLocation}
          className="rounded-full bg-coldblue px-4 py-2 text-sm font-medium text-void"
        >
          Use my location
        </button>
        <input
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder="Or type a suburb, e.g. Rondebosch"
          className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm placeholder:text-marble/40"
        />
        <select
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="rounded-full border border-white/20 bg-void px-4 py-2 text-sm"
        >
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 space-y-4">
        {loading && <p className="text-marble/60">Loading practitioners…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && results.length === 0 && (
          <p className="text-marble/60">No practitioners match yet in this area.</p>
        )}
        {results.map(({ p, d }) => (
          <PractitionerCard key={p.id} p={p} distanceKm={d} />
        ))}
      </div>
    </main>
  );
}
