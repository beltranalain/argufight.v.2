"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import { CreateDebateDialog } from "@/components/debate/debate-form";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "SPORTS", label: "Sports" },
  { value: "POLITICS", label: "Politics" },
  { value: "TECH", label: "Tech" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "SCIENCE", label: "Science" },
  { value: "MUSIC", label: "Music" },
  { value: "OTHER", label: "Other" },
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "WAITING", label: "Waiting" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "VERDICT_READY", label: "Verdict Ready" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Viewed" },
  { value: "trending", label: "Trending" },
];

export default function DebatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "trending">("newest");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.debate.list.useInfiniteQuery(
      {
        limit: 18,
        category: category === "all" ? undefined : category as never,
        status: status === "all" ? undefined : status as never,
        search: search || undefined,
        sortBy,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const debates = data?.pages.flatMap((page) => page.debates) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Debates</h1>
          <p className="text-sm text-muted-foreground">
            Browse and join debates on any topic
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-electric-blue text-black hover:bg-electric-blue/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Debate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search debates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters display */}
      {(category !== "all" || status !== "all" || search) && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {category !== "all" && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setCategory("all")}>
              {category} &times;
            </Badge>
          )}
          {status !== "all" && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setStatus("all")}>
              {status} &times;
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSearch("")}>
              &quot;{search}&quot; &times;
            </Badge>
          )}
        </div>
      )}

      {/* Debate grid */}
      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No debates found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or create a new debate.
          </p>
          <Button
            onClick={() => setShowCreate(true)}
            className="mt-4 bg-electric-blue text-black hover:bg-electric-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Debate
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create debate dialog */}
      <CreateDebateDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
