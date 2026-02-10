"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

export default function CoinPurchaseSuccessPage() {
  const utils = trpc.useUtils();
  const { data: balance } = trpc.coin.balance.useQuery();

  useEffect(() => {
    utils.coin.balance.invalidate();
    utils.coin.transactions.invalidate();
    utils.user.me.invalidate();
  }, [utils]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center space-y-6">
      <div className="mx-auto rounded-full bg-neon-orange/10 p-4 w-fit">
        <Check className="h-12 w-12 text-neon-orange" />
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Coins className="h-6 w-6 text-neon-orange" />
          Purchase Complete!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your coins have been added to your account.
        </p>
      </div>

      {balance && (
        <div className="rounded-xl border border-neon-orange/30 bg-neon-orange/5 p-6">
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-neon-orange">{balance.coins}</p>
          <p className="text-xs text-muted-foreground mt-1">coins</p>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Button
          className="bg-neon-orange text-black hover:bg-neon-orange/90"
          asChild
        >
          <Link href="/coins">
            View Transactions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/belts/room">Challenge Belts</Link>
        </Button>
      </div>
    </div>
  );
}
