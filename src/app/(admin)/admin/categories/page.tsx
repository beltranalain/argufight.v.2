"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder } from "lucide-react";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = trpc.admin.categories.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Folder className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(categories ?? []).map((cat) => (
            <div
              key={cat.category ?? "null"}
              className="rounded-xl border border-border/50 bg-card/80 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{cat.category ?? "Uncategorized"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Debate category</p>
              </div>
              <Badge variant="outline" className="text-neon-orange">
                {cat._count.id} debates
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
