"use client";

import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const { data: plans, isLoading } = trpc.admin.subscriptionPlans.useQuery();

  const columns = [
    {
      key: "name",
      header: "Plan Name",
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{String(row.name)}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row: Record<string, unknown>) => (
        <span className="text-neon-orange font-mono">${Number(row.price).toFixed(2)}</span>
      ),
    },
    {
      key: "billingCycle",
      header: "Cycle",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs">{String(row.billingCycle ?? "—")}</span>
      ),
    },
    {
      key: "debate_limit",
      header: "Debate Limit",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">
          {Number(row.debate_limit) === -1 ? "Unlimited" : Number(row.debate_limit)}
        </span>
      ),
    },
    {
      key: "appeal_limit",
      header: "Appeal Limit",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">{Number(row.appeal_limit)}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.is_active ? "default" : "secondary"} className="text-[10px]">
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
      </div>

      <DataTable
        columns={columns}
        data={(plans ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No subscription plans found."
      />
    </div>
  );
}
