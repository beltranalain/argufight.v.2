"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { History, Loader2 } from "lucide-react";

type StatusFilter = "COMPLETED" | "VERDICT_READY" | "APPEALED" | "CANCELLED" | undefined;

const tabs = [
  { value: undefined, label: "All" },
  { value: "COMPLETED" as const, label: "Completed" },
  { value: "VERDICT_READY" as const, label: "Verdicts" },
  { value: "CANCELLED" as const, label: "Cancelled" },
];

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
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
          <History className="h-5 w-5" />
          Debate History
        </h1>
        <p className="text-[13px] text-text-secondary">
          Your past debates and their outcomes
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-af-border">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              statusFilter === tab.value
                ? "border-electric-blue text-electric-blue"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <History className="w-10 h-10 mx-auto mb-3 text-electric-blue opacity-60" />
          <p className="text-base font-bold text-foreground">No debates yet</p>
          <p className="text-[13px] text-muted-foreground mt-1">
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
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
              >
                {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
