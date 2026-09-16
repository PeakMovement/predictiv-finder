import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-widest text-coldblue">Predictiv.</p>
        <h1 className="mt-3 text-4xl font-serif font-medium leading-tight sm:text-5xl">
          Get to the right practitioner, faster.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-marble/70">
          Search trusted physiotherapists, biokineticists and specialists near you,
          or tell us what's wrong and we'll point you in the right direction.
          Directional guidance only, not medical advice.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/find-a-practitioner"
          className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition hover:border-coldblue/60 hover:bg-white/10"
        >
          <h2 className="text-xl font-semibold">Find a Practitioner</h2>
          <p className="mt-2 text-sm text-marble/70">
            Search by location and specialty, ranked by real reviews and distance.
          </p>
        </Link>
        <Link
          href="/name-your-problem"
          className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition hover:border-coldblue/60 hover:bg-white/10"
        >
          <h2 className="text-xl font-semibold">Name Your Problem</h2>
          <p className="mt-2 text-sm text-marble/70">
            Describe what's going on and get directed to the specialist who typically helps.
          </p>
        </Link>
      </div>
    </main>
  );
}
