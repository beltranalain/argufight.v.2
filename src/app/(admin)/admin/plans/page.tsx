"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const { data: plans, isLoading } = trpc.admin.subscriptionPlans.useQuery();
  const utils = trpc.useUtils();

  const updatePlan = trpc.admin.updatePlan.useMutation({
    onSuccess: () => {
      toast.success("Plan updated");
      utils.admin.subscriptionPlans.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Plan Management</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(plans ?? []).map((plan) => (
            <div key={plan.id} className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <Badge variant={plan.is_active ? "default" : "secondary"}>
                  {plan.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-neon-orange">
                ${Number(plan.price).toFixed(2)}
                <span className="text-xs text-muted-foreground">/{plan.billingCycle?.toLowerCase()}</span>
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">Debate limit:</span>
                <span>{Number(plan.debate_limit) === -1 ? "Unlimited" : plan.debate_limit}</span>
                <span className="text-muted-foreground">Appeal limit:</span>
                <span>{plan.appeal_limit}/month</span>
                <span className="text-muted-foreground">Priority support:</span>
                <span>{plan.priority_support ? "Yes" : "No"}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updatePlan.mutate({
                    id: plan.id,
                    is_active: !plan.is_active,
                  })
                }
              >
                {plan.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
