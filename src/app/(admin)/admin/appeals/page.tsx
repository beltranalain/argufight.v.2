"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const appealStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  PROCESSING: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  RESOLVED: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  DENIED: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AdminAppealsPage() {
  const [status, setStatus] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [resolveTarget, setResolveTarget] = useState<Record<string, unknown> | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.appeals.useQuery({
    status: status !== "ALL" ? (status as "PENDING" | "PROCESSING" | "RESOLVED" | "DENIED") : undefined,
    page,
    limit: 20,
  });

  const resolveAppeal = trpc.admin.resolveAppeal.useMutation({
    onSuccess: () => {
      toast.success("Appeal resolved");
      utils.admin.appeals.invalidate();
      setResolveTarget(null);
      setRejectReason("");
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "topic",
      header: "Debate Topic",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium line-clamp-1 max-w-[250px]">{String(row.topic)}</span>
      ),
    },
    {
      key: "appeal_status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${appealStatusColors[String(row.appeal_status)] ?? ""}`}>
          {String(row.appeal_status)}
        </Badge>
      ),
    },
    {
      key: "appeal_reason",
      header: "Reason",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
          {String(row.appeal_reason ?? "No reason provided")}
        </span>
      ),
    },
    {
      key: "appeal_count",
      header: "Count",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.appeal_count)}</span>
      ),
    },
    {
      key: "appealed_at",
      header: "Appealed",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {row.appealed_at
            ? formatDistanceToNow(new Date(row.appealed_at as string), { addSuffix: true })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Record<string, unknown>) => {
        if (row.appeal_status !== "PENDING") return null;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyber-green"
              onClick={(e) => {
                e.stopPropagation();
                resolveAppeal.mutate({ debateId: row.id as string, decision: "RESOLVED" });
              }}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setResolveTarget(row);
              }}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Appeals</h1>
        {data && <Badge variant="outline">{data.total} total</Badge>}
      </div>

      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="DENIED">Denied</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={(data?.appeals ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No appeals found."
      />

      <Dialog open={!!resolveTarget} onOpenChange={() => setResolveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appeal</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={() =>
              resolveAppeal.mutate({
                debateId: resolveTarget?.id as string,
                decision: "DENIED",
                reason: rejectReason || undefined,
              })
            }
          >
            Reject Appeal
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
