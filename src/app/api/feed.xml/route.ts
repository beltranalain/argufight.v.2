import { prisma } from "@/server/db/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://argufight.com";

  let posts: { slug: string; title: string; excerpt: string | null; published_at: Date | null; created_at: Date }[] = [];

  try {
    posts = await prisma.blog_posts.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, excerpt: true, published_at: true, created_at: true },
      orderBy: { published_at: "desc" },
      take: 50,
    });
  } catch {
    // DB not available
  }

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${(post.published_at ?? post.created_at).toUTCString()}</pubDate>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ""}
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ArguFight Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Debate strategies, platform updates, and argumentation tips from ArguFight.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/api/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
