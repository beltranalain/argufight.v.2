import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/80 p-3"
        >
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
