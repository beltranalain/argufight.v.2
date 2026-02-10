"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes("ready") || s.includes("completed"))
    return "bg-cyber-green text-black";
  if (s.includes("active")) return "bg-electric-blue text-black";
  if (s.includes("waiting")) return "bg-neon-orange text-black";
  if (s.includes("appealed")) return "bg-purple-500 text-white";
  return "bg-muted text-muted-foreground";
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: recentDebates, isLoading: isLoadingDebates } =
    trpc.admin.recentDebates.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </div>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
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
          className={
            stats.pendingModeration > 0 ? "border-neon-orange/30" : ""
          }
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={HelpCircle}
          className={stats.openTickets > 0 ? "border-neon-orange/30" : ""}
        />
      </div>

      {/* Recent Debates Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Debates</h2>
          <Link
            href="/admin/debates"
            className="text-sm font-medium text-electric-blue hover:text-neon-orange"
          >
            View All →
          </Link>
        </div>
        <div className="px-6 pb-6">
          {isLoadingDebates ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : !recentDebates?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No debates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDebates.map((debate: any) => (
                <Link
                  key={debate.id}
                  href={`/admin/debates`}
                  className="block p-4 rounded-lg border border-border bg-accent/50 hover:border-electric-blue hover:bg-accent transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {debate.category}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(debate.status)}`}
                        >
                          {formatStatus(debate.status)}
                        </span>
                        {debate.winner_id && (
                          <span className="inline-flex items-center rounded-full bg-cyber-green px-2 py-0.5 text-xs font-medium text-black">
                            Winner:{" "}
                            {debate.winner_id === debate.challenger?.id
                              ? debate.challenger?.username
                              : debate.opponent?.username || "Unknown"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                        {debate.topic}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={debate.challenger?.avatar_url}
                              alt={debate.challenger?.username}
                            />
                            <AvatarFallback className="text-[10px]">
                              {debate.challenger?.username
                                ?.slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={
                              debate.winner_id === debate.challenger?.id
                                ? "text-cyber-green font-semibold"
                                : ""
                            }
                          >
                            {debate.challenger?.username}
                          </span>
                        </div>
                        <span className="font-bold text-electric-blue">VS</span>
                        {debate.opponent ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={debate.opponent?.avatar_url}
                                alt={debate.opponent?.username}
                              />
                              <AvatarFallback className="text-[10px]">
                                {debate.opponent?.username
                                  ?.slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={
                                debate.winner_id === debate.opponent?.id
                                  ? "text-cyber-green font-semibold"
                                  : ""
                              }
                            >
                              {debate.opponent?.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Waiting...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(debate.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
