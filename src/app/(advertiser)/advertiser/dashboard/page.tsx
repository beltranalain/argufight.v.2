"use client";

import { trpc } from "@/lib/trpc-client";
import { Megaphone, DollarSign, Eye, MousePointer, TrendingUp, FileText, Plus } from "lucide-react";
import Link from "next/link";

const campaignStatusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-neon-orange text-black",
  APPROVED: "bg-electric-blue text-black",
  ACTIVE: "bg-cyber-green text-black",
  PAUSED: "bg-yellow-500 text-black",
  COMPLETED: "bg-blue-500 text-white",
  REJECTED: "bg-red-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

export default function AdvertiserDashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.advertiser.stats.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.advertiser.campaigns.useQuery();

  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-foreground mb-1">
            Advertiser Dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your campaigns, track performance, and reach debaters
          </p>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-[14px] bg-bg-secondary border border-af-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Not yet an advertiser</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Apply to become an advertiser to reach debaters.
        </p>
        <Link
          href="/advertise"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-electric-blue text-black font-semibold text-sm hover:bg-[#00b8e6] transition-colors"
        >
          Apply Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[32px] font-extrabold text-foreground mb-1">
          Advertiser Dashboard
        </h1>
        <p className="text-sm text-text-secondary">
          Manage your campaigns, track performance, and reach debaters
        </p>
      </div>

      {/* Stats Row — 5 columns */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="af-stat-card stat-blue">
          <div className="af-stat-card-title uppercase tracking-wider text-xs mb-2">
            Active Campaigns
          </div>
          <div className="af-stat-card-value">{stats.campaigns}</div>
        </div>
        <div className="af-stat-card stat-green">
          <div className="af-stat-card-title uppercase tracking-wider text-xs mb-2">
            Total Impressions
          </div>
          <div className="af-stat-card-value">
            {stats.totalImpressions >= 1000
              ? `${(stats.totalImpressions / 1000).toFixed(1)}K`
              : stats.totalImpressions.toLocaleString()}
          </div>
        </div>
        <div className="af-stat-card stat-pink">
          <div className="af-stat-card-title uppercase tracking-wider text-xs mb-2">
            Total Clicks
          </div>
          <div className="af-stat-card-value">
            {stats.totalClicks.toLocaleString()}
          </div>
        </div>
        <div className="af-stat-card stat-orange">
          <div className="af-stat-card-title uppercase tracking-wider text-xs mb-2">
            CTR
          </div>
          <div className="af-stat-card-value">{stats.ctr}%</div>
        </div>
        <div className="af-stat-card stat-blue">
          <div className="af-stat-card-title uppercase tracking-wider text-xs mb-2">
            Total Spent
          </div>
          <div className="af-stat-card-value">
            ${stats.totalSpent.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Campaigns</h2>
          <Link
            href="/advertiser/campaigns/create"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-electric-blue text-black font-semibold text-sm hover:bg-[#00b8e6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>
        </div>

        {campaignsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-[12px] bg-bg-secondary border border-af-border animate-pulse"
              />
            ))}
          </div>
        ) : (campaigns ?? []).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-af-border rounded-[14px]">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-60" />
            <p className="text-base font-bold text-foreground">
              No Campaigns Yet
            </p>
            <p className="text-[13px] text-muted-foreground mt-1 mb-4">
              Create your first campaign to get started
            </p>
            <Link
              href="/advertiser/campaigns/create"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-electric-blue text-black font-semibold text-sm hover:bg-[#00b8e6] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(campaigns ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/advertiser/campaigns/${c.id}`}
                className="block bg-bg-secondary border border-af-border rounded-[12px] p-5 hover:border-electric-blue transition-colors"
              >
                {/* Top row: name + badges */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      {c.name}
                    </h3>
                    <span className="text-xs text-muted-foreground uppercase">
                      {c.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${campaignStatusColors[c.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex gap-6 mb-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-0.5">
                      Budget
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      ${Number(c.budget).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-0.5">
                      Impressions
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {c._count.impressions.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-0.5">
                      Clicks
                    </span>
                    <span className="text-[15px] font-bold text-foreground">
                      {c._count.clicks.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
