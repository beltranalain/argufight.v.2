"use client";

import { trpc } from "@/lib/trpc-client";
import {
  Crown,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  X,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SubscriptionSettingsPage() {
  const { data: subStatus, isLoading } = trpc.subscription.status.useQuery();
  const { data: usage } = trpc.subscription.usage.useQuery();

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => toast.success("Subscription will cancel at end of billing period"),
    onError: (err) => toast.error(err.message),
  });

  const reactivateMutation = trpc.subscription.reactivate.useMutation({
    onSuccess: () => toast.success("Subscription reactivated!"),
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 rounded bg-bg-secondary animate-pulse" />
        <div className="h-48 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
        <div className="h-48 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
      </div>
    );
  }

  const sub = subStatus?.subscription;
  const tier = subStatus?.tier ?? "FREE";
  const isActive = sub?.status === "ACTIVE";
  const isCancelling = sub?.cancelAtPeriodEnd;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-bg-tertiary border border-af-border text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-neon-orange" />
            Subscription
          </h1>
          <p className="text-[13px] text-text-secondary">
            Manage your plan and billing
          </p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            Current Plan
            <span className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${tier === "PRO" ? "bg-electric-blue/15 text-electric-blue" : "bg-muted text-muted-foreground"}`}>{tier}</span>
            {sub && (
              <span className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${isActive && !isCancelling ? "bg-cyber-green/15 text-cyber-green" : isCancelling ? "bg-neon-orange/15 text-neon-orange" : "bg-destructive/15 text-destructive"}`}>
                {isCancelling ? "Cancelling" : sub.status}
              </span>
            )}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {sub ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium text-foreground">{sub.billingCycle ?? "Monthly"}</p>
                </div>
                {sub.currentPeriodEnd && (
                  <div>
                    <p className="text-muted-foreground">{isCancelling ? "Access Until" : "Next Renewal"}</p>
                    <p className="font-medium text-foreground">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
                  </div>
                )}
                {sub.promoCode && (
                  <div>
                    <p className="text-muted-foreground">Promo Code</p>
                    <p className="font-medium text-cyber-green">{sub.promoCode.code}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isCancelling ? (
                  <button onClick={() => reactivateMutation.mutate()} disabled={reactivateMutation.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-cyber-green text-black font-bold text-sm hover:bg-cyber-green/90 transition-colors disabled:opacity-50">
                    {reactivateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Reactivate
                  </button>
                ) : isActive ? (
                  <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-bg-tertiary border border-af-border text-destructive font-semibold text-sm hover:border-destructive transition-all disabled:opacity-50">
                    {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    Cancel Subscription
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">You&apos;re on the Free plan.</p>
              <Link href="/upgrade" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors">
                Upgrade to Pro <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Usage This Period
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {usage ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">Daily Debates</span>
                  <span className="text-sm text-muted-foreground">{usage.debates.unlimited ? `${usage.debates.used} / Unlimited` : `${usage.debates.used} / ${usage.debates.limit}`}</span>
                </div>
                {!usage.debates.unlimited && (
                  <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                    <div className="h-full rounded-full bg-electric-blue transition-all" style={{ width: `${Math.min(100, (usage.debates.used / usage.debates.limit) * 100)}%` }} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">Monthly Appeals</span>
                  <span className="text-sm text-muted-foreground">{usage.appeals.used} / {usage.appeals.limit}</span>
                </div>
                <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                  <div className="h-full rounded-full bg-neon-orange transition-all" style={{ width: `${Math.min(100, (usage.appeals.used / usage.appeals.limit) * 100)}%` }} />
                </div>
              </div>
            </>
          ) : (
            <div className="h-16 w-full rounded bg-bg-tertiary animate-pulse" />
          )}
        </div>
      </div>

      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-base font-bold text-foreground">Your Features</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "AI Coaching", enabled: subStatus?.limits.aiCoaching },
              { name: "Advanced Analytics", enabled: subStatus?.limits.advancedAnalytics },
              { name: "Priority Matchmaking", enabled: subStatus?.limits.priorityMatchmaking },
              { name: "Custom Themes", enabled: subStatus?.limits.customThemes },
              { name: "Tournament Creation", enabled: subStatus?.limits.tournamentCreation },
              { name: "Ad-Free", enabled: subStatus?.limits.adFree },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center gap-2 text-sm">
                {feature.enabled ? <Check className="h-4 w-4 text-cyber-green" /> : <X className="h-4 w-4 text-muted-foreground" />}
                <span className={feature.enabled ? "text-foreground" : "text-muted-foreground"}>{feature.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
