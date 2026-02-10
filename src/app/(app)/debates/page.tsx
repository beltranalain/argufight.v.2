"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DebateCard } from "@/components/debate/debate-card";
import { DebateListSkeleton } from "@/components/skeletons/debate-card-skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <h1 className="text-[24px] font-extrabold text-foreground">Debates</h1>
          <p className="text-[13px] text-text-secondary">
            Browse and join debates on any topic
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Debate
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search debates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-bg-tertiary border-af-border"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[160px] bg-bg-tertiary border-af-border">
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
          <SelectTrigger className="w-[140px] bg-bg-tertiary border-af-border">
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
          <SelectTrigger className="w-[140px] bg-bg-tertiary border-af-border">
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
            <button
              onClick={() => setCategory("all")}
              className="inline-flex px-2.5 py-1 rounded-md bg-bg-tertiary border border-af-border text-xs text-foreground hover:border-electric-blue transition-colors"
            >
              {category} &times;
            </button>
          )}
          {status !== "all" && (
            <button
              onClick={() => setStatus("all")}
              className="inline-flex px-2.5 py-1 rounded-md bg-bg-tertiary border border-af-border text-xs text-foreground hover:border-electric-blue transition-colors"
            >
              {status} &times;
            </button>
          )}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="inline-flex px-2.5 py-1 rounded-md bg-bg-tertiary border border-af-border text-xs text-foreground hover:border-electric-blue transition-colors"
            >
              &quot;{search}&quot; &times;
            </button>
          )}
        </div>
      )}

      {/* Debate grid */}
      {isLoading ? (
        <DebateListSkeleton count={6} />
      ) : debates.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <Search className="w-12 h-12 mx-auto mb-3 text-electric-blue opacity-60" />
          <p className="text-base font-bold text-foreground">No debates found</p>
          <p className="text-[13px] text-muted-foreground mt-1 mb-4">
            Try adjusting your filters or create a new debate.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Debate
          </button>
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
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
              >
                {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create debate dialog */}
      <CreateDebateDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
