import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSeo } from '@/lib/seo';
import { BLOG_ADMIN_EMAILS } from '@/lib/blog';

interface EventRow {
  created_at: string;
  event_type: string;
  query: string | null;
  profession: string | null;
  suburb: string | null;
  result_count: number | null;
  professional_id: string | null;
  link_type: string | null;
}

const DAYS = 30;

interface DailyRow {
  day: string;
  page_views: number;
  visits: number;
  visitors: number;
  outbound_clicks: number;
  searches: number;
}
interface PageRow {
  page_path: string;
  page_views: number;
  visits: number;
}
interface MissingRow {
  page_path: string;
  misses: number;
  visits: number;
}
interface EngagementRow {
  page_path: string;
  views: number;
  engaged: number;
  engaged_pct: number | null;
}
interface SourceRow {
  source: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  visits: number;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const withPassword = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : null);
    setBusy(false);
  };
  const withLink = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin/insights` },
    });
    setMsg(error ? error.message : 'Check your inbox for a sign in link.');
    setBusy(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4 rounded-2xl border border-border bg-card/50 p-6">
      <h1 className="text-2xl font-bold">Insights</h1>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button className="w-full" disabled={busy || !password || !email} onClick={withPassword}>Sign in</Button>
      <Button className="w-full" variant="outline" disabled={busy || !email} onClick={withLink}>Email me a sign in link</Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Table({
  title,
  headers,
  rows,
  empty,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  empty: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/50 p-5">
      <h2 className="font-bold mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                {headers.map((h) => (
                  <th key={h} className="pb-2 pr-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/60">
                  {r.map((c, j) => (
                    <td key={j} className="py-2 pr-4 align-top">{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function topCounts(values: (string | null | undefined)[], limit: number) {
  const map = new Map<string, number>();
  for (const v of values) {
    const key = (v ?? '').trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export default function InsightsAdmin() {
  useSeo({
    title: 'Insights | Predictiv',
    description: 'Directory usage insights',
    path: '/admin/insights',
    noindex: true,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  // The reporting views arrive with the 20260923 migration. Until it has been
  // applied the traffic section stays hidden rather than erroring the page.
  const [viewsReady, setViewsReady] = useState(true);
  const [missing, setMissing] = useState<MissingRow[]>([]);
  const [engagement, setEngagement] = useState<EngagementRow[]>([]);
  // Missing pages and engagement arrive with the second 20260923 migration.
  const [extraReady, setExtraReady] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = !!session?.user.email && BLOG_ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data, error: qErr } = await (supabase as any)
      .from('directory_events')
      .select('created_at,event_type,query,profession,suburb,result_count,professional_id,link_type')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50000);

    if (qErr) {
      setError(qErr.message || 'Could not load insights.');
      setEvents([]);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as EventRow[];
    setEvents(rows);

    const ids = [...new Set(rows.map((r) => r.professional_id).filter(Boolean))] as string[];
    if (ids.length) {
      const { data: pros } = await (supabase as any)
        .from('professionals')
        .select('id,name,practice_name')
        .in('id', ids);
      const map: Record<string, string> = {};
      for (const p of (pros ?? []) as { id: string; name: string; practice_name: string | null }[]) {
        map[p.id] = p.practice_name || p.name;
      }
      setNames(map);
    } else {
      setNames({});
    }
    // Traffic comes from the reporting views so the browser never has to
    // aggregate tens of thousands of rows.
    const sinceDay = since.slice(0, 10);
    const [d, pg, sr] = await Promise.all([
      (supabase as any)
        .from('analytics_daily_traffic')
        .select('day,page_views,visits,visitors,outbound_clicks,searches')
        .gte('day', sinceDay)
        .order('day', { ascending: false }),
      (supabase as any)
        .from('analytics_top_pages')
        .select('page_path,page_views,visits')
        .order('page_views', { ascending: false })
        .limit(25),
      (supabase as any)
        .from('analytics_sources')
        .select('source,referrer_host,utm_source,utm_campaign,visits')
        .order('visits', { ascending: false })
        .limit(25),
    ]);

    const viewsMissing = !!d.error || !!pg.error || !!sr.error;
    setViewsReady(!viewsMissing);
    setDaily((d.data ?? []) as DailyRow[]);
    setPages((pg.data ?? []) as PageRow[]);
    setSources((sr.data ?? []) as SourceRow[]);

    const [mp, en] = await Promise.all([
      (supabase as any)
        .from('analytics_missing_pages')
        .select('page_path,misses,visits')
        .order('misses', { ascending: false })
        .limit(25),
      (supabase as any)
        .from('analytics_engagement')
        .select('page_path,views,engaged,engaged_pct')
        .order('views', { ascending: false })
        .limit(25),
    ]);
    setExtraReady(!mp.error && !en.error);
    setMissing((mp.data ?? []) as MissingRow[]);
    setEngagement((en.data ?? []) as EngagementRow[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const stats = useMemo(() => {
    const searches = events.filter((e) => e.event_type === 'search');
    const problems = events.filter((e) => e.event_type === 'problem_described');
    const results = events.filter((e) => e.event_type === 'results_shown');
    const clicks = events.filter((e) => e.event_type === 'outbound_click');

    const comboMap = new Map<string, number>();
    for (const e of searches) {
      const key = `${e.profession ?? '—'} · ${e.suburb ?? 'all suburbs'}`;
      comboMap.set(key, (comboMap.get(key) ?? 0) + 1);
    }

    const zeroMap = new Map<string, number>();
    for (const e of results) {
      if ((e.result_count ?? 0) > 0) continue;
      const key = `${e.profession ?? '—'} · ${e.suburb ?? 'all suburbs'}`;
      zeroMap.set(key, (zeroMap.get(key) ?? 0) + 1);
    }

    const perPro = new Map<string, { website: number; booking: number; phone: number; total: number }>();
    for (const e of clicks) {
      if (!e.professional_id) continue;
      const cur = perPro.get(e.professional_id) ?? { website: 0, booking: 0, phone: 0, total: 0 };
      if (e.link_type === 'website') cur.website += 1;
      else if (e.link_type === 'booking') cur.booking += 1;
      else if (e.link_type === 'phone') cur.phone += 1;
      cur.total += 1;
      perPro.set(e.professional_id, cur);
    }

    return {
      totalSearches: searches.length,
      totalClicks: clicks.length,
      totalProblems: problems.length,
      topSearchTerms: topCounts(searches.map((e) => e.profession), 20),
      topProblems: topCounts(problems.map((e) => e.query), 20),
      combos: [...comboMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
      zeroResults: [...zeroMap.entries()].sort((a, b) => b[1] - a[1]),
      perPro: [...perPro.entries()].sort((a, b) => b[1].total - a[1].total),
    };
  }, [events]);

  if (!ready) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!session) return <SignIn />;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <p>Signed in as {session.user.email}, which does not have admin access.</p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
        <Link to="/admin/blog" className="font-bold">Predictiv insights</Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground hidden sm:inline">{session.user.email}</span>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>Refresh</Button>
          <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Last {DAYS} days</h1>
          {loading && <p className="text-sm text-muted-foreground mt-1">Loading events…</p>}
          {error && <p className="text-sm text-muted-foreground mt-1" role="alert">{error}</p>}
        </div>

        {viewsReady && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card label="Page views" value={daily.reduce((a, r) => a + (r.page_views ?? 0), 0)} />
            <Card label="Visits" value={daily.reduce((a, r) => a + (r.visits ?? 0), 0)} />
            <Card label="People" value={daily.reduce((a, r) => a + (r.visitors ?? 0), 0)} />
          </div>
        )}

        {!viewsReady && (
          <p className="text-sm text-muted-foreground rounded-2xl border border-border bg-card/50 p-4">
            Traffic reporting is waiting on the 20260923 migration. Searches and clicks below are live.
          </p>
        )}

        {viewsReady && (
          <>
            <Table
              title={`Traffic by day, last ${DAYS} days`}
              headers={['Day', 'Page views', 'Visits', 'People', 'Searches', 'Outbound clicks']}
              rows={daily.map((r) => [
                r.day,
                r.page_views ?? 0,
                r.visits ?? 0,
                r.visitors ?? 0,
                r.searches ?? 0,
                r.outbound_clicks ?? 0,
              ])}
              empty="No traffic recorded yet."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Table
                title="Most visited pages"
                headers={['Page', 'Views', 'Visits']}
                rows={pages.map((r) => [r.page_path, r.page_views ?? 0, r.visits ?? 0])}
                empty="No page views recorded yet."
              />
              <Table
                title="Where visits come from"
                headers={['Source', 'Referrer', 'Campaign', 'Visits']}
                rows={sources.map((r) => [
                  r.source,
                  r.referrer_host ?? '',
                  r.utm_campaign ?? r.utm_source ?? '',
                  r.visits ?? 0,
                ])}
                empty="No sources recorded yet."
              />
            </div>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Card label="Searches" value={stats.totalSearches} />
          <Card label="Outbound clicks" value={stats.totalClicks} />
          <Card label="Problems described" value={stats.totalProblems} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Table
            title="Top 20 searches by profession"
            headers={['Profession', 'Searches']}
            rows={stats.topSearchTerms.map(([k, v]) => [k, v])}
            empty="No searches recorded yet."
          />
          <Table
            title="Top 20 problem descriptions"
            headers={['What people typed', 'Times']}
            rows={stats.topProblems.map(([k, v]) => [k, v])}
            empty="No problem descriptions recorded yet."
          />
        </div>

        <Table
          title="Most searched profession and suburb combinations"
          headers={['Profession · Suburb', 'Searches']}
          rows={stats.combos.map(([k, v]) => [k, v])}
          empty="No combinations recorded yet."
        />

        <Table
          title="Searches that returned zero results"
          headers={['Profession · Suburb', 'Empty result pages']}
          rows={stats.zeroResults.map(([k, v]) => [k, v])}
          empty="No empty result pages in this period."
        />

        {extraReady && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Table
              title="Pages people asked for that do not exist"
              headers={['Path', 'Misses', 'Visits']}
              rows={missing.map((r) => [r.page_path, r.misses ?? 0, r.visits ?? 0])}
              empty="No missing pages recorded yet."
            />
            <Table
              title="Read or bounced"
              headers={['Page', 'Views', 'Engaged', 'Engaged %']}
              rows={engagement.map((r) => [
                r.page_path,
                r.views ?? 0,
                r.engaged ?? 0,
                r.engaged_pct == null ? '' : `${r.engaged_pct}%`,
              ])}
              empty="No engagement recorded yet."
            />
          </div>
        )}

        <Table
          title="Outbound clicks per practitioner"
          headers={['Practice', 'Website', 'Booking', 'Phone', 'Total clicks']}
          rows={stats.perPro.map(([id, c]) => [
            names[id] ?? id,
            c.website,
            c.booking,
            c.phone,
            c.total,
          ])}
          empty="No outbound clicks recorded yet."
        />
      </div>
    </div>
  );
}
