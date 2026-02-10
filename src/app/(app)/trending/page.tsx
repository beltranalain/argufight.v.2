import { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import Link from "next/link";
import { TrendingUp, Hash, Swords } from "lucide-react";

export const metadata: Metadata = { title: "Trending Topics", description: "See what people are debating right now on ArguFight." };

export default async function TrendingPage() {
  const trendingTags = await prisma.tags.findMany({ where: { usage_count: { gt: 0 } }, orderBy: { usage_count: "desc" }, take: 30, select: { id: true, name: true, color: true, usage_count: true } });
  const recentDebates = await prisma.debates.groupBy({ by: ["category"], where: { created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, visibility: "PUBLIC" }, _count: { id: true }, orderBy: { _count: { id: "desc" } } });
  const hotDebates = await prisma.debates.findMany({ where: { visibility: "PUBLIC", status: { in: ["ACTIVE", "COMPLETED", "VERDICT_READY"] }, created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, orderBy: { view_count: "desc" }, take: 10, select: { id: true, topic: true, category: true, view_count: true, status: true, slug: true, users_debates_challenger_idTousers: { select: { username: true } }, users_debates_opponent_idTousers: { select: { username: true } }, _count: { select: { debate_likes: true } } } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2"><TrendingUp className="h-6 w-6 text-neon-orange" /> Trending</h1>
        <p className="text-[13px] text-text-secondary">What the community is debating this week</p>
      </div>
      {trendingTags.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3"><Hash className="h-4 w-4" /> Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link key={tag.id} href={`/debates?search=${encodeURIComponent(tag.name)}`} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-bg-secondary border border-af-border text-sm font-medium hover:border-electric-blue transition-colors" style={{ borderColor: `${tag.color}40`, color: tag.color }}>
                #{tag.name}<span className="ml-1.5 text-[10px] text-muted-foreground">{tag.usage_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {recentDebates.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">Hot Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {recentDebates.map((cat) => (
              <Link key={cat.category} href={`/debates?category=${cat.category}`} className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center hover:border-electric-blue transition-colors">
                <p className="font-semibold text-foreground">{cat.category}</p>
                <p className="text-xs text-muted-foreground">{cat._count.id} debates this week</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3"><Swords className="h-4 w-4" /> Hottest Debates</h2>
        {hotDebates.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
            <Swords className="w-10 h-10 mx-auto mb-3 text-electric-blue opacity-60" />
            <p className="text-base font-bold text-foreground">No trending debates</p>
            <p className="text-[13px] text-muted-foreground mt-1">No trending debates this week. Start one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {hotDebates.map((debate, index) => (
              <Link key={debate.id} href={`/debate/${debate.id}`} className="flex items-center gap-4 bg-bg-secondary border border-af-border rounded-[10px] p-4 hover:border-electric-blue transition-colors">
                <span className="text-lg font-extrabold text-muted-foreground w-6 text-center">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{debate.topic}</p>
                  <p className="text-xs text-muted-foreground">{debate.users_debates_challenger_idTousers.username}{debate.users_debates_opponent_idTousers ? ` vs ${debate.users_debates_opponent_idTousers.username}` : " — open challenge"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{debate.view_count} views</p>
                  <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold bg-muted text-muted-foreground">{debate.category}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
