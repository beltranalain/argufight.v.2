"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, CheckCircle, Clock } from "lucide-react";

const contractStatusColors: Record<string, string> = {
  SCHEDULED: "bg-electric-blue/10 text-electric-blue",
  ACTIVE: "bg-cyber-green/10 text-cyber-green",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
  DISPUTED: "bg-neon-orange/10 text-neon-orange",
};

export default function CreatorEarningsPage() {
  const { data: contracts, isLoading } = trpc.creator.earnings.useQuery();

  const totalEarnings = (contracts ?? [])
    .filter((c) => c.status === "COMPLETED")
    .reduce((sum, c) => sum + Number(c.creator_payout), 0);

  const pendingEarnings = (contracts ?? [])
    .filter((c) => c.status === "ACTIVE" || c.status === "SCHEDULED")
    .reduce((sum, c) => sum + Number(c.creator_payout), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-cyber-green" />
        <h1 className="text-2xl font-bold">Earnings</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-cyber-green/30 bg-cyber-green/5 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-cyber-green" />
            <span className="text-xs text-muted-foreground">Total Earned</span>
          </div>
          <p className="text-3xl font-bold text-cyber-green mt-1">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-neon-orange/30 bg-neon-orange/5 p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neon-orange" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-3xl font-bold text-neon-orange mt-1">${pendingEarnings.toFixed(2)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (contracts ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No earnings yet. Accept offers to start earning.
        </p>
      ) : (
        <div className="space-y-2">
          {(contracts ?? []).map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl border border-border/50 bg-card/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{contract.campaigns?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.advertisers?.company_name} · {contract.placement.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyber-green">
                    ${Number(contract.creator_payout).toFixed(2)}
                  </p>
                  <Badge variant="outline" className={`text-[10px] ${contractStatusColors[contract.status] ?? ""}`}>
                    {contract.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <span>Total: ${Number(contract.total_amount).toFixed(2)}</span>
                <span>Fee: ${Number(contract.platform_fee).toFixed(2)}</span>
                <span>
                  {contract.payout_sent ? (
                    <span className="text-cyber-green">Paid</span>
                  ) : (
                    "Pending payout"
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
