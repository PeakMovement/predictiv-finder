import { Suspense } from "react";
import type { Metadata } from "next";
import { FindAPractitionerClient } from "./FindAPractitionerClient";

export const metadata: Metadata = {
  title: "Find a Practitioner",
  description:
    "Search trusted physiotherapists, biokineticists, chiropractors and GPs near you, ranked by real reviews and distance.",
  alternates: { canonical: "/find-a-practitioner" },
};

export default function FindAPractitionerPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-marble/60">Loading…</p>
        </main>
      }
    >
      <FindAPractitionerClient />
    </Suspense>
  );
}
