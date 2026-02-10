"use client";

import { trpc } from "@/lib/trpc-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

interface BeltHistoryProps {
  beltId: string;
}

const reasonLabels: Record<string, string> = {
  DEBATE_WIN: "Won debate",
  TOURNAMENT_WIN: "Tournament victory",
  MANDATORY_LOSS: "Mandatory defense lost",
  INACTIVITY: "Inactivity",
  ADMIN_TRANSFER: "Admin transfer",
  CHALLENGE_WIN: "Challenge won",
  FORFEIT: "Forfeited",
};

const reasonColors: Record<string, string> = {
  DEBATE_WIN: "border-cyber-green/30 text-cyber-green",
  TOURNAMENT_WIN: "border-neon-orange/30 text-neon-orange",
  CHALLENGE_WIN: "border-electric-blue/30 text-electric-blue",
  MANDATORY_LOSS: "border-destructive/30 text-destructive",
  INACTIVITY: "border-muted-foreground/30 text-muted-foreground",
  ADMIN_TRANSFER: "border-yellow-400/30 text-yellow-400",
  FORFEIT: "border-destructive/30 text-destructive",
};

export function BeltHistory({ beltId }: BeltHistoryProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.belt.history.useInfiniteQuery(
      { beltId, limit: 15 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];

  if (allItems.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No belt transfers yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {allItems.map((entry) => {
        const from = entry.users_belt_history_from_user_idTousers;
        const to = entry.users_belt_history_to_user_idTousers;

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/80 p-3"
          >
            {/* From user */}
            {from ? (
              <Link href={`/${from.username}`} className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[8px]">
                    {from.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{from.username}</span>
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Vacant</span>
            )}

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

            {/* To user */}
            {to ? (
              <Link href={`/${to.username}`} className="flex items-center gap-2 hover:opacity-80">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[8px]">
                    {to.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{to.username}</span>
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">Vacated</span>
            )}

            <div className="ml-auto flex items-center gap-2 text-right shrink-0">
              <Badge
                variant="outline"
                className={`text-[10px] ${reasonColors[entry.reason] ?? ""}`}
              >
                {reasonLabels[entry.reason] ?? entry.reason}
              </Badge>
              <div className="text-[10px] text-muted-foreground">
                <p>{entry.days_held}d held</p>
                <p>{formatDistanceToNow(entry.transferred_at)}</p>
              </div>
            </div>
          </div>
        );
      })}

      {hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Load More
        </Button>
      )}
    </div>
  );
}
