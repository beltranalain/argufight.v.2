"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  DollarSign,
  Handshake,
  FileText,
  Eye,
  MousePointer,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function CreatorDashboardPage() {
  const { data: status, isLoading: statusLoading } = trpc.creator.status.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.creator.stats.useQuery();

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!status?.isCreator) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="h-12 w-12 text-cyber-green mb-4" />
        <h2 className="text-xl font-bold mb-2">Become a Creator</h2>
        <p className="text-muted-foreground text-sm mb-4 max-w-md">
          Join ArguFight's creator program to earn money from sponsorships,
          ad placements on your debates, and more.
        </p>
        <Button asChild className="bg-cyber-green text-black hover:bg-cyber-green/90">
          <Link href="/creator/setup">Get Started</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-cyber-green" />
        <h1 className="text-2xl font-bold">Creator Dashboard</h1>
        {status.creatorStatus && (
          <Badge variant="outline" className="text-cyber-green border-cyber-green/30">
            {status.creatorStatus}
          </Badge>
        )}
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Active Contracts"
            value={stats.activeContracts}
            icon={FileText}
          />
          <StatsCard
            title="Pending Offers"
            value={stats.pendingOffers}
            icon={Handshake}
            className={stats.pendingOffers > 0 ? "border-neon-orange/30" : ""}
          />
          <StatsCard
            title="Completed Contracts"
            value={stats.completedContracts}
            icon={FileText}
          />
          <StatsCard
            title="Total Impressions"
            value={stats.totalImpressions.toLocaleString()}
            icon={Eye}
          />
          <StatsCard
            title="Total Clicks"
            value={stats.totalClicks.toLocaleString()}
            icon={MousePointer}
          />
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/creator/offers"
          className="rounded-xl border border-border/50 bg-card/80 p-4 hover:border-cyber-green/30 transition-colors"
        >
          <Handshake className="h-5 w-5 text-cyber-green mb-2" />
          <p className="font-medium text-sm">View Offers</p>
          <p className="text-xs text-muted-foreground">Review and respond to sponsorship offers</p>
        </Link>
        <Link
          href="/creator/earnings"
          className="rounded-xl border border-border/50 bg-card/80 p-4 hover:border-cyber-green/30 transition-colors"
        >
          <DollarSign className="h-5 w-5 text-cyber-green mb-2" />
          <p className="font-medium text-sm">Earnings</p>
          <p className="text-xs text-muted-foreground">Track your earnings and payouts</p>
        </Link>
        <Link
          href="/creator/settings"
          className="rounded-xl border border-border/50 bg-card/80 p-4 hover:border-cyber-green/30 transition-colors"
        >
          <Sparkles className="h-5 w-5 text-cyber-green mb-2" />
          <p className="font-medium text-sm">Settings</p>
          <p className="text-xs text-muted-foreground">Profile, tax info, and preferences</p>
        </Link>
      </div>
    </div>
  );
}
