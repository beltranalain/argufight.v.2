"use client";

import { trpc } from "@/lib/trpc-client";
import { Coins, Star, ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

export default function PurchaseCoinsPage() {
  const { data: packages, isLoading } = trpc.coin.packages.useQuery();
  const { data: balance } = trpc.coin.balance.useQuery();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const stripeCheckout = trpc.subscription.createCoinCheckout.useMutation({
    onSuccess: (data) => { if (data.url) { window.location.href = data.url; } },
    onError: () => { if (purchasing) { directPurchase.mutate({ packageId: purchasing }); } },
  });

  const directPurchase = trpc.coin.purchase.useMutation({
    onSuccess: (result) => { toast.success(`Purchase complete! New balance: ${result.coins} coins`); setPurchasing(null); utils.coin.balance.invalidate(); utils.coin.transactions.invalidate(); },
    onError: (err) => { toast.error(err.message); setPurchasing(null); },
  });

  const handlePurchase = (packageId: string) => { setPurchasing(packageId); stripeCheckout.mutate({ packageId }); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/coins" className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-bg-tertiary border border-af-border text-foreground hover:border-electric-blue hover:text-electric-blue transition-all"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2"><Coins className="h-6 w-6 text-neon-orange" /> Buy Coins</h1>
          <p className="text-[13px] text-text-secondary">Current balance: <span className="text-neon-orange font-bold">{balance?.coins ?? 0} coins</span></p>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-48 rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />))}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages?.map((pkg) => {
            const priceFormatted = (pkg.priceInCents / 100).toFixed(2);
            const perCoin = (pkg.priceInCents / pkg.coins).toFixed(1);
            const isPurchasing = purchasing === pkg.id;
            return (
              <div key={pkg.id} className={`relative bg-bg-secondary border rounded-[14px] p-6 transition-colors ${pkg.popular ? "border-neon-orange/50 bg-neon-orange/5" : "border-af-border hover:border-electric-blue"}`}>
                {pkg.popular && (<span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-neon-orange text-black text-[11px] font-bold"><Star className="h-3 w-3" /> Most Popular</span>)}
                <div className="text-center space-y-3">
                  <h3 className="font-bold text-foreground">{pkg.name}</h3>
                  <div><p className="text-[32px] font-extrabold text-neon-orange">{pkg.coins.toLocaleString()}</p><p className="text-xs text-muted-foreground">coins</p></div>
                  <div><p className="text-lg font-bold text-foreground">${priceFormatted}</p><p className="text-[10px] text-muted-foreground">~{perCoin}&#162; per coin</p></div>
                  <button onClick={() => handlePurchase(pkg.id)} disabled={isPurchasing} className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] font-bold text-sm transition-colors disabled:opacity-50 ${pkg.popular ? "bg-neon-orange text-black hover:bg-neon-orange/90" : "bg-electric-blue text-black hover:bg-[#00b8e6]"}`}>
                    {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />} Purchase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4 text-center">
        <p className="text-xs text-muted-foreground"><Check className="inline h-3 w-3 mr-1" />Coins are used for belt challenges, tournament entries, and tipping debaters. Purchases are processed securely via Stripe.</p>
      </div>
    </div>
  );
}
