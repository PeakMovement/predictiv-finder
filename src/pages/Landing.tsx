import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    eyebrow: 'The Summary',
    body: "Plain-language explanations of your concerns, stripped of medical jargon.",
  },
  {
    eyebrow: 'SA Pricing',
    body: 'Estimated cost ranges in Rand (R) based on typical South African specialist rates.',
  },
  {
    eyebrow: 'The Expert',
    body: 'Identify exactly which type of specialist typically treats your specific situation.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6 md:p-8">
      <div className="max-w-4xl w-full flex flex-col items-center space-y-12 relative">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"
        />

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Directional guidance • Not medical advice
          </span>
        </div>

        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Navigate Your Health
            <br />
            <span className="text-primary">With Certainty.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Healthcare in South Africa can be a maze of costs and confusion.
            Predictiv helps you turn concerns into a clear path forward —
            understand your symptoms in plain language, see what care typically
            costs in Rand, and know which specialist to see, all before you book
            a single appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {features.map((f) => (
            <div
              key={f.eyebrow}
              className="group p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-md hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                {f.eyebrow}
              </h3>
              <p className="text-card-foreground/80 text-sm leading-snug">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-6 pt-4">
          <Link
            to="/assistant"
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-primary-foreground transition-all duration-200 bg-primary rounded-2xl hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)] active:scale-95"
          >
            <span className="relative flex items-center">
              Start with Predictiv
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>

          <div className="flex items-center space-x-3 text-muted-foreground text-sm font-medium">
            <span>Purpose-built for South Africa</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Localized Guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
