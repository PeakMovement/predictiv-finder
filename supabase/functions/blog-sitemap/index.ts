// Public XML sitemap of published Predictiv blog posts.
// Referenced from https://predictiv.co.za/robots.txt so new posts are
// discoverable without republishing the site. Deployed with verify_jwt=false.
const SITE = 'https://predictiv.co.za';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_ANON_KEY')!;
  let posts: { slug: string; updated_at: string; published_at: string | null }[] = [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (res.ok) posts = await res.json();
  } catch (_e) {
    // fall through with an empty list
  }

  const latest = posts[0]?.updated_at ?? new Date().toISOString();
  const urls = [
    `<url><loc>${SITE}/blog</loc><lastmod>${latest.slice(0, 10)}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`,
    ...posts.map(
      (p) =>
        `<url><loc>${SITE}/blog/${esc(p.slug)}</loc><lastmod>${(p.updated_at || p.published_at || latest).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
