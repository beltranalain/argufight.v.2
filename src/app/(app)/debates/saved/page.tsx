"use client";

import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Saved Debates
        </h1>
        <p className="text-sm text-muted-foreground">
          Debates you&apos;ve bookmarked for later
        </p>
      </div>

      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No saved debates</p>
          <p className="mt-1 text-sm text-muted-foreground">
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
