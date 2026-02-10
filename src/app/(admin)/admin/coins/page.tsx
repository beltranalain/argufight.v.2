"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeColors: Record<string, string> = {
  COIN_PURCHASE: "text-cyber-green",
  BELT_REWARD: "text-neon-orange",
  TOURNAMENT_PRIZE: "text-electric-blue",
  TIP_SENT: "text-destructive",
  TIP_RECEIVED: "text-cyber-green",
  ADMIN_GRANT: "text-electric-blue",
  ADMIN_DEDUCT: "text-destructive",
  DAILY_REWARD: "text-cyber-green",
  SIGNUP_BONUS: "text-cyber-green",
};

const TYPE_OPTIONS = [
  "ALL",
  "COIN_PURCHASE",
  "BELT_REWARD",
  "TOURNAMENT_PRIZE",
  "TIP_SENT",
  "TIP_RECEIVED",
  "ADMIN_GRANT",
  "ADMIN_DEDUCT",
  "DAILY_REWARD",
  "SIGNUP_BONUS",
];

export default function AdminCoinsPage() {
  const [type, setType] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.admin.coinTransactions.useQuery({
    type: type !== "ALL" ? type : undefined,
    page,
    limit: 20,
  });

  const columns = [
    {
      key: "user",
      header: "User",
      render: (row: Record<string, unknown>) => {
        const user = row.users as { username: string } | null;
        return <span className="text-xs font-medium">{user?.username ?? "—"}</span>;
      },
    },
    {
      key: "type",
      header: "Type",
      render: (row: Record<string, unknown>) => (
        <Badge variant="outline" className={`text-[10px] ${typeColors[String(row.type)] ?? ""}`}>
          {String(row.type).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: Record<string, unknown>) => {
        const amount = Number(row.amount);
        return (
          <span className={`text-xs font-mono font-bold ${amount >= 0 ? "text-cyber-green" : "text-destructive"}`}>
            {amount >= 0 ? "+" : ""}{amount}
          </span>
        );
      },
    },
    {
      key: "balance_after",
      header: "Balance After",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.balance_after)}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
          {String(row.description ?? "")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.status === "COMPLETED" ? "default" : "secondary"} className="text-[10px]">
          {String(row.status)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
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
        <Coins className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Coin Management</h1>
        {data && <Badge variant="outline">{data.total} transactions</Badge>}
      </div>

      <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((t) => (
            <SelectItem key={t} value={t}>
              {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={(data?.transactions ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No transactions found."
      />
    </div>
  );
}
