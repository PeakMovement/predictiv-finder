import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ExternalLink, Plus } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSeo } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import {
  BLOG_ADMIN_EMAILS, KEYWORD_IDEAS, analyseSeo, blogTable, slugify, wordCount, type BlogPost, type BlogPostInput,
} from '@/lib/blog';

const EMPTY: BlogPostInput = {
  slug: '',
  title: '',
  meta_title: '',
  meta_description: '',
  target_keyword: '',
  excerpt: '',
  content:
    'Start with a short intro that uses your keyword in the first sentence or two.\n\n## First section heading\n\nWrite helpful, specific information here.\n\n## Second section heading\n\nMore detail. Link to [find a practitioner](/assistant).\n\n## When to see a practitioner\n\nExplain who to see and when.',
  cover_image_url: '',
  author_name: 'Predictiv',
  status: 'draft',
  published_at: null,
};

function SignIn() {
  const [email, setEmail] = useState('predictivpty@gmail.com');
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
      options: { emailRedirectTo: `${window.location.origin}/admin/blog` },
    });
    setMsg(error ? error.message : 'Check your inbox for a sign in link.');
    setBusy(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4 rounded-2xl border border-border bg-card/50 p-6">
      <h1 className="text-2xl font-bold">Blog admin</h1>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button className="w-full" disabled={busy || !password} onClick={withPassword}>Sign in</Button>
      <Button className="w-full" variant="outline" disabled={busy} onClick={withLink}>Email me a sign in link</Button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function BlogAdmin() {
  useSeo({ title: 'Blog admin | Predictiv', description: 'Predictiv blog editor', path: '/admin/blog', noindex: true });

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostInput>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = !!session?.user.email && BLOG_ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  const loadPosts = useCallback(async () => {
    const { data } = await blogTable().select('*').order('updated_at', { ascending: false });
    setPosts((data as BlogPost[]) ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) loadPosts();
  }, [isAdmin, loadPosts]);

  const checks = useMemo(() => analyseSeo(form), [form]);
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  const set = <K extends keyof BlogPostInput>(k: K, v: BlogPostInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = (keyword = '') => {
    setEditingId(null);
    setSlugTouched(false);
    setForm({ ...EMPTY, target_keyword: keyword });
    setStatus(null);
    setPreview(false);
  };

  const edit = (p: BlogPost) => {
    setEditingId(p.id);
    setSlugTouched(true);
    setForm({
      slug: p.slug, title: p.title, meta_title: p.meta_title ?? '', meta_description: p.meta_description ?? '',
      target_keyword: p.target_keyword ?? '', excerpt: p.excerpt ?? '', content: p.content, cover_image_url: p.cover_image_url ?? '',
      author_name: p.author_name ?? 'Predictiv', status: p.status, published_at: p.published_at,
    });
    setStatus(null);
    setPreview(false);
  };

  const save = async (nextStatus: 'draft' | 'published') => {
    if (!form.title.trim() || !form.slug.trim()) {
      setStatus('Add a title and URL slug first.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      slug: slugify(form.slug),
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      target_keyword: form.target_keyword || null,
      excerpt: form.excerpt || null,
      cover_image_url: form.cover_image_url || null,
      status: nextStatus,
      published_at: nextStatus === 'published' ? form.published_at || new Date().toISOString() : form.published_at,
    };
    const res = editingId
      ? await blogTable().update(payload).eq('id', editingId).select().single()
      : await blogTable().insert(payload).select().single();
    setSaving(false);
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    const saved = res.data as BlogPost;
    setEditingId(saved.id);
    setForm((f) => ({ ...f, status: saved.status, published_at: saved.published_at, slug: saved.slug }));
    setStatus(nextStatus === 'published' ? 'Published. It is live and listed in the blog sitemap.' : 'Draft saved.');
    loadPosts();
  };

  if (!ready) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!session) return <SignIn />;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <p>Signed in as {session.user.email}, which does not have blog access.</p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
        <Link to="/blog" className="font-bold">Predictiv blog admin</Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground hidden sm:inline">{session.user.email}</span>
          <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px_1fr_320px] gap-6 p-4 md:p-6">
        <aside className="space-y-4">
          <Button className="w-full gap-2" onClick={() => startNew()}><Plus className="h-4 w-4" /> New post</Button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Posts</p>
            <ul className="space-y-1">
              {posts.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => edit(p)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-card ${editingId === p.id ? 'bg-card border border-border' : ''}`}
                  >
                    <span className="block truncate">{p.title}</span>
                    <span className={`text-[11px] ${p.status === 'published' ? 'text-emerald-400' : 'text-muted-foreground'}`}>{p.status}</span>
                  </button>
                </li>
              ))}
              {posts.length === 0 && <li className="text-sm text-muted-foreground">No posts yet.</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Keyword ideas</p>
            <ul className="flex flex-wrap gap-1.5">
              {KEYWORD_IDEAS.map((k) => (
                <li key={k}>
                  <button onClick={() => (editingId || form.title ? set('target_keyword', k) : startNew(k))} className="text-[11px] rounded-full border border-border px-2.5 py-1 hover:border-primary/50">
                    {k}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold">{editingId ? 'Edit post' : 'New post'}</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreview((v) => !v)}>{preview ? 'Edit' : 'Preview'}</Button>
              {form.status === 'published' && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer" className="gap-1">View <ExternalLink className="h-3 w-3" /></a>
                </Button>
              )}
            </div>
          </div>

          {preview ? (
            <article className="rounded-2xl border border-border p-6">
              <h1 className="text-3xl font-extrabold mb-4">{form.title || 'Untitled'}</h1>
              <div className="prose prose-invert max-w-none prose-a:text-primary" dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }} />
            </article>
          ) : (
            <>
              <Field label="Target keyword" hint="The one search phrase this post should rank for.">
                <Input value={form.target_keyword ?? ''} onChange={(e) => set('target_keyword', e.target.value)} placeholder="e.g. physiotherapist Rondebosch" />
              </Field>
              <Field label="Post title (H1)">
                <Input
                  value={form.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (!slugTouched) set('slug', slugify(e.target.value));
                  }}
                  placeholder="e.g. How to Choose a Physiotherapist in Rondebosch"
                />
              </Field>
              <Field label="URL slug" hint={`predictiv.co.za/blog/${form.slug || 'your-post'}`}>
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label={`SEO title (${(form.meta_title || form.title).length}/60)`} hint="Leave blank to use the post title.">
                  <Input value={form.meta_title ?? ''} onChange={(e) => set('meta_title', e.target.value)} />
                </Field>
                <Field label="Cover image URL" hint="Optional. 1200 by 630 works best.">
                  <Input value={form.cover_image_url ?? ''} onChange={(e) => set('cover_image_url', e.target.value)} placeholder="https://" />
                </Field>
              </div>
              <Field label={`Meta description (${(form.meta_description ?? '').length}/160)`} hint="The snippet shown under your title in Google.">
                <Textarea rows={2} value={form.meta_description ?? ''} onChange={(e) => set('meta_description', e.target.value)} />
              </Field>
              <Field label="Excerpt" hint="One or two sentences shown on the blog list.">
                <Textarea rows={2} value={form.excerpt ?? ''} onChange={(e) => set('excerpt', e.target.value)} />
              </Field>
              <Field
                label={`Content (${wordCount(form.content)} words)`}
                hint="Use ## for section headings, ### for sub headings, - for bullet points, **bold**, and [link text](/assistant) for links."
              >
                <Textarea rows={22} className="font-mono text-sm" value={form.content} onChange={(e) => set('content', e.target.value)} />
              </Field>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="outline" disabled={saving} onClick={() => save('draft')}>
              {form.status === 'published' ? 'Unpublish (save as draft)' : 'Save draft'}
            </Button>
            <Button disabled={saving} onClick={() => save('published')}>
              {form.status === 'published' ? 'Update live post' : 'Publish'}
            </Button>
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </main>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">SEO score</h2>
              <span className={`text-2xl font-extrabold ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {checks.map((c) => (
                <li key={c.label} className="flex gap-2 text-sm">
                  {c.pass ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" /> : <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />}
                  <div>
                    <p className={c.pass ? '' : 'font-medium'}>{c.label}</p>
                    {!c.pass && <p className="text-xs text-muted-foreground">{c.tip}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="font-bold mb-2">Google preview</h2>
            <p className="text-xs text-muted-foreground">predictiv.co.za › blog › {form.slug || 'your-post'}</p>
            <p className="text-[#8ab4f8] text-lg leading-snug mt-1">{(form.meta_title || form.title || 'Your title').slice(0, 60)} | Predictiv</p>
            <p className="text-sm text-muted-foreground mt-1">{(form.meta_description || 'Your meta description appears here.').slice(0, 160)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
