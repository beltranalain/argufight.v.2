"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Crown } from "lucide-react";

export default function LeaderboardPage() {
  const [limit] = useState(50);

  const { data, isLoading } = trpc.user.leaderboard.useQuery({ limit });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Top debaters ranked by ELO rating
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 border-b border-border/50 bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-center">ELO</div>
          <div className="col-span-2 text-center">W/L/T</div>
          <div className="col-span-2 text-center">Win %</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="ml-auto h-4 w-12" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No ranked players yet.
          </p>
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
                  className="grid grid-cols-12 items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/20 last:border-0"
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
                        className={`text-xs ${
                          rank <= 3
                            ? "bg-electric-blue/20 text-electric-blue"
                            : ""
                        }`}
                      >
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`text-sm font-medium ${
                        rank <= 3 ? "text-foreground" : ""
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
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        winRate >= 70
                          ? "border-cyber-green/30 text-cyber-green"
                          : winRate >= 50
                            ? "border-electric-blue/30 text-electric-blue"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {winRate}%
                    </Badge>
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
