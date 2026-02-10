"use client";

import { useEffect } from "react";
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
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center justify-center gap-2">
          <Coins className="h-6 w-6 text-neon-orange" /> Purchase Complete!
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">Your coins have been added to your account.</p>
      </div>
      {balance && (
        <div className="bg-bg-secondary border border-neon-orange/30 rounded-[14px] p-6">
          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
          <p className="text-[40px] font-extrabold text-neon-orange">{balance.coins}</p>
          <p className="text-xs text-muted-foreground mt-1">coins</p>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link href="/coins" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-neon-orange text-black font-bold text-sm hover:bg-neon-orange/90 transition-colors">
          View Transactions <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/belts/room" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-bg-tertiary border border-af-border text-foreground font-semibold text-sm hover:border-electric-blue hover:text-electric-blue transition-all">
          Challenge Belts
        </Link>
      </div>
    </div>
  );
}
