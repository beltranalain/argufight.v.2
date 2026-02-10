import type { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://argufight.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/ai-debate`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/argument-checker`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/debate-practice`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/debate-simulator`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/advertise`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blog_posts.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updated_at: true },
      orderBy: { published_at: "desc" },
      take: 200,
    });

    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available during build
  }

  // Public debates
  let debatePages: MetadataRoute.Sitemap = [];
  try {
    const debates = await prisma.debates.findMany({
      where: { visibility: "PUBLIC", status: "VERDICT_READY" },
      select: { slug: true, updated_at: true },
      orderBy: { created_at: "desc" },
      take: 500,
    });

    debatePages = debates.map((debate) => ({
      url: `${baseUrl}/debates/${debate.slug}`,
      lastModified: debate.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // DB not available during build
  }

  return [...staticPages, ...blogPages, ...debatePages];
}
