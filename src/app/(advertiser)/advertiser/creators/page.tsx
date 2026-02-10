"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Input } from "@/components/ui/input";
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-neon-orange" />
        <h1 className="text-[24px] font-extrabold text-foreground">Creator Marketplace</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-bg-tertiary border-af-border"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-[12px] bg-bg-secondary border border-af-border animate-pulse"
            />
          ))}
        </div>
      ) : (creators ?? []).length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-af-border rounded-[14px]">
          <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-60" />
          <p className="text-base font-bold text-foreground">No Creators Found</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(creators ?? []).map((creator) => {
            const followers = creator.followers ?? 0;
            return (
              <div
                key={creator.id}
                className="bg-bg-secondary border border-af-border rounded-[12px] p-5 space-y-3 hover:border-electric-blue transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{creator.username}</h3>
                  {creator.creatorStatus && (
                    <span
                      className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${creatorStatusColors[creator.creatorStatus] ?? ""}`}
                    >
                      {creator.creatorStatus}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-bg-tertiary border border-af-border rounded-[8px] py-2">
                    <Trophy className="h-3.5 w-3.5 mx-auto text-electric-blue" />
                    <p className="text-sm font-bold mt-0.5 text-foreground">{creator.elo_rating}</p>
                    <p className="text-[10px] text-muted-foreground">ELO</p>
                  </div>
                  <div className="bg-bg-tertiary border border-af-border rounded-[8px] py-2">
                    <Swords className="h-3.5 w-3.5 mx-auto text-cyber-green" />
                    <p className="text-sm font-bold mt-0.5 text-foreground">{creator.debates_won}</p>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                  </div>
                  <div className="bg-bg-tertiary border border-af-border rounded-[8px] py-2">
                    <Users className="h-3.5 w-3.5 mx-auto text-neon-orange" />
                    <p className="text-sm font-bold mt-0.5 text-foreground">{followers}</p>
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
