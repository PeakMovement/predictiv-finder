import type { Faq } from '@/seo/site';

export function FaqSection({ faqs, title = 'Frequently asked questions' }: { faqs: Faq[]; title?: string }) {
  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-xl border border-border bg-card/50 p-4">
            <summary className="cursor-pointer font-semibold list-none flex justify-between gap-4">
              <h3 className="text-base">{f.q}</h3>
              <span className="text-primary group-open:rotate-45 transition-transform" aria-hidden>+</span>
            </summary>
            <p className="mt-2 text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
