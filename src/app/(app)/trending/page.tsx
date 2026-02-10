import { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash, Swords } from "lucide-react";

export const metadata: Metadata = {
  title: "Trending Topics",
  description: "See what people are debating right now on ArguFight.",
};

export default async function TrendingPage() {
  // Trending tags by usage count
  const trendingTags = await prisma.tags.findMany({
    where: { usage_count: { gt: 0 } },
    orderBy: { usage_count: "desc" },
    take: 30,
    select: {
      id: true,
      name: true,
      color: true,
      usage_count: true,
    },
  });

  // Trending categories by recent debate count
  const recentDebates = await prisma.debates.groupBy({
    by: ["category"],
    where: {
      created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      visibility: "PUBLIC",
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Most viewed debates this week
  const hotDebates = await prisma.debates.findMany({
    where: {
      visibility: "PUBLIC",
      status: { in: ["ACTIVE", "COMPLETED", "VERDICT_READY"] },
      created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { view_count: "desc" },
    take: 10,
    select: {
      id: true,
      topic: true,
      category: true,
      view_count: true,
      status: true,
      slug: true,
      users_debates_challenger_idTousers: {
        select: { username: true },
      },
      users_debates_opponent_idTousers: {
        select: { username: true },
      },
      _count: { select: { debate_likes: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-neon-orange" />
          Trending
        </h1>
        <p className="text-sm text-muted-foreground">
          What the community is debating this week
        </p>
      </div>

      {/* Trending tags */}
      {trendingTags.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4" />
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link key={tag.id} href={`/debates?search=${encodeURIComponent(tag.name)}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  style={{ borderColor: `${tag.color}40`, color: tag.color }}
                >
                  #{tag.name}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    {tag.usage_count}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending categories */}
      {recentDebates.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Hot Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {recentDebates.map((cat) => (
              <Link
                key={cat.category}
                href={`/debates?category=${cat.category}`}
                className="rounded-lg border border-border/50 bg-card/80 p-4 text-center hover:border-electric-blue/30 transition-colors"
              >
                <p className="font-semibold">{cat.category}</p>
                <p className="text-xs text-muted-foreground">
                  {cat._count.id} debates this week
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Hot debates */}
      <section>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Swords className="h-4 w-4" />
          Hottest Debates
        </h2>
        {hotDebates.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No trending debates this week. Start one!
          </p>
        ) : (
          <div className="space-y-2">
            {hotDebates.map((debate, index) => (
              <Link
                key={debate.id}
                href={`/debate/${debate.id}`}
                className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/80 p-4 hover:border-electric-blue/30 transition-colors"
              >
                <span className="text-lg font-bold text-muted-foreground w-6 text-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{debate.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {debate.users_debates_challenger_idTousers.username}
                    {debate.users_debates_opponent_idTousers
                      ? ` vs ${debate.users_debates_opponent_idTousers.username}`
                      : " — open challenge"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{debate.view_count} views</p>
                  <Badge variant="outline" className="text-[10px]">
                    {debate.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
