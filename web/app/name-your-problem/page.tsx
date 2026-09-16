"use client";

import { useEffect, useMemo, useState } from "react";
import { analyzeSymptom, type TriageResult } from "@/lib/matching";
import { getApprovedProfessionals, type Professional } from "@/lib/supabase";
import { PractitionerCard } from "@/components/PractitionerCard";

export default function NameYourProblemPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TriageResult | null>(null);
  const [matches, setMatches] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!result || result.redFlag || result.professions.length === 0) {
      setMatches([]);
      return;
    }
    setLoading(true);
    Promise.all(result.professions.map((prof) => getApprovedProfessionals({ profession: prof })))
      .then((lists) => setMatches(lists.flat()))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [result]);

  const disclaimer = useMemo(
    () =>
      "This is directional guidance based on what you've described, not a medical diagnosis. If you're unsure or symptoms are severe, see a doctor.",
    []
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-serif font-medium">Name Your Problem</h1>
      <p className="mt-2 text-marble/70">
        Describe what's going on in your own words. A couple of sentences is enough.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(analyzeSymptom(text));
        }}
        className="mt-8"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="e.g. My lower back has been sore for two weeks, worse when I sit for a while"
          className="w-full rounded-xl border border-white/20 bg-transparent p-4 placeholder:text-marble/40"
        />
        <button
          type="submit"
          disabled={text.trim().length < 5}
          className="mt-3 rounded-full bg-coldblue px-5 py-2 text-sm font-medium text-void disabled:opacity-40"
        >
          Get guidance
        </button>
      </form>

      {result && (
        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          {result.redFlag ? (
            <p className="font-medium text-red-400">{result.redFlagMessage}</p>
          ) : (
            <>
              <p className="text-marble/90">{result.summary}</p>
              <p className="mt-3 text-sm text-marble/50">{disclaimer}</p>
            </>
          )}
        </div>
      )}

      {!result?.redFlag && (matches.length > 0 || loading) && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Recommended for you</h2>
          <div className="mt-4 space-y-4">
            {loading && <p className="text-marble/60">Finding matches…</p>}
            {matches.map((p) => (
              <PractitionerCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
