import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

// Hardcoded coin packages (no DB model for these)
const COIN_PACKAGES = [
  { id: "starter", name: "Starter Pack", coins: 100, priceInCents: 199, popular: false },
  { id: "popular", name: "Popular Pack", coins: 500, priceInCents: 799, popular: true },
  { id: "pro", name: "Pro Pack", coins: 1200, priceInCents: 1499, popular: false },
  { id: "elite", name: "Elite Pack", coins: 3000, priceInCents: 2999, popular: false },
  { id: "whale", name: "Mega Pack", coins: 10000, priceInCents: 7999, popular: false },
] as const;

export const coinRouter = createTRPCRouter({
  balance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.users.findUnique({
      where: { id: ctx.session.user.id },
      select: { coins: true },
    });
    return { coins: user?.coins ?? 0 };
  }),

  transactions: protectedProcedure
    .input(
      z.object({
        type: z
          .enum([
            "BELT_CHALLENGE_ENTRY",
            "BELT_CHALLENGE_REWARD",
            "BELT_CHALLENGE_CONSOLATION",
            "BELT_TOURNAMENT_CREATION",
            "BELT_TOURNAMENT_REWARD",
            "ADMIN_GRANT",
            "ADMIN_DEDUCT",
            "REFUND",
            "PLATFORM_FEE",
            "COIN_PURCHASE",
            "COIN_PURCHASE_REFUND",
            "DAILY_LOGIN_REWARD",
          ])
          .optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { user_id: ctx.session.user.id };
      if (input.type) where.type = input.type;

      const items = await ctx.prisma.coin_transactions.findMany({
        where,
        select: {
          id: true,
          type: true,
          status: true,
          amount: true,
          balance_after: true,
          description: true,
          created_at: true,
          belts: { select: { id: true, name: true } },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (items.length > input.limit) {
        const next = items.pop();
        nextCursor = next?.id;
      }

      return { items, nextCursor };
    }),

  packages: protectedProcedure.query(() => {
    return COIN_PACKAGES;
  }),

  purchase: protectedProcedure
    .input(z.object({ packageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pkg = COIN_PACKAGES.find((p) => p.id === input.packageId);
      if (!pkg) {
        throw new Error("Invalid package");
      }

      // In production, this would create a Stripe Checkout session.
      // For now, grant coins directly (TODO: integrate Stripe in Phase 7).
      const userId = ctx.session.user.id;

      await ctx.prisma.users.update({
        where: { id: userId },
        data: { coins: { increment: pkg.coins } },
      });

      const updatedUser = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: { coins: true },
      });

      await ctx.prisma.coin_transactions.create({
        data: {
          id: crypto.randomUUID(),
          user_id: userId,
          type: "COIN_PURCHASE",
          amount: pkg.coins,
          balance_after: updatedUser?.coins ?? 0,
          description: `Purchased ${pkg.name} (${pkg.coins} coins)`,
          status: "COMPLETED",
          updated_at: new Date(),
        },
      });

      return { coins: updatedUser?.coins ?? 0 };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [totalEarned, totalSpent] = await Promise.all([
      ctx.prisma.coin_transactions.aggregate({
        where: { user_id: userId, amount: { gt: 0 }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      ctx.prisma.coin_transactions.aggregate({
        where: { user_id: userId, amount: { lt: 0 }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalEarned: totalEarned._sum.amount ?? 0,
      totalSpent: Math.abs(totalSpent._sum.amount ?? 0),
    };
  }),
});
