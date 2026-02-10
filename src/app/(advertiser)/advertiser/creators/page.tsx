"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Trophy, Swords } from "lucide-react";

const creatorStatusColors: Record<string, string> = {
  BRONZE: "bg-amber-700/20 text-amber-600",
  SILVER: "bg-gray-400/20 text-gray-400",
  GOLD: "bg-yellow-500/20 text-yellow-500",
  PLATINUM: "bg-cyan-400/20 text-cyan-400",
};

export default function AdvertiserCreatorsPage() {
  const [search, setSearch] = useState("");

  const { data: creators, isLoading } = trpc.advertiser.creators.useQuery({
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Creator Marketplace</h1>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (creators ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No creators found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(creators ?? []).map((creator) => {
            const followers = creator.followers ?? 0;
            return (
              <div
                key={creator.id}
                className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3 hover:border-electric-blue/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{creator.username}</h3>
                  {creator.creatorStatus && (
                    <Badge variant="outline" className={`text-[10px] ${creatorStatusColors[creator.creatorStatus] ?? ""}`}>
                      {creator.creatorStatus}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <Trophy className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-0.5">{creator.elo_rating}</p>
                    <p className="text-[10px] text-muted-foreground">ELO</p>
                  </div>
                  <div>
                    <Swords className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-0.5">{creator.debates_won}</p>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                  </div>
                  <div>
                    <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                    <p className="text-sm font-bold mt-0.5">{followers}</p>
                    <p className="text-[10px] text-muted-foreground">Followers</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
