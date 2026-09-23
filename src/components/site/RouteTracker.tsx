import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEngagement, trackPageView } from '@/lib/track';

/**
 * Fires one page_view per path change. Mounted once, inside the router.
 *
 * The ref guard matters twice over: React 18 StrictMode runs effects twice in
 * development, and a query string change (?utm_source=...) must not count as a
 * second view of the same page.
 */
export function RouteTracker() {
  const { pathname } = useLocation();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  // Restarted per path so each page gets its own engagement window.
  useEffect(() => trackEngagement(pathname), [pathname]);

  return null;
}
