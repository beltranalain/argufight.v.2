"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_OPTIONS = ["ALL", "PENDING", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  ACTIVE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  COMPLETED: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/30",
  EXPIRED: "bg-muted text-muted-foreground",
};

export default function AdminDebatesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.debates.useQuery({
    search: search || undefined,
    status: status !== "ALL" ? status : undefined,
    page,
    limit: 20,
  });

  const updateDebate = trpc.admin.updateDebate.useMutation({
    onSuccess: () => {
      toast.success("Debate updated");
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
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${statusColors[String(row.status)] ?? ""}`}>
          {String(row.status)}
        </Badge>
      ),
    },
    { key: "category", header: "Category" },
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
    {
      key: "view_count",
      header: "Views",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.view_count)}</span>
      ),
    },
    {
      key: "engagement",
      header: "Engagement",
      render: (row: Record<string, unknown>) => {
        const counts = row._count as { debate_likes: number; debate_comments: number };
        return (
          <span className="text-xs text-muted-foreground">
            {counts?.debate_likes ?? 0} likes, {counts?.debate_comments ?? 0} comments
          </span>
        );
      },
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
            title={row.featured ? "Unfeature" : "Feature"}
            onClick={(e) => {
              e.stopPropagation();
              updateDebate.mutate({
                debateId: row.id as string,
                featured: !row.featured,
              });
            }}
          >
            <Star className={`h-3 w-3 ${row.featured ? "fill-neon-orange text-neon-orange" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={row.visibility === "PUBLIC" ? "Make Private" : "Make Public"}
            onClick={(e) => {
              e.stopPropagation();
              updateDebate.mutate({
                debateId: row.id as string,
                visibility: row.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC",
              });
            }}
          >
            {row.visibility === "PUBLIC" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Swords className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Debate Management</h1>
        {data && <Badge variant="outline" className="ml-auto">{data.total} total</Badge>}
      </div>

      <div className="flex gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={(data?.debates ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        searchPlaceholder="Search debates..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
