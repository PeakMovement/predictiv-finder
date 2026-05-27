import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CURRENT_CONSENT_VERSION } from '@/config/popia';

export default function Privacy() {
  return (
    <div className="relative min-h-screen bg-background text-foreground px-4 py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-0"
      />

      <article className="relative max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Privacy notice • POPIA
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Privacy Notice
          </h1>
          <p className="text-sm text-muted-foreground">
            Version {CURRENT_CONSENT_VERSION}. This is a working draft pending
            review by South African privacy counsel.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Who we are</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            Predictiv (&quot;we&quot;) provides directional guidance about
            South African healthcare costs and which type of specialist to
            see. We act as the responsible party under the Protection of
            Personal Information Act, 2013 (POPIA).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. What we collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-card-foreground/85">
            <li>The free-text health description you type into the assistant.</li>
            <li>Technical metadata (browser type, approximate region) used to keep the service reliable.</li>
            <li>If you sign in (future): your email and a record of your consent version.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Why we process it</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            We process your health description only to: (a) extract the
            apparent concern, (b) suggest a relevant medical specialty, and
            (c) estimate a price range in Rand. We rely on your{' '}
            <strong>explicit consent</strong> as the lawful basis under POPIA
            section 27 for processing health information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Who else sees it</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            Your description is forwarded (without your identifiers) to our
            backend and then to Google&apos;s Gemini model via the Lovable AI
            Gateway. The model returns a structured analysis. The AI provider
            does not train on your input. Servers may be located outside
            South Africa; by consenting you authorise this trans-border
            transfer under POPIA section 72.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">5. Retention</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            Anonymous sessions are not stored beyond what your browser keeps
            locally. If you create an account in a future release, interaction
            logs will be retained for up to 30 days for safety and quality
            purposes, then automatically redacted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">6. Your rights</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            You may withdraw consent at any time, request access to or
            deletion of any account-linked data, and lodge a complaint with
            the Information Regulator (South Africa). Contact us at{' '}
            <a className="text-primary hover:underline" href="mailto:privacy@predictiv.health">
              privacy@predictiv.health
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">7. Not medical advice</h2>
          <p className="text-card-foreground/85 leading-relaxed">
            Predictiv does not diagnose, treat, or replace a registered
            healthcare practitioner. In an emergency, call{' '}
            <span className="text-primary font-semibold">10177</span>.
          </p>
        </section>
      </article>
    </div>
  );
}
