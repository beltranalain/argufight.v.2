import { Skeleton } from "@/components/ui/skeleton";

export function TournamentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export function TournamentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <TournamentCardSkeleton key={i} />
      ))}
    </div>
  );
}
