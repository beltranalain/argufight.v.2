"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";

const txTypeLabels: Record<string, string> = {
  BELT_CHALLENGE_ENTRY: "Belt Challenge Entry",
  BELT_CHALLENGE_REWARD: "Belt Challenge Reward",
  BELT_CHALLENGE_CONSOLATION: "Consolation Prize",
  BELT_TOURNAMENT_CREATION: "Tournament Creation",
  BELT_TOURNAMENT_REWARD: "Tournament Reward",
  ADMIN_GRANT: "Admin Grant",
  ADMIN_DEDUCT: "Admin Deduction",
  REFUND: "Refund",
  PLATFORM_FEE: "Platform Fee",
  COIN_PURCHASE: "Coin Purchase",
  COIN_PURCHASE_REFUND: "Purchase Refund",
  DAILY_LOGIN_REWARD: "Daily Reward",
};

const txTypeColors: Record<string, string> = {
  BELT_CHALLENGE_ENTRY: "text-destructive",
  BELT_CHALLENGE_REWARD: "text-cyber-green",
  BELT_CHALLENGE_CONSOLATION: "text-electric-blue",
  BELT_TOURNAMENT_CREATION: "text-destructive",
  BELT_TOURNAMENT_REWARD: "text-cyber-green",
  ADMIN_GRANT: "text-cyber-green",
  ADMIN_DEDUCT: "text-destructive",
  REFUND: "text-cyber-green",
  PLATFORM_FEE: "text-destructive",
  COIN_PURCHASE: "text-cyber-green",
  COIN_PURCHASE_REFUND: "text-cyber-green",
  DAILY_LOGIN_REWARD: "text-neon-orange",
};

export default function CoinsPage() {
  const { data: balance, isLoading: balanceLoading } = trpc.coin.balance.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.coin.stats.useQuery();
  const {
    data: txData,
    isLoading: txLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.coin.transactions.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const allTransactions = txData?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-neon-orange" />
            My Coins
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your coin balance and transactions
          </p>
        </div>
        <Button
          className="bg-neon-orange text-black hover:bg-neon-orange/90"
          asChild
        >
          <Link href="/coins/purchase">
            <Coins className="mr-2 h-4 w-4" />
            Buy Coins
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-neon-orange">
                {balance?.coins ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-cyber-green" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-cyber-green">
                +{stats?.totalEarned ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-normal flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-destructive">
                -{stats?.totalSpent ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Transaction History</h2>
        {txLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : allTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <Coins className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No transactions yet.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/coins/purchase">
                Buy your first coins <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {allTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-border/30 bg-card/80 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {txTypeLabels[tx.type] ?? tx.type}
                    </Badge>
                    {tx.belts && (
                      <span className="text-xs text-muted-foreground truncate">
                        {tx.belts.name}
                      </span>
                    )}
                  </div>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {tx.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p
                    className={`text-sm font-bold ${
                      tx.amount > 0
                        ? "text-cyber-green"
                        : tx.amount < 0
                          ? "text-destructive"
                          : ""
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    bal: {tx.balance_after}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(tx.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
