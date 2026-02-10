"use client";

import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  REGISTRATION: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  IN_PROGRESS: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AdminTournamentsPage() {
  const { data: tournaments, isLoading } = trpc.admin.tournaments.useQuery();

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{String(row.name)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${statusColors[String(row.status)] ?? ""}`}>
          {String(row.status)}
        </Badge>
      ),
    },
    { key: "format", header: "Format" },
    {
      key: "participants",
      header: "Participants",
      render: (row: Record<string, unknown>) => {
        const count = row._count as { tournament_participants: number };
        return (
          <span className="text-xs">
            {count?.tournament_participants ?? 0}/{Number(row.max_participants)}
          </span>
        );
      },
    },
    {
      key: "round",
      header: "Round",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">
          {Number(row.current_round)}/{Number(row.total_rounds)}
        </span>
      ),
    },
    {
      key: "prize_pool",
      header: "Prize",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-neon-orange font-mono">{Number(row.prize_pool)}</span>
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {row.start_date
            ? formatDistanceToNow(new Date(row.start_date as string), { addSuffix: true })
            : "Not set"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Tournament Management</h1>
      </div>

      <DataTable
        columns={columns}
        data={(tournaments ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No tournaments found."
      />
    </div>
  );
}
