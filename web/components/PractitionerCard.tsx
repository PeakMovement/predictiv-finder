import Link from "next/link";
import type { Professional } from "@/lib/supabase";

export function PractitionerCard({
  p,
  distanceKm,
}: {
  p: Professional;
  distanceKm?: number | null;
}) {
  return (
    <Link
      href={`/practitioner/${p.slug ?? p.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-coldblue/60 hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-marble">{p.name}</h3>
          <p className="text-sm text-marble/70">
            {p.profession}
            {p.practice_name ? ` · ${p.practice_name}` : ""}
          </p>
        </div>
        {p.is_featured && (
          <span className="shrink-0 rounded-full bg-coldblue/20 px-2 py-1 text-xs font-medium text-coldblue">
            Featured
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-marble/80">
        {p.rating != null && (
          <span>
            ★ {p.rating.toFixed(1)} ({p.review_count} review{p.review_count === 1 ? "" : "s"})
          </span>
        )}
        {p.location && <span>{p.location}</span>}
        {distanceKm != null && <span>{distanceKm.toFixed(1)} km away</span>}
        {p.price_min != null && (
          <span>
            R{p.price_min}
            {p.price_max ? `–R${p.price_max}` : ""}
          </span>
        )}
      </div>

      {p.specialities?.length > 0 && (
        <p className="mt-2 text-sm text-marble/60">{p.specialities.slice(0, 3).join(", ")}</p>
      )}
    </Link>
  );
}
