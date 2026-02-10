import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-3 border-b border-border/50 bg-muted/20">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-border/30 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
