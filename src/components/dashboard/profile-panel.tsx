"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc-client";

export function ProfilePanel() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.username?.slice(0, 2).toUpperCase() || "AF";

  const { data: profile } = trpc.user.profile.useQuery(
    { id: user?.id },
    { enabled: !!user?.id }
  );

  const { data: recentDebates, isLoading: isLoadingDebates } =
    trpc.debate.list.useQuery(
      { userId: user?.id, limit: 3 },
      { enabled: !!user?.id }
    );

  const totalDebates = profile?.total_debates ?? 0;
  const wins = profile?.debates_won ?? 0;
  const losses = profile?.debates_lost ?? 0;
  const winRate = totalDebates > 0 ? Math.round((wins / totalDebates) * 100) : 0;

  return (
    <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
      <h2 className="text-[22px] font-extrabold text-foreground mb-4">
        Your Profile
      </h2>

      {/* Profile Header */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
          <AvatarFallback className="bg-electric-blue/20 text-electric-blue font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold text-foreground">{user?.username}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center rounded-md px-2.5 py-[3px] text-[11px] font-bold bg-electric-blue/20 text-electric-blue">
              ELO: {profile?.elo_rating ?? user?.eloRating ?? 1200}
            </span>
            <span className="inline-flex items-center rounded-md px-2.5 py-[3px] text-[11px] font-bold bg-cyan-500/15 text-cyan-400">
              Coins: {(profile?.coins ?? user?.coins ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-bg-tertiary border border-af-border rounded-[10px] p-4 text-center transition-all hover:border-electric-blue/30">
          <div className="text-[28px] font-extrabold text-electric-blue mb-0.5">
            {totalDebates}
          </div>
          <div className="text-xs text-text-secondary">Total</div>
        </div>
        <div className="bg-bg-tertiary border border-af-border rounded-[10px] p-4 text-center transition-all hover:border-electric-blue/30">
          <div className="text-[28px] font-extrabold text-cyber-green mb-0.5">
            {wins}
          </div>
          <div className="text-xs text-text-secondary">Wins</div>
        </div>
        <div className="bg-bg-tertiary border border-af-border rounded-[10px] p-4 text-center transition-all hover:border-electric-blue/30">
          <div className="text-[28px] font-extrabold text-neon-orange mb-0.5">
            {losses}
          </div>
          <div className="text-xs text-text-secondary">Losses</div>
        </div>
        <div className="bg-bg-tertiary border border-af-border rounded-[10px] p-4 text-center transition-all hover:border-electric-blue/30">
          <div className="text-[28px] font-extrabold text-hot-pink mb-0.5">
            {winRate}%
          </div>
          <div className="text-xs text-text-secondary">Win Rate</div>
        </div>
      </div>

      {/* Recent Debates */}
      <div className="bg-bg-tertiary border border-af-border rounded-[10px] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground">Recent Debates</span>
          <div className="flex gap-3">
            <Link
              href="/debates/history"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
            <Link
              href="/debates/saved"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Saved
            </Link>
          </div>
        </div>
        {isLoadingDebates ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-electric-blue border-t-transparent" />
          </div>
        ) : !recentDebates?.debates?.length ? (
          <div className="text-center py-6 border-2 border-dashed border-af-border rounded-lg">
            <svg
              className="w-8 h-8 mx-auto mb-2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-muted-foreground text-xs">
              Your recent debates will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDebates.debates.slice(0, 3).map((debate: any) => {
              const isWinner = debate.winner_id === user?.id;

              return (
                <Link
                  key={debate.id}
                  href={`/debate/${debate.id}`}
                  className="af-debate-row"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate mb-1">
                        {debate.topic}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <span>{debate.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {debate.winner_id ? (
                        isWinner ? (
                          <span className="inline-flex px-2.5 py-[2px] rounded-[5px] text-[11px] font-bold bg-cyber-green text-black">
                            Won
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-[2px] rounded-[5px] text-[11px] font-bold bg-neon-orange text-black">
                            Lost
                          </span>
                        )
                      ) : debate.status === "ACTIVE" ? (
                        <span className="inline-flex px-2.5 py-[2px] rounded-[5px] text-[11px] font-bold bg-electric-blue text-white">
                          Ongoing
                        </span>
                      ) : debate.status === "COMPLETED" ? (
                        <span className="inline-flex px-2.5 py-[2px] rounded-[5px] text-[11px] font-bold bg-yellow-500 text-black">
                          Awaiting Verdict
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-[2px] rounded-[5px] text-[11px] font-bold bg-muted text-muted-foreground">
                          {debate.status}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(debate.created_at).toLocaleDateString()}
                      </span>
                    </div>
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
