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

  const leaderboard = (rawData ?? []).map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1,
  }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-electric-blue text-black text-xs font-extrabold">
          1
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-muted-foreground text-foreground text-xs font-extrabold">
          2
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-neon-orange/80 text-black text-xs font-extrabold">
          3
        </span>
      );
    }
    return (
      <span className="text-[13px] font-bold text-muted-foreground">
        #{rank}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[22px] font-extrabold text-foreground">
              ELO Leaderboard
            </h2>
            <p className="text-[13px] text-text-secondary">
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
    <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-[22px] font-extrabold text-foreground">
            ELO Leaderboard
          </h2>
          <p className="text-[13px] text-text-secondary">
            Top debaters ranked by ELO rating
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="text-[13px] font-semibold text-electric-blue hover:text-neon-orange transition-colors"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="h-4" />

      {leaderboard.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-af-border rounded-xl">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-electric-blue opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <p className="text-base font-bold text-foreground">
            No Rankings Yet
          </p>
          <p className="text-[13px] text-muted-foreground mt-1">
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
      <div className="pt-4 mt-4 border-t border-af-border">
        <p className="text-[11px] text-text-secondary mb-1.5 font-bold">
          Quick Rules:
        </p>
        <ul className="text-[11px] text-text-secondary space-y-0.5">
          <li>&bull; Ranked by ELO rating (highest first)</li>
          <li>&bull; Win debates to increase your ELO</li>
          <li>&bull; ELO changes based on opponent strength</li>
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
      className={`flex-shrink-0 block p-5 rounded-xl border-2 transition-all w-[280px] ${
        isCurrentUser
          ? "bg-gradient-to-br from-electric-blue/15 to-electric-blue/[0.03] border-electric-blue/50 hover:border-electric-blue hover:shadow-[0_4px_24px_rgba(0,217,255,0.15)]"
          : "bg-bg-tertiary border-bg-secondary hover:border-muted-foreground"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={entry.avatar_url} alt={entry.username} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <p
                className={`font-bold text-[15px] truncate ${
                  isCurrentUser ? "text-electric-blue" : "text-foreground"
                }`}
              >
                {entry.username}
              </p>
              {isCurrentUser && (
                <span className="inline-flex px-2 py-[2px] rounded text-[10px] font-bold bg-electric-blue text-black">
                  You
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">ELO</span>
              <span className="text-electric-blue font-bold">
                {entry.elo_rating}
              </span>
            </div>
            <div className="pt-2 border-t border-bg-secondary">
              <div className="flex justify-between text-[11px] text-text-secondary mb-1">
                <span>Record</span>
                <div className="flex gap-2">
                  <span className="text-cyber-green font-bold">
                    {entry.debates_won}W
                  </span>
                  <span className="text-neon-orange font-bold">
                    {entry.debates_lost}L
                  </span>
                  <span className="text-yellow-500 font-bold">
                    {entry.debates_tied || 0}T
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-text-secondary">
                <span>{entry.total_debates} debates</span>
                <span className="text-electric-blue font-bold">
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
