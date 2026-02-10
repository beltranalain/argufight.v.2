"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";

export function ArenaPanel() {
  const { data: session } = useSession();
  const user = session?.user;
  const [filter, setFilter] = useState("ALL");

  // Fetch waiting debates (open challenges)
  const { data: waitingData, isLoading: isLoadingWaiting } =
    trpc.debate.list.useQuery(
      { status: "WAITING", limit: 10 },
      { retry: false }
    );

  // Fetch active debates (live battles)
  const categoryFilter = filter === "ALL" ? undefined : filter as "SPORTS" | "POLITICS" | "TECH" | "ENTERTAINMENT" | "SCIENCE" | "MUSIC" | "OTHER";
  const { data: activeData, isLoading: isLoadingActive } =
    trpc.debate.list.useQuery(
      { status: "ACTIVE", category: categoryFilter, limit: 10 },
      { retry: false }
    );

  // Fetch categories
  const { data: categoriesData } = trpc.debate.categories.useQuery(undefined, {
    retry: false,
  });

  const categories = ["ALL", ...(categoriesData?.map((c: any) => c.name) ?? [])];
  const waitingDebates = waitingData?.debates ?? [];
  const activeDebates = activeData?.debates ?? [];

  return (
    <div className="space-y-8">
      {/* Open Challenges Section */}
      <div className="rounded-xl border border-border bg-card p-6 mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Open Challenges
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Debates waiting for opponents
        </p>
        <div
          className="max-h-[60vh] overflow-y-auto pr-2"
          style={{ scrollBehavior: "smooth" }}
        >
          {isLoadingWaiting ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-accent animate-pulse"
                />
              ))}
            </div>
          ) : waitingDebates.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-sm font-semibold text-foreground">
                No Open Challenges
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to create a debate!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingDebates.map((debate: any) => (
                <Link
                  key={debate.id}
                  href={`/debate/${debate.id}`}
                  className="block p-4 rounded-lg border border-border bg-accent/50 hover:border-electric-blue/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate mb-1">
                        {debate.topic}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          {debate.category}
                        </span>
                        <span>
                          {debate.total_rounds} rounds
                        </span>
                        <span>•</span>
                        <span>
                          by {debate.challenger?.username || "Unknown"}
                        </span>
                      </div>
                    </div>
                    {debate.challenger_id !== user?.id && (
                      <span className="inline-flex items-center rounded-lg bg-electric-blue px-3 py-1.5 text-xs font-semibold text-black">
                        Accept
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Battles Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              Live Battles
            </h3>
            <p className="text-muted-foreground text-sm">
              All ongoing debates
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="category-filter"
              className="text-sm font-medium text-muted-foreground whitespace-nowrap"
            >
              Category:
            </label>
            <select
              id="category-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium cursor-pointer hover:border-electric-blue/50 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition-colors min-w-[150px]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "ALL" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Debates Grid */}
        {isLoadingActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-accent animate-pulse"
              />
            ))}
          </div>
        ) : activeDebates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <svg
              className="w-16 h-16 mx-auto mb-3 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-sm font-semibold text-foreground">
              No Active Debates
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first to start a debate!
            </p>
          </div>
        ) : (
          <div
            className="max-h-[60vh] overflow-y-auto pr-2"
            style={{ scrollBehavior: "smooth" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDebates.map((debate: any) => (
                <Link
                  key={debate.id}
                  href={`/debate/${debate.id}`}
                  className="block p-4 rounded-lg border border-border bg-accent/50 hover:border-electric-blue/50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {debate.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-electric-blue/20 px-2 py-0.5 text-xs font-medium text-electric-blue">
                      Round {debate.current_round}/{debate.total_rounds}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
                    {debate.topic}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{debate.challenger?.username || "?"}</span>
                    <span className="text-electric-blue font-bold">vs</span>
                    <span>{debate.opponent?.username || "?"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
