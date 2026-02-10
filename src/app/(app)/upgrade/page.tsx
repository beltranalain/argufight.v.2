"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Crown,
  Loader2,
  Zap,
  X,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const { data: subStatus, isLoading: statusLoading } =
    trpc.subscription.status.useQuery();
  const { data: promoValidation } = trpc.subscription.validatePromo.useQuery(
    { code: promoCode },
    { enabled: promoCode.length >= 3 && !promoApplied }
  );

  const checkoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      toast.success("Subscription will cancel at end of billing period");
    },
    onError: (err) => toast.error(err.message),
  });

  const reactivateMutation = trpc.subscription.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Subscription reactivated!");
    },
    onError: (err) => toast.error(err.message),
  });

  if (statusLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const currentTier = subStatus?.tier ?? "FREE";
  const isActive = subStatus?.subscription?.status === "ACTIVE";
  const isCancelling = subStatus?.subscription?.cancelAtPeriodEnd;
  const isPro = currentTier === "PRO" && isActive;

  const monthlyPrice = 9.99;
  const yearlyPrice = 99.90;
  const savings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="h-6 w-6 text-neon-orange" />
          {isPro ? "Manage Subscription" : "Upgrade to Pro"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPro
            ? "Manage your Pro subscription"
            : "Unlock unlimited debates, AI coaching, and more"}
        </p>
      </div>

      {/* Current status */}
      {subStatus?.subscription && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Current Plan
              <Badge
                variant="outline"
                className={
                  isActive
                    ? "border-cyber-green/30 text-cyber-green"
                    : "border-destructive/30 text-destructive"
                }
              >
                {subStatus.subscription.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{subStatus.subscription.tier} Plan</p>
                <p className="text-xs text-muted-foreground">
                  {subStatus.subscription.billingCycle} billing
                </p>
              </div>
              {subStatus.subscription.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {isCancelling ? "Cancels" : "Renews"}{" "}
                  {new Date(subStatus.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>

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
                Reactivate Subscription
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
          </CardContent>
        </Card>
      )}

      {/* Pro plan card */}
      {!isPro && (
        <>
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === "MONTHLY"
                  ? "bg-electric-blue text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === "YEARLY"
                  ? "bg-electric-blue text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-cyber-green text-black text-[10px]">
                Save {savings}%
              </Badge>
            </button>
          </div>

          <Card className="border-electric-blue/50 bg-electric-blue/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 rounded-full bg-electric-blue/10 p-3 w-fit">
                <Zap className="h-6 w-6 text-electric-blue" />
              </div>
              <CardTitle className="text-xl">Pro Plan</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">
                  ${billingCycle === "MONTHLY" ? monthlyPrice.toFixed(2) : yearlyPrice.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  /{billingCycle === "MONTHLY" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "YEARLY" && (
                <p className="text-xs text-cyber-green mt-1">
                  ${(yearlyPrice / 12).toFixed(2)}/month billed annually
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  "Unlimited debates per day",
                  "AI coaching reports after each debate",
                  "Advanced analytics dashboard",
                  "Priority matchmaking",
                  "Custom profile themes",
                  "2x coin earning rate",
                  "Tournament creation",
                  "10 appeals per month",
                  "Ad-free experience",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-cyber-green shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Promo code */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="promo" className="text-xs">
                  Promo Code
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoApplied(false);
                    }}
                    placeholder="Enter code"
                    className="flex-1"
                  />
                  {promoCode && promoValidation?.valid && !promoApplied && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPromoApplied(true)}
                      className="text-cyber-green border-cyber-green/30"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      Apply
                    </Button>
                  )}
                </div>
                {promoCode && promoValidation && (
                  <p
                    className={`text-xs ${
                      promoValidation.valid
                        ? "text-cyber-green"
                        : "text-destructive"
                    }`}
                  >
                    {promoValidation.valid
                      ? `${promoValidation.discountType === "PERCENT" ? `${promoValidation.discountValue}% off` : `$${promoValidation.discountValue} off`}${promoApplied ? " — Applied!" : ""}`
                      : promoValidation.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-electric-blue text-black hover:bg-electric-blue/90"
                onClick={() =>
                  checkoutMutation.mutate({
                    tier: "PRO",
                    billingCycle,
                    promoCode: promoApplied ? promoCode : undefined,
                  })
                }
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Subscribe to Pro
              </Button>
            </CardContent>
          </Card>

          {/* Comparison */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Free vs Pro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { feature: "Daily debates", free: "5", pro: "Unlimited" },
                  { feature: "AI verdicts", free: "Yes", pro: "Yes" },
                  { feature: "AI coaching", free: "No", pro: "Yes" },
                  { feature: "Monthly appeals", free: "2", pro: "10" },
                  { feature: "Coin multiplier", free: "1x", pro: "2x" },
                  { feature: "Tournament creation", free: "No", pro: "Yes" },
                  { feature: "Advanced analytics", free: "No", pro: "Yes" },
                  { feature: "Custom themes", free: "No", pro: "Yes" },
                  { feature: "Ad-free", free: "No", pro: "Yes" },
                ].map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/20 last:border-0"
                  >
                    <span className="text-muted-foreground">{row.feature}</span>
                    <span className="text-center">{row.free}</span>
                    <span className="text-center text-electric-blue font-medium">
                      {row.pro}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
