"use client";

import Link from "next/link";
import { ArenaPanel } from "@/components/dashboard/arena-panel";
import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";
import { BeltsPanel } from "@/components/dashboard/belts-panel";
import { TournamentsPanel } from "@/components/dashboard/tournaments-panel";

export default function DashboardPage() {
  return (
    <div className="px-4 md:px-8 py-5">
      <div className="max-w-[1600px] mx-auto">
        {/* Main Grid Layout - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 - Left: Arena (Open Challenges + Live Battles) */}
          <div className="flex flex-col gap-6">
            <ArenaPanel />
          </div>

          {/* Column 2 - Middle: Profile + Leaderboard */}
          <div className="flex flex-col gap-6">
            <ProfilePanel />
            <LeaderboardPanel />
          </div>

          {/* Column 3 - Right: Belts + Tournaments */}
          <div className="flex flex-col gap-6">
            <BeltsPanel />
            <TournamentsPanel />
          </div>
        </div>
      </div>

      {/* FAB Button - Create Debate */}
      <Link
        href="/debates?create=true"
        className="fixed bottom-10 right-8 w-[60px] h-[60px] rounded-full bg-electric-blue flex items-center justify-center text-black shadow-[0_4px_24px_rgba(0,217,255,0.35)] hover:scale-110 hover:bg-[#00B8E6] active:scale-95 transition-transform z-40"
        aria-label="Create Debate"
      >
        <svg
          className="w-7 h-7"
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
