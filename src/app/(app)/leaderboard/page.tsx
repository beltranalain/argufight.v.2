"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown } from "lucide-react";

export default function LeaderboardPage() {
  const [limit] = useState(50);

  const { data, isLoading } = trpc.user.leaderboard.useQuery({ limit });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-[13px] text-text-secondary">
          Top debaters ranked by ELO rating
        </p>
      </div>

      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 border-b border-af-border bg-bg-tertiary px-4 py-3 text-xs font-semibold text-muted-foreground">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">ELO</div>
          <div className="col-span-2 text-center">W/L/T</div>
          <div className="col-span-2 text-center">Win %</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 border-b border-af-border animate-pulse bg-bg-secondary" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No ranked players yet.</p>
          </div>
        ) : (
          <div>
            {data.map((user, index) => {
              const rank = index + 1;
              const winRate =
                user.total_debates > 0
                  ? Math.round((user.debates_won / user.total_debates) * 100)
                  : 0;

              return (
                <Link
                  key={user.id}
                  href={`/${user.username}`}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-af-border last:border-0"
                >
                  <div className="col-span-1 text-center">
                    {rank === 1 ? (
                      <Crown className="mx-auto h-5 w-5 text-yellow-400" />
                    ) : rank === 2 ? (
                      <Medal className="mx-auto h-5 w-5 text-gray-300" />
                    ) : rank === 3 ? (
                      <Medal className="mx-auto h-5 w-5 text-orange-400" />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {rank}
                      </span>
                    )}
                  </div>
                  <div className="col-span-5 flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={`text-xs font-bold ${
                          rank <= 3
                            ? "bg-electric-blue/20 text-electric-blue"
                            : "bg-bg-tertiary text-muted-foreground"
                        }`}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`text-sm font-medium ${
                        rank <= 3 ? "text-foreground font-semibold" : "text-text-secondary"
                      }`}
                    >
                      {user.username}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-bold text-electric-blue">
                      {user.elo_rating}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-xs text-muted-foreground">
                    {user.debates_won}/{user.debates_lost}/{user.debates_tied}
                  </div>
                  <div className="col-span-2 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        winRate >= 70
                          ? "bg-cyber-green/15 text-cyber-green"
                          : winRate >= 50
                            ? "bg-electric-blue/15 text-electric-blue"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {winRate}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
