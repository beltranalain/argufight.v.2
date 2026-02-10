"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc-client";

export function LeaderboardPanel() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: rawData, isLoading } = trpc.user.leaderboard.useQuery(
    { limit: 3 },
    { retry: false }
  );

  // The leaderboard query returns a flat array - add rank numbers
  const leaderboard = (rawData ?? []).map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1,
  }));
  const userRank = null; // userRank would need a separate query

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-electric-blue text-black text-xs font-bold">
          1
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-foreground text-xs font-bold">
          2
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-neon-orange/80 text-black text-xs font-bold">
          3
        </span>
      );
    }
    return (
      <span className="text-muted-foreground font-semibold text-sm">
        #{rank}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              ELO Leaderboard
            </h3>
            <p className="text-muted-foreground text-sm">
              Top debaters ranked by ELO rating
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric-blue border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-1">
            ELO Leaderboard
          </h3>
          <p className="text-muted-foreground text-sm">
            Top debaters ranked by ELO rating
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="text-sm text-electric-blue hover:text-neon-orange font-medium"
        >
          View All →
        </Link>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <p className="text-sm font-semibold text-foreground">
            No Rankings Yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete debates to appear on the leaderboard
          </p>
        </div>
      ) : (
        <div
          className="overflow-x-auto -mx-6 px-6 pb-2"
          role="region"
          aria-label="Leaderboard rankings"
        >
          <div className="flex gap-4 min-w-max">
            {/* User rank card (if not in top 3) */}
            {userRank && !leaderboard.some((e: any) => e.id === user?.id) && (
              <LeaderboardCard
                entry={userRank}
                isCurrentUser={true}
                getRankBadge={getRankBadge}
              />
            )}

            {/* Top 3 Cards */}
            {leaderboard.map((entry: any) => (
              <LeaderboardCard
                key={entry.id}
                entry={entry}
                isCurrentUser={user?.id === entry.id}
                getRankBadge={getRankBadge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Rules */}
      <div className="pt-4 mt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">
          Quick Rules:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Ranked by ELO rating (highest first)</li>
          <li>• Win debates to increase your ELO</li>
          <li>• ELO changes based on debate performance</li>
        </ul>
      </div>
    </div>
  );
}

function LeaderboardCard({
  entry,
  isCurrentUser,
  getRankBadge,
}: {
  entry: any;
  isCurrentUser: boolean;
  getRankBadge: (rank: number) => React.ReactNode;
}) {
  const initials = entry.username?.slice(0, 2).toUpperCase() || "??";
  const winRate =
    entry.total_debates > 0
      ? Math.round((entry.debates_won / entry.total_debates) * 100)
      : 0;

  return (
    <Link
      href={`/${entry.username}`}
      className={`flex-shrink-0 block p-5 rounded-xl border-2 transition-all hover:shadow-lg w-[280px] ${
        isCurrentUser
          ? "bg-gradient-to-br from-electric-blue/20 to-electric-blue/5 border-electric-blue/50 hover:border-electric-blue shadow-electric-blue/20"
          : "bg-card border-border hover:border-muted-foreground"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.avatar_url} alt={entry.username} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-bold text-base truncate ${
                    isCurrentUser ? "text-electric-blue" : "text-foreground"
                  }`}
                >
                  {entry.username}
                </p>
                {isCurrentUser && (
                  <span className="inline-flex items-center rounded-full bg-electric-blue px-2 py-0.5 text-xs font-medium text-black">
                    You
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ELO</span>
              <span className="text-electric-blue font-bold">
                {entry.elo_rating}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Record</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyber-green font-semibold">
                    {entry.debates_won}W
                  </span>
                  <span className="text-neon-orange font-semibold">
                    {entry.debates_lost}L
                  </span>
                  <span className="text-yellow-500 font-semibold">
                    {entry.debates_tied || 0}T
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{entry.total_debates} debates</span>
                <span className="text-electric-blue font-semibold">
                  {winRate}% win rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
