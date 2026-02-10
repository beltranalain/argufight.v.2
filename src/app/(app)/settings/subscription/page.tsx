"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
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
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-neon-orange" />
            Subscription
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your plan and billing
          </p>
        </div>
      </div>

      {/* Current plan */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Current Plan
            <Badge
              variant="outline"
              className={
                tier === "PRO"
                  ? "border-electric-blue/30 text-electric-blue"
                  : "border-border"
              }
            >
              {tier}
            </Badge>
            {sub && (
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isActive && !isCancelling
                    ? "border-cyber-green/30 text-cyber-green"
                    : isCancelling
                      ? "border-neon-orange/30 text-neon-orange"
                      : "border-destructive/30 text-destructive"
                }`}
              >
                {isCancelling ? "Cancelling" : sub.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sub ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium">{sub.billingCycle ?? "Monthly"}</p>
                </div>
                {sub.currentPeriodEnd && (
                  <div>
                    <p className="text-muted-foreground">
                      {isCancelling ? "Access Until" : "Next Renewal"}
                    </p>
                    <p className="font-medium">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {sub.promoCode && (
                  <div>
                    <p className="text-muted-foreground">Promo Code</p>
                    <p className="font-medium text-cyber-green">
                      {sub.promoCode.code}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isCancelling ? (
                  <Button
                    onClick={() => reactivateMutation.mutate()}
                    disabled={reactivateMutation.isPending}
                    className="bg-cyber-green text-black hover:bg-cyber-green/90"
                  >
                    {reactivateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Reactivate
                  </Button>
                ) : isActive ? (
                  <Button
                    variant="outline"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="text-destructive"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Cancel Subscription
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">
                You&apos;re on the Free plan.
              </p>
              <Button
                className="bg-electric-blue text-black hover:bg-electric-blue/90"
                asChild
              >
                <Link href="/upgrade">
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage This Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usage ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Daily Debates</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.debates.unlimited
                      ? `${usage.debates.used} / Unlimited`
                      : `${usage.debates.used} / ${usage.debates.limit}`}
                  </span>
                </div>
                {!usage.debates.unlimited && (
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-electric-blue transition-all"
                      style={{
                        width: `${Math.min(100, (usage.debates.used / usage.debates.limit) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Monthly Appeals</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.appeals.used} / {usage.appeals.limit}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-neon-orange transition-all"
                    style={{
                      width: `${Math.min(100, (usage.appeals.used / usage.appeals.limit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
        </CardContent>
      </Card>

      {/* Feature access */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Your Features</CardTitle>
        </CardHeader>
        <CardContent>
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
                {feature.enabled ? (
                  <Check className="h-4 w-4 text-cyber-green" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={feature.enabled ? "" : "text-muted-foreground"}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
