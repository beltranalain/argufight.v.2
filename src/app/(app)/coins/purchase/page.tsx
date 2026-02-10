"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Star, ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function PurchaseCoinsPage() {
  const { data: packages, isLoading } = trpc.coin.packages.useQuery();
  const { data: balance } = trpc.coin.balance.useQuery();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Try Stripe checkout first, fallback to direct grant
  const stripeCheckout = trpc.subscription.createCoinCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      // Stripe not configured — fallback to direct grant
      if (purchasing) {
        directPurchase.mutate({ packageId: purchasing });
      }
    },
  });

  const directPurchase = trpc.coin.purchase.useMutation({
    onSuccess: (result) => {
      toast.success(`Purchase complete! New balance: ${result.coins} coins`);
      setPurchasing(null);
      utils.coin.balance.invalidate();
      utils.coin.transactions.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
      setPurchasing(null);
    },
  });

  const handlePurchase = (packageId: string) => {
    setPurchasing(packageId);
    stripeCheckout.mutate({ packageId });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/coins">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-neon-orange" />
            Buy Coins
          </h1>
          <p className="text-sm text-muted-foreground">
            Current balance:{" "}
            <span className="text-neon-orange font-medium">
              {balance?.coins ?? 0} coins
            </span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg) => {
            const priceFormatted = (pkg.priceInCents / 100).toFixed(2);
            const perCoin = (pkg.priceInCents / pkg.coins).toFixed(1);
            const isPurchasing = purchasing === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl border p-6 transition-colors ${
                  pkg.popular
                    ? "border-neon-orange/50 bg-neon-orange/5"
                    : "border-border/50 bg-card/80 hover:border-electric-blue/30"
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-neon-orange text-black">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                )}

                <div className="text-center space-y-3">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <div>
                    <p className="text-3xl font-bold text-neon-orange">
                      {pkg.coins.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">coins</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">${priceFormatted}</p>
                    <p className="text-[10px] text-muted-foreground">
                      ~{perCoin}¢ per coin
                    </p>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isPurchasing}
                    className={`w-full ${
                      pkg.popular
                        ? "bg-neon-orange text-black hover:bg-neon-orange/90"
                        : "bg-electric-blue text-black hover:bg-electric-blue/90"
                    }`}
                  >
                    {isPurchasing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Coins className="mr-2 h-4 w-4" />
                    )}
                    Purchase
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-border/30 bg-muted/20 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          <Check className="inline h-3 w-3 mr-1" />
          Coins are used for belt challenges, tournament entries, and tipping
          debaters. Purchases are processed securely via Stripe.
        </p>
      </div>
    </div>
  );
}
