import { Skeleton } from "@/components/ui/skeleton";

export function DebateCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-3 h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-6" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function DebateListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DebateCardSkeleton key={i} />
      ))}
    </div>
  );
}
