"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  Eye,
  MousePointer,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const campaignStatusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  APPROVED: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  ACTIVE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  PAUSED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/30",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AdvertiserDashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.advertiser.stats.useQuery();
  const { data: campaigns, isLoading: campaignsLoading } = trpc.advertiser.campaigns.useQuery();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Advertiser Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
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
        <Button asChild>
          <Link href="/advertise">Apply Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-neon-orange" />
          <h1 className="text-2xl font-bold">Advertiser Dashboard</h1>
        </div>
        <Button asChild>
          <Link href="/advertiser/campaigns/create">
            <Megaphone className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Campaigns" value={stats.campaigns} icon={FileText} />
        <StatsCard
          title="Total Budget"
          value={`$${stats.totalSpent.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatsCard title="Active Contracts" value={stats.activeContracts} icon={TrendingUp} />
        <StatsCard
          title="Impressions"
          value={stats.totalImpressions.toLocaleString()}
          icon={Eye}
        />
        <StatsCard
          title="Clicks"
          value={stats.totalClicks.toLocaleString()}
          icon={MousePointer}
        />
        <StatsCard title="CTR" value={`${stats.ctr}%`} icon={TrendingUp} />
      </div>

      {/* Campaigns list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Campaigns</h2>
        {campaignsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (campaigns ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No campaigns yet. Create your first campaign to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {(campaigns ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/advertiser/campaigns/${c.id}`}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card/80 p-4 hover:border-electric-blue/30 transition-colors"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-[10px] ${campaignStatusColors[c.status] ?? ""}`}>
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{c.type.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-neon-orange">${Number(c.budget).toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {c._count.impressions} imp · {c._count.clicks} clicks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
