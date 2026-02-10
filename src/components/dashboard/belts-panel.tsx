"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

export function BeltsPanel() {
  const { data, isLoading } = trpc.belt.list.useQuery(
    {},
    { retry: false }
  );

  const belts = (Array.isArray(data) ? data : []).slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[22px] font-extrabold text-foreground">Belts</h2>
        </div>
        <p className="text-[13px] text-text-secondary mb-4">
          Your championship belts and challenges
        </p>
        <div className="space-y-3">
          <div className="h-[72px] rounded-[10px] bg-bg-tertiary animate-pulse" />
          <div className="h-[72px] rounded-[10px] bg-bg-tertiary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-af-border rounded-[14px] p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[22px] font-extrabold text-foreground">Belts</h2>
        <Link
          href="/belts/room"
          className="inline-flex items-center px-4 py-1.5 rounded-lg border border-af-border bg-bg-tertiary text-foreground text-[13px] font-semibold hover:border-electric-blue hover:text-electric-blue transition-all"
        >
          View All
        </Link>
      </div>
      <p className="text-[13px] text-text-secondary mb-4">
        Your championship belts and challenges
      </p>

      {belts.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-af-border rounded-xl">
          <div className="w-12 h-12 mx-auto mb-3 bg-electric-blue/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-electric-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <p className="text-base font-bold text-foreground">
            No belts available yet
          </p>
          <p className="text-[13px] text-muted-foreground mt-1 mb-4">
            Visit the Belt Room to see championships
          </p>
          <Link
            href="/belts/room"
            className="text-[13px] font-semibold text-electric-blue hover:text-neon-orange transition-colors"
          >
            Visit Belt Room &rarr;
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {belts.map((belt: any) => (
              <Link
                key={belt.id}
                href={`/belts/${belt.id}`}
                className="flex items-center gap-3 p-3 rounded-[10px] bg-bg-tertiary border border-af-border hover:border-electric-blue/30 transition-all"
              >
                {belt.design_image_url ? (
                  <div className="flex-shrink-0 w-14 h-14 rounded-[10px] overflow-hidden border border-af-border bg-bg-secondary flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={belt.design_image_url}
                      alt={belt.name}
                      className="w-[130%] h-[130%] object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-14 h-14 rounded-[10px] border-2 border-dashed border-af-border flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate mb-0.5">
                    {belt.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-[1px] text-[10px] font-bold uppercase ${
                        belt.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : belt.status === "INACTIVE"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {belt.status?.replace(/_/g, " ")}
                    </span>
                    {belt.category && (
                      <span className="inline-flex items-center rounded-md px-2 py-[1px] text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                        {belt.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Rules */}
          <div className="pt-3 mt-3 border-t border-af-border">
            <p className="text-[11px] text-text-secondary mb-1.5 font-bold">
              Quick Rules:
            </p>
            <ul className="text-[11px] text-text-secondary space-y-0.5">
              <li>&bull; Challenge belts with coins or free weekly challenge</li>
              <li>&bull; Win debates to claim belts</li>
              <li>&bull; Defend your belts from challengers</li>
              <li>&bull; First 30 days are protected</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
