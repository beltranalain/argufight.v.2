"use client";

import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const typeColors: Record<string, string> = {
  ROOKIE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  CATEGORY: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  CHAMPIONSHIP: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  UNDEFEATED: "bg-hot-pink/10 text-hot-pink border-hot-pink/30",
  TOURNAMENT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
};

export default function AdminBeltsPage() {
  const { data: belts, isLoading } = trpc.admin.belts.useQuery();
  const { data: settings, isLoading: settingsLoading } = trpc.admin.beltSettings.useQuery();

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{String(row.name)}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${typeColors[String(row.type)] ?? ""}`}>
          {String(row.type)}
        </Badge>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.is_active ? "default" : "secondary"} className="text-[10px]">
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "holder",
      header: "Holder",
      render: (row: Record<string, unknown>) => {
        const user = row.users as { username: string } | null;
        return <span className="text-xs">{user?.username ?? "Vacant"}</span>;
      },
    },
    {
      key: "times_defended",
      header: "Defenses",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.times_defended)}</span>
      ),
    },
    {
      key: "coin_value",
      header: "Value",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono text-neon-orange">{Number(row.coin_value)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Belt Management</h1>
      </div>

      <DataTable
        columns={columns}
        data={(belts ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No belts found."
      />

      {/* Belt Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Belt Settings</h2>
        {settingsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(settings ?? []).map((s) => (
              <div
                key={s.belt_type}
                className="rounded-xl border border-border/50 bg-card/80 p-4 space-y-2"
              >
                <Badge variant="outline" className={typeColors[s.belt_type] ?? ""}>
                  {s.belt_type}
                </Badge>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Defense period:</span>
                  <span>{s.defense_period_days} days</span>
                  <span className="text-muted-foreground">Inactivity:</span>
                  <span>{s.inactivity_days} days</span>
                  <span className="text-muted-foreground">Entry fee:</span>
                  <span className="text-neon-orange">{s.entry_fee_base} coins</span>
                  <span className="text-muted-foreground">Winner reward:</span>
                  <span>{s.winner_reward_percent}%</span>
                  <span className="text-muted-foreground">Platform fee:</span>
                  <span>{s.platform_fee_percent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
