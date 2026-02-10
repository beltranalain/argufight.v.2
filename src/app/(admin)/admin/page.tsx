"use client";

import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Swords,
  Award,
  Trophy,
  DollarSign,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

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
          description="Currently in progress"
        />
        <StatsCard
          title="Active Belts"
          value={stats.totalBelts}
          icon={Award}
        />
        <StatsCard
          title="Active Tournaments"
          value={stats.activeTournaments}
          icon={Trophy}
        />
        <StatsCard
          title="Pro Subscribers"
          value={stats.proSubscribers}
          icon={CreditCard}
        />
        <StatsCard
          title="Revenue (Coins)"
          value={stats.totalRevenue.toLocaleString()}
          icon={DollarSign}
          description="Total coin purchases"
        />
        <StatsCard
          title="Pending Appeals"
          value={stats.pendingAppeals}
          icon={AlertTriangle}
          className={stats.pendingAppeals > 0 ? "border-neon-orange/30" : ""}
        />
        <StatsCard
          title="Pending Moderation"
          value={stats.pendingModeration}
          icon={ShieldAlert}
          className={stats.pendingModeration > 0 ? "border-neon-orange/30" : ""}
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={HelpCircle}
          className={stats.openTickets > 0 ? "border-neon-orange/30" : ""}
        />
      </div>
    </div>
  );
}
