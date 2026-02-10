"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

type TournamentStatus = "UPCOMING" | "REGISTRATION_OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TournamentFormat = "BRACKET" | "CHAMPIONSHIP" | "KING_OF_THE_HILL";

export default function TournamentsPage() {
  const [status, setStatus] = useState<TournamentStatus | "ALL">("ALL");
  const [format, setFormat] = useState<TournamentFormat | "ALL">("ALL");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.tournament.list.useInfiniteQuery({ status: status === "ALL" ? undefined : status, format: format === "ALL" ? undefined : format, limit: 20 }, { getNextPageParam: (lastPage) => lastPage.nextCursor });
  const allTournaments = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2"><Trophy className="h-6 w-6 text-neon-orange" /> Tournaments</h1>
          <p className="text-[13px] text-text-secondary">Compete in bracket-style tournaments</p>
        </div>
        <Link href="/tournaments/create" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors"><Plus className="h-4 w-4" /> Create Tournament</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as TournamentStatus | "ALL")}>
          <SelectTrigger className="w-44 bg-bg-tertiary border-af-border"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={(v) => setFormat(v as TournamentFormat | "ALL")}>
          <SelectTrigger className="w-44 bg-bg-tertiary border-af-border"><SelectValue placeholder="Format" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Formats</SelectItem>
            <SelectItem value="BRACKET">Bracket</SelectItem>
            <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
            <SelectItem value="KING_OF_THE_HILL">King of the Hill</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-36 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />))}</div>
      ) : allTournaments.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-electric-blue opacity-60" />
          <p className="text-base font-bold text-foreground">No tournaments found</p>
          <p className="text-[13px] text-muted-foreground mt-1 mb-4">Be the first to create one!</p>
          <Link href="/tournaments/create" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all">Create the first one</Link>
        </div>
      ) : (
        <div className="space-y-4">{allTournaments.map((t) => (<TournamentCard key={t.id} tournament={t} />))}</div>
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50">
            {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />} Load More
          </button>
        </div>
      )}
    </div>
  );
}
