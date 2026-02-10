"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

export function TournamentsPanel() {
  const { data, isLoading } = trpc.tournament.list.useQuery(
    { limit: 3 },
    { retry: false }
  );

  // Filter to active tournaments client-side
  const allTournaments = data?.items ?? [];
  const tournaments = allTournaments.filter(
    (t: any) =>
      t.status === "UPCOMING" ||
      t.status === "REGISTRATION_OPEN" ||
      t.status === "IN_PROGRESS"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Tournaments</h2>
        <Link
          href="/tournaments"
          className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          View All
        </Link>
      </div>

      {tournaments.length === 0 ? (
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
            No Active Tournaments
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back soon for new tournaments
          </p>
          <Link
            href="/tournaments/create"
            className="inline-flex items-center mt-3 rounded-lg bg-electric-blue px-4 py-2 text-sm font-semibold text-black hover:bg-[#00B8E6] transition-colors"
          >
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((tournament: any) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="block p-4 rounded-lg border border-border bg-accent/50 hover:border-electric-blue transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-foreground line-clamp-1 flex-1">
                  {tournament.name}
                </h3>
                {tournament.is_participant && (
                  <span className="inline-flex items-center ml-2 rounded-full bg-electric-blue px-2 py-0.5 text-xs font-medium text-black">
                    Joined
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {tournament.participant_count}/{tournament.max_participants}{" "}
                  participants
                </span>
                <span>
                  Round {tournament.current_round}/{tournament.total_rounds}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
