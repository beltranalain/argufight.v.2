"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

export function TournamentsPanel() {
  const { data, isLoading } = trpc.tournament.list.useQuery(
    { limit: 3 },
    { retry: false }
  );

  const allTournaments = data?.items ?? [];
  const tournaments = allTournaments.filter(
    (t: any) =>
      t.status === "UPCOMING" ||
      t.status === "REGISTRATION_OPEN" ||
      t.status === "IN_PROGRESS"
  );

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-extrabold text-foreground">Tournaments</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-electric-blue border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[22px] font-extrabold text-foreground">Tournaments</h2>
        <Link
          href="/tournaments"
          className="inline-flex items-center px-4 py-1.5 rounded-lg border border-af-border bg-bg-tertiary text-foreground text-[13px] font-semibold hover:border-electric-blue hover:text-electric-blue transition-all"
        >
          View All
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <>
          <div className="text-center py-10 border-2 border-dashed border-af-border rounded-xl">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-base font-bold text-foreground">
              No Active Tournaments
            </p>
            <p className="text-[13px] text-muted-foreground mt-1">
              Check back soon for new tournaments
            </p>
          </div>
          <div className="text-center mt-3">
            <Link
              href="/tournaments/create"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-electric-blue text-black text-sm font-bold hover:bg-[#00B8E6] transition-colors"
            >
              Create Tournament
            </Link>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {tournaments.map((tournament: any) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="block p-4 rounded-[10px] bg-bg-tertiary border border-af-border hover:border-electric-blue transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-bold text-foreground line-clamp-1 flex-1">
                  {tournament.name}
                </h3>
                {tournament.is_participant && (
                  <span className="inline-flex items-center ml-2 px-2 py-[2px] rounded text-[10px] font-bold bg-electric-blue text-black">
                    Joined
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-text-secondary">
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
