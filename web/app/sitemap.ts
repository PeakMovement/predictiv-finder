import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { posts } from "@/lib/posts";
import { supabase } from "@/lib/supabase";

const LAUNCH_SUBURBS = ["rondebosch"];
const LAUNCH_PROFESSIONS = ["physiotherapist", "biokineticist", "chiropractor", "general-practitioner"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/find-a-practitioner`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/name-your-problem`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const locationRoutes: MetadataRoute.Sitemap = LAUNCH_SUBURBS.flatMap((suburb) =>
    LAUNCH_PROFESSIONS.map((profession) => ({
      url: `${SITE_URL}/practitioners/${suburb}/${profession}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let profileRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from("professionals")
      .select("slug, id, updated_at")
      .eq("is_approved", true);
    profileRoutes = (data ?? []).map((p) => ({
      url: `${SITE_URL}/practitioner/${p.slug ?? p.id}`,
      lastModified: p.updated_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Build-time Supabase call failed (e.g. no env vars in this environment);
    // sitemap still ships with the static + location routes.
  }

  return [...staticRoutes, ...locationRoutes, ...blogRoutes, ...profileRoutes];
}
