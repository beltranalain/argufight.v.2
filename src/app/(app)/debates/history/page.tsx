"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Loader2 } from "lucide-react";

type StatusFilter = "COMPLETED" | "VERDICT_READY" | "APPEALED" | "CANCELLED" | undefined;

export default function DebateHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.debate.myDebates.useInfiniteQuery(
      { limit: 18, status: statusFilter },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const debates = data?.pages.flatMap((page) => page.debates) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-5 w-5" />
          Debate History
        </h1>
        <p className="text-sm text-muted-foreground">
          Your past debates and their outcomes
        </p>
      </div>

      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(v) =>
          setStatusFilter(v === "all" ? undefined : (v as StatusFilter))
        }
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="VERDICT_READY">Verdicts</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <History className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No debates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a new debate to see your history here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
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
        </>
      )}
    </div>
  );
}
