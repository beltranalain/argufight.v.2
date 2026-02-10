"use client";

import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { Bookmark, Loader2 } from "lucide-react";

export default function SavedDebatesPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.debate.savedDebates.useInfiniteQuery(
      { limit: 18 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const debates = data?.pages.flatMap((page) => page.debates) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Debates
        </h1>
        <p className="text-[13px] text-text-secondary">
          Debates you&apos;ve bookmarked for later
        </p>
      </div>

      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <Bookmark className="w-10 h-10 mx-auto mb-3 text-electric-blue opacity-60" />
          <p className="text-base font-bold text-foreground">No saved debates</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            Click the bookmark icon on any debate to save it here.
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
