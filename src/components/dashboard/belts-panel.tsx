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
      <div className="space-y-4">
        <div className="h-20 rounded-lg bg-accent animate-pulse" />
        <div className="h-20 rounded-lg bg-accent animate-pulse" />
      </div>
    );
  }

  if (belts.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-electric-blue/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-electric-blue"
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
        <p className="text-muted-foreground text-sm mb-4">
          No belts available yet
        </p>
        <Link
          href="/belts/room"
          className="text-sm text-electric-blue hover:text-neon-orange"
        >
          Visit Belt Room →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {belts.map((belt: any) => (
          <Link
            key={belt.id}
            href={`/belts/${belt.id}`}
            className="block rounded-lg border border-border bg-accent/50 p-3 hover:border-electric-blue/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {belt.design_image_url ? (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border bg-card flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={belt.design_image_url}
                    alt={belt.name}
                    className="w-[140%] h-[140%] object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
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
                <p className="text-sm font-medium text-foreground truncate mb-1">
                  {belt.name}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
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
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {belt.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Rules */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 font-semibold">
          Quick Rules:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Challenge belts with coins or free weekly challenge</li>
          <li>• Win debates to claim belts</li>
          <li>• Defend your belts from challengers</li>
          <li>• First 30 days are protected</li>
        </ul>
      </div>
    </div>
  );
}
