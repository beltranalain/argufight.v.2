"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  OPEN: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  RESOLVED: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  CLOSED: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-yellow-500",
  HIGH: "text-neon-orange",
  URGENT: "text-destructive",
};

export default function AdminSupportPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.admin.supportTickets.useQuery({
    status: status !== "ALL" ? status : undefined,
    page,
    limit: 20,
  });

  const columns = [
    {
      key: "subject",
      header: "Subject",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium line-clamp-1 max-w-[250px]">{String(row.subject)}</span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (row: Record<string, unknown>) => {
        const user = row.users_support_tickets_user_idTousers as { username: string; email: string } | null;
        return (
          <div>
            <span className="text-xs font-medium">{user?.username ?? "—"}</span>
            <p className="text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
        );
      },
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
    {
      key: "priority",
      header: "Priority",
      render: (row: Record<string, unknown>) => (
        <span className={`text-xs font-medium ${priorityColors[String(row.priority)] ?? ""}`}>
          {String(row.priority)}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.created_at as string), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        {data && <Badge variant="outline">{data.total} total</Badge>}
      </div>

      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={(data?.tickets ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No support tickets found."
      />
    </div>
  );
}
