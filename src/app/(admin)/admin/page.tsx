"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc-client";
import { StatsCard } from "@/components/admin/stats-card";
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

function getCategoryColor(category: string) {
  const c = category?.toLowerCase() ?? "";
  if (c === "entertainment") return "bg-cyber-green/15 text-cyber-green";
  if (c === "sports") return "bg-electric-blue/15 text-electric-blue";
  if (c === "politics") return "bg-neon-orange/15 text-neon-orange";
  if (c === "tech") return "bg-purple-500/15 text-purple-400";
  if (c === "science") return "bg-hot-pink/15 text-hot-pink";
  return "bg-muted text-muted-foreground";
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: recentDebates, isLoading: isLoadingDebates } =
    trpc.admin.recentDebates.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[32px] font-extrabold text-foreground mb-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-text-secondary">
            Platform overview and management
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-[14px] bg-bg-secondary border border-af-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[32px] font-extrabold text-foreground mb-1">
          Admin Dashboard
        </h1>
        <p className="text-sm text-text-secondary">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
          trend={{ value: stats.newUsersWeek, label: "new this week" }}
        />
        <StatsCard
          title="Total Debates"
          value={stats.totalDebates.toLocaleString()}
          icon={Swords}
          color="pink"
          trend={{ value: stats.newDebatesWeek, label: "new this week" }}
        />
        <StatsCard
          title="Active Debates"
          value={stats.activeDebates}
          icon={TrendingUp}
          color="green"
          description="Currently in progress"
        />
        <StatsCard
          title="Active Belts"
          value={stats.totalBelts}
          icon={Award}
          color="orange"
        />
        <StatsCard
          title="Active Tournaments"
          value={stats.activeTournaments}
          icon={Trophy}
          color="blue"
        />
        <StatsCard
          title="Pro Subscribers"
          value={stats.proSubscribers}
          icon={CreditCard}
          color="pink"
        />
        <StatsCard
          title="Revenue (Coins)"
          value={stats.totalRevenue.toLocaleString()}
          icon={DollarSign}
          color="green"
          description="Total coin purchases"
        />
        <StatsCard
          title="Pending Appeals"
          value={stats.pendingAppeals}
          icon={AlertTriangle}
          color="orange"
          className={stats.pendingAppeals > 0 ? "border-neon-orange/30" : ""}
        />
        <StatsCard
          title="Pending Moderation"
          value={stats.pendingModeration}
          icon={ShieldAlert}
          color="blue"
          className={
            stats.pendingModeration > 0 ? "border-neon-orange/30" : ""
          }
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={HelpCircle}
          color="pink"
          className={stats.openTickets > 0 ? "border-neon-orange/30" : ""}
        />
      </div>

      {/* Recent Debates */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-af-border">
          <h2 className="text-xl font-bold text-foreground">Recent Debates</h2>
          <Link
            href="/admin/debates"
            className="text-sm font-semibold text-electric-blue hover:text-neon-orange transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="p-4 md:p-6">
          {isLoadingDebates ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-[10px] bg-bg-tertiary animate-pulse"
                />
              ))}
            </div>
          ) : !recentDebates?.length ? (
            <div className="text-center py-12 border-2 border-dashed border-af-border rounded-xl">
              <Swords className="w-12 h-12 mx-auto mb-3 text-electric-blue opacity-60" />
              <p className="text-base font-bold text-foreground">
                No Debates Yet
              </p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Debates will appear here once users start debating
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDebates.map((debate: any) => (
                <Link
                  key={debate.id}
                  href={`/admin/debates`}
                  className="af-debate-row"
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(debate.category)}`}
                    >
                      {debate.category}
                    </span>
                    <span
                      className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${getStatusColor(debate.status)}`}
                    >
                      {formatStatus(debate.status)}
                    </span>
                    {debate.winner_id && (
                      <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold bg-cyber-green text-black">
                        Winner:{" "}
                        {debate.winner_id === debate.challenger?.id
                          ? debate.challenger?.username
                          : debate.opponent?.username || "Unknown"}
                      </span>
                    )}
                  </div>

                  {/* Topic */}
                  <h3 className="text-[15px] font-semibold text-foreground mb-2.5 line-clamp-1 leading-snug">
                    {debate.topic}
                  </h3>

                  {/* Participants + Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[13px] text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          className={`h-7 w-7 ${debate.winner_id === debate.challenger?.id ? "ring-2 ring-cyber-green" : ""}`}
                        >
                          <AvatarImage
                            src={debate.challenger?.avatar_url}
                            alt={debate.challenger?.username}
                          />
                          <AvatarFallback className="text-[10px] bg-electric-blue/20 text-electric-blue font-bold">
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
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            className={`h-7 w-7 ${debate.winner_id === debate.opponent?.id ? "ring-2 ring-cyber-green" : ""}`}
                          >
                            <AvatarImage
                              src={debate.opponent?.avatar_url}
                              alt={debate.opponent?.username}
                            />
                            <AvatarFallback className="text-[10px] bg-neon-orange/20 text-neon-orange font-bold">
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
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap ml-5">
                      {new Date(debate.created_at).toLocaleDateString()}
                    </span>
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
