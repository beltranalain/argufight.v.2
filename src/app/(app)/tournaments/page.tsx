"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { TournamentCard } from "@/components/tournament/tournament-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

type TournamentStatus = "UPCOMING" | "REGISTRATION_OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TournamentFormat = "BRACKET" | "CHAMPIONSHIP" | "KING_OF_THE_HILL";

export default function TournamentsPage() {
  const [status, setStatus] = useState<TournamentStatus | "ALL">("ALL");
  const [format, setFormat] = useState<TournamentFormat | "ALL">("ALL");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.tournament.list.useInfiniteQuery(
      {
        status: status === "ALL" ? undefined : status,
        format: format === "ALL" ? undefined : format,
        limit: 20,
      },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const allTournaments = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-neon-orange" />
            Tournaments
          </h1>
          <p className="text-sm text-muted-foreground">
            Compete in bracket-style tournaments
          </p>
        </div>
        <Button
          className="bg-electric-blue text-black hover:bg-electric-blue/90"
          asChild
        >
          <Link href="/tournaments/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Tournament
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as TournamentStatus | "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
            <SelectItem value="UPCOMING">Upcoming</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={format} onValueChange={(v) => setFormat(v as TournamentFormat | "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Formats</SelectItem>
            <SelectItem value="BRACKET">Bracket</SelectItem>
            <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
            <SelectItem value="KING_OF_THE_HILL">King of the Hill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tournament list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : allTournaments.length === 0 ? (
        <div className="py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No tournaments found.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/tournaments/create">Create the first one</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {allTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
