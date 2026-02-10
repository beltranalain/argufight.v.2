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
    <>
      {/* Open Challenges Panel */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[22px] font-extrabold text-foreground">
            Open Challenges
          </h2>
        </div>
        <p className="text-[13px] text-text-secondary mb-4">
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
                  className="h-24 rounded-lg bg-bg-tertiary animate-pulse"
                />
              ))}
            </div>
          ) : waitingDebates.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-af-border rounded-xl">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-electric-blue opacity-60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-base font-bold text-foreground">
                No Open Challenges
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                There are no debates waiting for opponents right now
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingDebates.map((debate: any) => (
                <Link
                  key={debate.id}
                  href={`/debate/${debate.id}`}
                  className="af-debate-row"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate mb-1">
                        {debate.topic}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <span className="inline-flex px-[7px] py-[1px] rounded text-[10px] font-bold uppercase bg-electric-blue/20 text-electric-blue">
                          {debate.category}
                        </span>
                        <span>
                          {debate.total_rounds} rounds
                        </span>
                        <span>&bull;</span>
                        <span>
                          by {debate.challenger?.username || "Unknown"}
                        </span>
                      </div>
                    </div>
                    {debate.challenger_id !== user?.id && (
                      <span className="inline-flex items-center rounded-lg bg-electric-blue px-3 py-1.5 text-xs font-bold text-black">
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

      {/* Live Battles Panel */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[22px] font-extrabold text-foreground">
            Live Battles
          </h2>
        </div>
        <p className="text-[13px] text-text-secondary mb-4">
          Your active debate and all ongoing debates
        </p>

        {/* Category Filter */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[13px] text-text-secondary font-medium">
            Category:
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="af-filter-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "ALL" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Active Debates Grid */}
        {isLoadingActive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-bg-tertiary animate-pulse"
              />
            ))}
          </div>
        ) : activeDebates.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-af-border rounded-xl">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-electric-blue opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-base font-bold text-foreground">
              No Active Debates
            </p>
            <p className="text-[13px] text-muted-foreground mt-1">
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
                  className="af-debate-row"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-[7px] py-[1px] rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                      {debate.category}
                    </span>
                    <span className="inline-flex px-[7px] py-[1px] rounded text-[10px] font-bold bg-electric-blue/20 text-electric-blue">
                      Round {debate.current_round}/{debate.total_rounds}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
                    {debate.topic}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
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
    </>
  );
}
