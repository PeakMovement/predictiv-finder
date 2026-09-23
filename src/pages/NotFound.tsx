import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { track } from "@/lib/track";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    // A miss is demand for a page that does not exist yet. Someone looking for
    // /practitioners/physiotherapists/claremont before that page is built is
    // the clearest possible signal of which page to build next.
    track({ event_type: "not_found", page_path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-xl w-full flex flex-col items-center space-y-8 relative text-center">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"
        />
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            404 • Page not found
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          We couldn’t find <span className="text-primary">that page.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          The link may be broken or the page may have moved. Let’s get you back
          to a clear next step.
        </p>
        <Link
          to="/"
          className="group inline-flex items-center px-8 py-4 font-bold text-primary-foreground bg-primary rounded-2xl transition-all hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.6)] active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Predictiv
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
