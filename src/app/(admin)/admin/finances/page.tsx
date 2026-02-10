"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CreditCard, Coins, TrendingUp } from "lucide-react";

export default function AdminFinancesPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Finances</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={`${(stats?.totalRevenue ?? 0).toLocaleString()} coins`}
              icon={DollarSign}
              description="Lifetime coin purchases"
            />
            <StatsCard
              title="Pro Subscribers"
              value={stats?.proSubscribers ?? 0}
              icon={CreditCard}
              description="Active subscriptions"
            />
            <StatsCard
              title="Active Belts"
              value={stats?.totalBelts ?? 0}
              icon={Coins}
              description="Belt economy"
            />
            <StatsCard
              title="Tournaments"
              value={stats?.activeTournaments ?? 0}
              icon={TrendingUp}
              description="Active tournaments"
            />
          </div>

          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Revenue Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/30 p-3">
                  <div>
                    <p className="text-sm font-medium">Coin Purchases</p>
                    <p className="text-xs text-muted-foreground">Direct coin package sales</p>
                  </div>
                  <span className="text-sm font-mono text-neon-orange">
                    {(stats?.totalRevenue ?? 0).toLocaleString()} coins
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/30 p-3">
                  <div>
                    <p className="text-sm font-medium">Subscriptions</p>
                    <p className="text-xs text-muted-foreground">Pro plan recurring revenue</p>
                  </div>
                  <span className="text-sm font-mono text-electric-blue">
                    {stats?.proSubscribers ?? 0} active
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/30 p-3">
                  <div>
                    <p className="text-sm font-medium">Belt Platform Fees</p>
                    <p className="text-xs text-muted-foreground">Commission from belt challenges</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Tracked per belt</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
