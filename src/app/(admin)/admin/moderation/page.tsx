"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminModerationPage() {
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.debates.useQuery({
    status: "ACTIVE",
    page,
    limit: 20,
  });

  const updateDebate = trpc.admin.updateDebate.useMutation({
    onSuccess: () => {
      toast.success("Action applied");
      utils.admin.debates.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "topic",
      header: "Topic",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium line-clamp-1 max-w-[300px]">{String(row.topic)}</span>
      ),
    },
    {
      key: "challenger",
      header: "Challenger",
      render: (row: Record<string, unknown>) => {
        const u = row.users_debates_challenger_idTousers as { username: string } | null;
        return <span className="text-xs">{u?.username ?? "—"}</span>;
      },
    },
    {
      key: "opponent",
      header: "Opponent",
      render: (row: Record<string, unknown>) => {
        const u = row.users_debates_opponent_idTousers as { username: string } | null;
        return <span className="text-xs">{u?.username ?? "—"}</span>;
      },
    },
    { key: "category", header: "Category" },
    {
      key: "view_count",
      header: "Views",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.view_count)}</span>
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
    {
      key: "actions",
      header: "Actions",
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-cyber-green"
            title="Approve"
            onClick={(e) => {
              e.stopPropagation();
              updateDebate.mutate({ debateId: row.id as string, featured: true });
            }}
          >
            <CheckCircle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            title="Remove"
            onClick={(e) => {
              e.stopPropagation();
              updateDebate.mutate({ debateId: row.id as string, status: "CANCELLED" });
            }}
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        {data && <Badge variant="outline">{data.total} active debates</Badge>}
      </div>

      <DataTable
        columns={columns}
        data={(data?.debates ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        searchPlaceholder="Search debates..."
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No items in the moderation queue."
      />
    </div>
  );
}
