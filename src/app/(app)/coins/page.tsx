"use client";

import { trpc } from "@/lib/trpc-client";
import { Coins, TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

const txTypeLabels: Record<string, string> = {
  BELT_CHALLENGE_ENTRY: "Belt Challenge Entry", BELT_CHALLENGE_REWARD: "Belt Challenge Reward",
  BELT_CHALLENGE_CONSOLATION: "Consolation Prize", BELT_TOURNAMENT_CREATION: "Tournament Creation",
  BELT_TOURNAMENT_REWARD: "Tournament Reward", ADMIN_GRANT: "Admin Grant",
  ADMIN_DEDUCT: "Admin Deduction", REFUND: "Refund", PLATFORM_FEE: "Platform Fee",
  COIN_PURCHASE: "Coin Purchase", COIN_PURCHASE_REFUND: "Purchase Refund", DAILY_LOGIN_REWARD: "Daily Reward",
};

export default function CoinsPage() {
  const { data: balance, isLoading: balanceLoading } = trpc.coin.balance.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.coin.stats.useQuery();
  const { data: txData, isLoading: txLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.coin.transactions.useInfiniteQuery({ limit: 20 }, { getNextPageParam: (lastPage) => lastPage.nextCursor });
  const allTransactions = txData?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2"><Coins className="h-6 w-6 text-neon-orange" /> My Coins</h1>
          <p className="text-[13px] text-text-secondary">Manage your coin balance and transactions</p>
        </div>
        <Link href="/coins/purchase" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-neon-orange text-black font-bold text-sm hover:bg-neon-orange/90 transition-colors"><Coins className="h-4 w-4" /> Buy Coins</Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          {balanceLoading ? <div className="h-8 w-20 rounded bg-bg-tertiary animate-pulse" /> : <p className="text-[28px] font-extrabold text-neon-orange">{balance?.coins ?? 0}</p>}
        </div>
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><TrendingUp className="h-3 w-3 text-cyber-green" /> Total Earned</p>
          {statsLoading ? <div className="h-8 w-20 rounded bg-bg-tertiary animate-pulse" /> : <p className="text-[28px] font-extrabold text-cyber-green">+{stats?.totalEarned ?? 0}</p>}
        </div>
        <div className="bg-bg-secondary border border-af-border rounded-[10px] p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><TrendingDown className="h-3 w-3 text-destructive" /> Total Spent</p>
          {statsLoading ? <div className="h-8 w-20 rounded bg-bg-tertiary animate-pulse" /> : <p className="text-[28px] font-extrabold text-destructive">-{stats?.totalSpent ?? 0}</p>}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Transaction History</h2>
        {txLoading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-16 w-full rounded-lg bg-bg-secondary border border-af-border animate-pulse" />))}</div>
        ) : allTransactions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
            <Coins className="w-12 h-12 mx-auto mb-4 text-electric-blue opacity-60" />
            <p className="text-base font-bold text-foreground">No transactions yet</p>
            <p className="text-[13px] text-muted-foreground mt-1 mb-4">Buy your first coins to get started.</p>
            <Link href="/coins/purchase" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all">Buy your first coins <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="space-y-1">
            {allTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-bg-secondary border border-af-border rounded-lg px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold bg-muted text-muted-foreground shrink-0">{txTypeLabels[tx.type] ?? tx.type}</span>
                    {tx.belts && <span className="text-xs text-muted-foreground truncate">{tx.belts.name}</span>}
                  </div>
                  {tx.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{tx.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? "text-cyber-green" : tx.amount < 0 ? "text-destructive" : ""}`}>{tx.amount > 0 ? "+" : ""}{tx.amount}</p>
                  <p className="text-[10px] text-muted-foreground">bal: {tx.balance_after}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(tx.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {hasNextPage && (
          <div className="flex justify-center mt-4">
            <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-bg-tertiary border border-af-border text-foreground text-sm font-semibold hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50">
              {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />} Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
