"use client";

import Link from "next/link";
import { ArenaPanel } from "@/components/dashboard/arena-panel";
import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";
import { BeltsPanel } from "@/components/dashboard/belts-panel";
import { TournamentsPanel } from "@/components/dashboard/tournaments-panel";

export default function DashboardPage() {
  return (
    <div className="pt-16 md:pt-20 px-4 md:px-8 pb-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Main Grid Layout - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 - Left: Arena (Open Challenges + Live Battles) */}
          <div className="space-y-6">
            <ArenaPanel />
          </div>

          {/* Column 2 - Middle: Profile + Leaderboard */}
          <div className="space-y-6">
            {/* Your Profile */}
            <div className="rounded-xl border border-border bg-card p-6 mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Profile
              </h2>
              <ProfilePanel />
            </div>

            {/* ELO Leaderboard */}
            <div className="rounded-xl border border-border bg-card p-6">
              <LeaderboardPanel />
            </div>
          </div>

          {/* Column 3 - Right: Belts + Tournaments */}
          <div className="space-y-6">
            {/* Belts */}
            <div className="rounded-xl border border-border bg-card p-6 mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-foreground">Belts</h2>
                <Link
                  href="/belts/room"
                  className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  View All
                </Link>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Your championship belts and challenges
              </p>
              <BeltsPanel />
            </div>

            {/* Tournaments */}
            <div className="rounded-xl border border-border bg-card p-6">
              <TournamentsPanel />
            </div>
          </div>
        </div>
      </div>

      {/* FAB Button - Create Debate */}
      <Link
        href="/debates?create=true"
        className="fixed bottom-20 right-4 md:bottom-24 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-electric-blue flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-transform z-40 hover:bg-[#00B8E6]"
        aria-label="Create Debate"
      >
        <svg
          className="w-6 h-6 md:w-8 md:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
  );
}
