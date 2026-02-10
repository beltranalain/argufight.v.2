import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, adminProcedure } from "../init";

export const adminRouter = createTRPCRouter({
  // ---- OVERVIEW STATS ----
  stats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersWeek,
      totalDebates,
      activeDebates,
      newDebatesWeek,
      totalBelts,
      activeTournaments,
      totalRevenue,
      proSubscribers,
      pendingAppeals,
      pendingModeration,
      openTickets,
    ] = await Promise.all([
      ctx.prisma.users.count(),
      ctx.prisma.users.count({ where: { created_at: { gte: weekAgo } } }),
      ctx.prisma.debates.count(),
      ctx.prisma.debates.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.debates.count({ where: { created_at: { gte: weekAgo } } }),
      ctx.prisma.belts.count({ where: { is_active: true } }),
      ctx.prisma.tournaments.count({ where: { status: "IN_PROGRESS" } }),
      ctx.prisma.coin_transactions.aggregate({
        where: { type: "COIN_PURCHASE", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      ctx.prisma.user_subscriptions.count({ where: { status: "ACTIVE", tier: "PRO" } }),
      ctx.prisma.debates.count({ where: { appeal_status: "PENDING" } }),
      ctx.prisma.debates.count({ where: { status: "ACTIVE" } }),
      ctx.prisma.support_tickets.count({ where: { status: "OPEN" } }).catch(() => 0),
    ]);

    return {
      totalUsers,
      newUsersWeek,
      totalDebates,
      activeDebates,
      newDebatesWeek,
      totalBelts,
      activeTournaments,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      proSubscribers,
      pendingAppeals,
      pendingModeration,
      openTickets,
    };
  }),

  // ---- USER MANAGEMENT ----
  users: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        sortBy: z.enum(["created_at", "username", "elo_rating", "coins"]).default("created_at"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = input.search
        ? {
            OR: [
              { username: { contains: input.search, mode: "insensitive" as const } },
              { email: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        ctx.prisma.users.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            elo_rating: true,
            coins: true,
            is_admin: true,
            is_banned: true,
            created_at: true,
            debates_won: true,
            debates_lost: true,
            total_debates: true,
            user_subscriptions: { select: { tier: true, status: true } },
          },
          orderBy: { [input.sortBy]: input.sortDir },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        ctx.prisma.users.count({ where }),
      ]);

      return { users, total, totalPages: Math.ceil(total / input.limit) };
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        is_admin: z.boolean().optional(),
        is_banned: z.boolean().optional(),
        coins: z.number().int().optional(),
        elo_rating: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;
      await ctx.prisma.users.update({
        where: { id: userId },
        data: { ...data, updated_at: new Date() },
      });
      return { success: true };
    }),

  // ---- DEBATE MANAGEMENT ----
  debates: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.status) where.status = input.status;
      if (input.search) {
        where.topic = { contains: input.search, mode: "insensitive" };
      }

      const [debates, total] = await Promise.all([
        ctx.prisma.debates.findMany({
          where,
          select: {
            id: true,
            topic: true,
            category: true,
            status: true,
            visibility: true,
            view_count: true,
            featured: true,
            created_at: true,
            users_debates_challenger_idTousers: { select: { username: true } },
            users_debates_opponent_idTousers: { select: { username: true } },
            _count: { select: { debate_likes: true, debate_comments: true } },
          },
          orderBy: { created_at: "desc" },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        ctx.prisma.debates.count({ where }),
      ]);

      return { debates, total, totalPages: Math.ceil(total / input.limit) };
    }),

  updateDebate: adminProcedure
    .input(
      z.object({
        debateId: z.string(),
        featured: z.boolean().optional(),
        status: z.string().optional(),
        visibility: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { debateId, ...data } = input;
      await ctx.prisma.debates.update({
        where: { id: debateId },
        data: { ...data, updated_at: new Date() } as Record<string, unknown>,
      });
      return { success: true };
    }),

  // ---- APPEALS ----
  appeals: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "PROCESSING", "RESOLVED", "DENIED"]).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.status) {
        where.appeal_status = input.status;
      } else {
        where.appeal_status = { not: null };
      }

      const [debates, total] = await Promise.all([
        ctx.prisma.debates.findMany({
          where,
          select: {
            id: true,
            topic: true,
            appeal_status: true,
            appeal_reason: true,
            appeal_count: true,
            appealed_at: true,
            appealed_by: true,
            winner_id: true,
            users_debates_challenger_idTousers: { select: { username: true } },
            users_debates_opponent_idTousers: { select: { username: true } },
          },
          orderBy: { appealed_at: "desc" },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        ctx.prisma.debates.count({ where }),
      ]);

      return { appeals: debates, total, totalPages: Math.ceil(total / input.limit) };
    }),

  resolveAppeal: adminProcedure
    .input(
      z.object({
        debateId: z.string(),
        decision: z.enum(["RESOLVED", "DENIED"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.debates.update({
        where: { id: input.debateId },
        data: {
          appeal_status: input.decision,
          appeal_rejection_reason: input.decision === "DENIED" ? input.reason : null,
          updated_at: new Date(),
        },
      });
      return { success: true };
    }),

  // ---- BELT MANAGEMENT ----
  belts: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.belts.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        status: true,
        is_active: true,
        times_defended: true,
        coin_value: true,
        created_at: true,
        users: { select: { username: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  beltSettings: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.belt_settings.findMany();
  }),

  updateBeltSettings: adminProcedure
    .input(
      z.object({
        beltType: z.string(),
        defense_period_days: z.number().int().optional(),
        inactivity_days: z.number().int().optional(),
        entry_fee_base: z.number().int().optional(),
        winner_reward_percent: z.number().int().optional(),
        loser_consolation_percent: z.number().int().optional(),
        platform_fee_percent: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { beltType, ...data } = input;
      await ctx.prisma.belt_settings.update({
        where: { belt_type: beltType as "ROOKIE" | "CATEGORY" | "CHAMPIONSHIP" | "UNDEFEATED" | "TOURNAMENT" },
        data: { ...data, updated_at: new Date() },
      });
      return { success: true };
    }),

  // ---- TOURNAMENT MANAGEMENT ----
  tournaments: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tournaments.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        format: true,
        max_participants: true,
        current_round: true,
        total_rounds: true,
        start_date: true,
        prize_pool: true,
        created_at: true,
        _count: { select: { tournament_participants: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  // ---- COIN MANAGEMENT ----
  coinTransactions: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        type: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.userId) where.user_id = input.userId;
      if (input.type) where.type = input.type;

      const [transactions, total] = await Promise.all([
        ctx.prisma.coin_transactions.findMany({
          where,
          select: {
            id: true,
            type: true,
            amount: true,
            balance_after: true,
            description: true,
            status: true,
            created_at: true,
            users: { select: { username: true } },
          },
          orderBy: { created_at: "desc" },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        ctx.prisma.coin_transactions.count({ where }),
      ]);

      return { transactions, total, totalPages: Math.ceil(total / input.limit) };
    }),

  grantCoins: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().int(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isGrant = input.amount > 0;

      await ctx.prisma.users.update({
        where: { id: input.userId },
        data: { coins: isGrant ? { increment: input.amount } : { decrement: Math.abs(input.amount) } },
      });

      const user = await ctx.prisma.users.findUnique({
        where: { id: input.userId },
        select: { coins: true },
      });

      await ctx.prisma.coin_transactions.create({
        data: {
          id: crypto.randomUUID(),
          user_id: input.userId,
          type: isGrant ? "ADMIN_GRANT" : "ADMIN_DEDUCT",
          amount: input.amount,
          balance_after: user?.coins ?? 0,
          description: input.description,
          status: "COMPLETED",
          updated_at: new Date(),
        },
      });

      return { newBalance: user?.coins ?? 0 };
    }),

  // ---- SUBSCRIPTION/PLAN MANAGEMENT ----
  subscriptionPlans: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.subscription_plans.findMany({
      orderBy: { price: "asc" },
    });
  }),

  updatePlan: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        price: z.number().optional(),
        is_active: z.boolean().optional(),
        debate_limit: z.number().int().optional(),
        appeal_limit: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.prisma.subscription_plans.update({
        where: { id },
        data: { ...data, updated_at: new Date() } as Record<string, unknown>,
      });
      return { success: true };
    }),

  promoCodes: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.promo_codes.findMany({
      orderBy: { created_at: "desc" },
    });
  }),

  createPromoCode: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20),
        discountType: z.enum(["PERCENT", "FIXED"]),
        discountValue: z.number().min(0),
        maxUses: z.number().int().optional(),
        validFrom: z.string().datetime(),
        validUntil: z.string().datetime().optional(),
        applicableTo: z.string().default("PRO"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const promo = await ctx.prisma.promo_codes.create({
        data: {
          id: crypto.randomUUID(),
          code: input.code.toUpperCase(),
          discountType: input.discountType,
          discountValue: input.discountValue,
          max_uses: input.maxUses,
          valid_from: new Date(input.validFrom),
          valid_until: input.validUntil ? new Date(input.validUntil) : null,
          applicableTo: input.applicableTo,
          is_active: true,
          updated_at: new Date(),
        },
      });
      return promo;
    }),

  // ---- BLOG MANAGEMENT ----
  blogPosts: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.blog_posts.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        views: true,
        featured: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: "desc" },
    });
  }),

  // ---- SUPPORT TICKETS ----
  supportTickets: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.status) where.status = input.status;

      const [tickets, total] = await Promise.all([
        ctx.prisma.support_tickets.findMany({
          where,
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            created_at: true,
            updated_at: true,
            users_support_tickets_user_idTousers: { select: { username: true, email: true } },
          },
          orderBy: { created_at: "desc" },
          take: input.limit,
          skip: (input.page - 1) * input.limit,
        }),
        ctx.prisma.support_tickets.count({ where }),
      ]);

      return { tickets, total, totalPages: Math.ceil(total / input.limit) };
    }),

  // ---- CATEGORIES ----
  categories: adminProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.debates.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });
    return categories;
  }),

  // ---- AI JUDGES ----
  judges: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.judges.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // ---- NOTIFICATIONS ----
  sendNotification: adminProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        type: z.string(),
        title: z.string(),
        message: z.string(),
        broadcast: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.broadcast) {
        // Get all user IDs
        const users = await ctx.prisma.users.findMany({
          select: { id: true },
        });
        const notifType = input.type as "OTHER" | "NEW_MESSAGE" | "DEBATE_TURN";
        const notifs = users.map((u) => ({
          id: crypto.randomUUID(),
          user_id: u.id,
          type: notifType,
          title: input.title,
          message: input.message,
          read: false,
          created_at: new Date(),
        }));
        await ctx.prisma.notifications.createMany({ data: notifs });
        return { sent: users.length };
      }

      if (!input.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "userId required for non-broadcast" });
      }

      const notifType = input.type as "OTHER" | "NEW_MESSAGE" | "DEBATE_TURN";
      await ctx.prisma.notifications.create({
        data: {
          id: crypto.randomUUID(),
          user_id: input.userId,
          type: notifType,
          title: input.title,
          message: input.message,
          read: false,
          created_at: new Date(),
        },
      });
      return { sent: 1 };
    }),
});
