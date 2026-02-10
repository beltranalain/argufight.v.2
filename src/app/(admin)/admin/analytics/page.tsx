"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, Swords, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: stats.newUsersWeek, label: "new this week" }}
        />
        <StatsCard
          title="Total Debates"
          value={stats.totalDebates.toLocaleString()}
          icon={Swords}
          trend={{ value: stats.newDebatesWeek, label: "new this week" }}
        />
        <StatsCard
          title="Active Debates"
          value={stats.activeDebates}
          icon={TrendingUp}
        />
        <StatsCard
          title="Pro Subscribers"
          value={stats.proSubscribers}
          icon={Users}
        />
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border/30 p-4">
              <p className="text-xs text-muted-foreground">Avg. Debates/User</p>
              <p className="text-xl font-bold mt-1">
                {stats.totalUsers > 0
                  ? (stats.totalDebates / stats.totalUsers).toFixed(1)
                  : "0"}
              </p>
            </div>
            <div className="rounded-lg border border-border/30 p-4">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-xl font-bold mt-1">
                {stats.totalUsers > 0
                  ? ((stats.proSubscribers / stats.totalUsers) * 100).toFixed(1)
                  : "0"}
                %
              </p>
              <p className="text-[10px] text-muted-foreground">Free → Pro</p>
            </div>
            <div className="rounded-lg border border-border/30 p-4">
              <p className="text-xs text-muted-foreground">Active Belt Ratio</p>
              <p className="text-xl font-bold mt-1">{stats.totalBelts}</p>
              <p className="text-[10px] text-muted-foreground">Active belts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.pendingAppeals > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-neon-orange/30 bg-neon-orange/5 p-3">
                <span className="text-sm">{stats.pendingAppeals} pending appeal(s)</span>
                <a href="/admin/appeals" className="text-xs text-neon-orange hover:underline">
                  Review
                </a>
              </div>
            )}
            {stats.openTickets > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-electric-blue/30 bg-electric-blue/5 p-3">
                <span className="text-sm">{stats.openTickets} open support ticket(s)</span>
                <a href="/admin/support" className="text-xs text-electric-blue hover:underline">
                  View
                </a>
              </div>
            )}
            {stats.pendingAppeals === 0 && stats.openTickets === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                All clear — no pending items.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
