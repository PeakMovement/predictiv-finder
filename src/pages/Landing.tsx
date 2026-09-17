import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageSquareText } from 'lucide-react';
import { PublicLayout } from '@/components/site/PublicLayout';
import { FaqSection } from '@/components/site/FaqSection';
import { useSeo } from '@/lib/seo';
import { HOME_FAQS, PROFESSIONS, faqJsonLd, routeSeo } from '@/seo/site';

const route = routeSeo('/')!;

export default function Landing() {
  useSeo({
    title: route.title,
    description: route.description,
    path: '/',
    // Organization and WebSite are declared once, statically, in index.html.
    jsonLd: faqJsonLd(HOME_FAQS),
  });

  return (
    <PublicLayout>
      <section className="text-center space-y-6 py-8 md:py-16 relative">
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold uppercase tracking-widest text-primary">
          Free to use • Cape Town
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
          Find the right practitioner
          <br />
          <span className="text-primary">near you in Cape Town</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
          Search physiotherapists, chiropractors, biokineticists and GPs in Rondebosch and the Southern Suburbs, or describe a
          simple problem and Predictiv will point you to the type of practitioner who is the best fit to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/practitioners" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl bg-primary text-primary-foreground hover:opacity-90">
            <MapPin className="w-5 h-5" aria-hidden /> Find a practitioner
          </Link>
          <Link to="/assistant" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-2xl border border-primary/40 hover:bg-primary/10">
            <MessageSquareText className="w-5 h-5" aria-hidden /> Name your problem
          </Link>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold mb-6">How Predictiv works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ['Tell us what is wrong', 'Describe your problem in plain language, like sore lower back after gym or knee pain when running.'],
            ['See who is the best fit', 'Predictiv suggests whether a physiotherapist, chiropractor, biokineticist or GP usually helps with that kind of problem.'],
            ['Book with a local practice', 'Browse practitioners near you and book directly with the practice. No fees, no middleman.'],
          ].map(([t, b], i) => (
            <li key={t} className="rounded-2xl border border-border bg-card/50 p-6">
              <p className="text-primary font-bold text-sm mb-1">Step {i + 1}</p>
              <h3 className="font-semibold mb-2">{t}</h3>
              <p className="text-sm text-muted-foreground">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="types-heading">
        <h2 id="types-heading" className="text-2xl font-bold mb-6">Which practitioner do I need?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROFESSIONS.map((p) => (
            <Link key={p.slug} to={`/practitioners/${p.slug}`} className="group rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/40">
              <h3 className="font-semibold text-lg flex items-center justify-between">
                {p.plural} in Cape Town
                <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{p.whenToSee}</p>
            </Link>
          ))}
        </div>
      </section>

      <FaqSection faqs={HOME_FAQS} />
    </PublicLayout>
  );
}
