import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { stripe, PLAN_CONFIG, getPlanLimits } from "@/server/stripe/client";

export const subscriptionRouter = createTRPCRouter({
  // Get available plans (from DB or fallback to config)
  plans: publicProcedure.query(async ({ ctx }) => {
    const dbPlans = await ctx.prisma.subscription_plans.findMany({
      where: { is_active: true },
      orderBy: { price: "asc" },
    });

    if (dbPlans.length > 0) {
      return dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        billingCycle: p.billingCycle,
        features: p.features ? p.features.split(",").map((f) => f.trim()) : [],
        appealLimit: p.appeal_limit,
        debateLimit: p.debate_limit,
        prioritySupport: p.priority_support,
        customBadge: p.custom_badge,
        stripePriceId: p.stripe_price_id,
      }));
    }

    // Fallback to hardcoded config
    return Object.entries(PLAN_CONFIG).map(([tier, config]) => ({
      id: tier,
      name: config.name,
      description: null,
      price: config.priceMonthly / 100,
      billingCycle: "MONTHLY",
      features: Object.entries(config.limits)
        .filter(([, v]) => v === true || (typeof v === "number" && Number(v) > 0))
        .map(([k]) => k.replace(/([A-Z])/g, " $1").trim()),
      appealLimit: config.limits.monthlyAppeals,
      debateLimit: config.limits.dailyDebates,
      prioritySupport: config.limits.priorityMatchmaking,
      customBadge: null,
      stripePriceId: config.stripePriceIdMonthly,
    }));
  }),

  // Current user's subscription status
  status: protectedProcedure.query(async ({ ctx }) => {
    const sub = await ctx.prisma.user_subscriptions.findUnique({
      where: { user_id: ctx.session.user.id },
      include: { promo_codes: { select: { code: true, discountType: true, discountValue: true } } },
    });

    const tier = sub?.tier ?? "FREE";
    const limits = getPlanLimits(tier);

    return {
      subscription: sub
        ? {
            id: sub.id,
            tier: sub.tier,
            billingCycle: sub.billingCycle,
            status: sub.status,
            currentPeriodStart: sub.current_period_start,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            cancelledAt: sub.cancelled_at,
            promoCode: sub.promo_codes,
          }
        : null,
      tier,
      limits,
    };
  }),

  // Create Stripe Checkout session for subscription
  createCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["PRO"]),
        billingCycle: z.enum(["MONTHLY", "YEARLY"]),
        promoCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe not configured",
        });
      }

      const userId = ctx.session.user.id;
      const config = PLAN_CONFIG[input.tier];
      const priceId =
        input.billingCycle === "YEARLY"
          ? config.stripePriceIdYearly
          : config.stripePriceIdMonthly;

      if (!priceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Price not configured for this plan",
        });
      }

      // Check existing sub
      const existingSub = await ctx.prisma.user_subscriptions.findUnique({
        where: { user_id: userId },
      });

      if (existingSub?.status === "ACTIVE" && !existingSub.cancel_at_period_end) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active subscription",
        });
      }

      // Validate promo code
      let promoCodeId: string | undefined;
      const discounts: { coupon: string }[] = [];

      if (input.promoCode) {
        const promo = await ctx.prisma.promo_codes.findUnique({
          where: { code: input.promoCode },
        });

        if (!promo || !promo.is_active) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid promo code",
          });
        }

        if (promo.valid_until && promo.valid_until < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Promo code has expired",
          });
        }

        if (promo.max_uses && promo.current_uses >= promo.max_uses) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Promo code has been fully redeemed",
          });
        }

        promoCodeId = promo.id;
        // In production, create a Stripe coupon or use an existing one
        // For now, store the promo code ID in metadata
      }

      // Get or create Stripe customer
      let customerId = existingSub?.stripe_customer_id;

      if (!customerId) {
        const user = await ctx.prisma.users.findUnique({
          where: { id: userId },
          select: { email: true, username: true },
        });

        const customer = await stripe.customers.create({
          email: user?.email ?? undefined,
          name: user?.username ?? undefined,
          metadata: { userId },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        ...(discounts.length > 0 ? { discounts } : {}),
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
        metadata: {
          userId,
          tier: input.tier,
          billingCycle: input.billingCycle,
          promoCodeId: promoCodeId ?? "",
        },
      });

      // Increment promo code usage
      if (promoCodeId) {
        await ctx.prisma.promo_codes.update({
          where: { id: promoCodeId },
          data: { current_uses: { increment: 1 } },
        });
      }

      return { url: session.url };
    }),

  // Create Stripe Checkout for coin purchase
  createCoinCheckout: protectedProcedure
    .input(z.object({ packageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe not configured",
        });
      }

      const packages: Record<string, { coins: number; priceInCents: number; name: string }> = {
        starter: { coins: 100, priceInCents: 199, name: "Starter Pack" },
        popular: { coins: 500, priceInCents: 799, name: "Popular Pack" },
        pro: { coins: 1200, priceInCents: 1499, name: "Pro Pack" },
        elite: { coins: 3000, priceInCents: 2999, name: "Elite Pack" },
        whale: { coins: 10000, priceInCents: 7999, name: "Mega Pack" },
      };

      const pkg = packages[input.packageId];
      if (!pkg) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid package" });
      }

      const userId = ctx.session.user.id;

      // Get or create Stripe customer
      const existingSub = await ctx.prisma.user_subscriptions.findUnique({
        where: { user_id: userId },
        select: { stripe_customer_id: true },
      });

      let customerId = existingSub?.stripe_customer_id;

      if (!customerId) {
        const user = await ctx.prisma.users.findUnique({
          where: { id: userId },
          select: { email: true, username: true },
        });
        const customer = await stripe.customers.create({
          email: user?.email ?? undefined,
          name: user?.username ?? undefined,
          metadata: { userId },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: `${pkg.name} — ${pkg.coins} Coins` },
              unit_amount: pkg.priceInCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coins/purchase`,
        metadata: {
          userId,
          type: "coin_purchase",
          coins: String(pkg.coins),
          packageId: input.packageId,
        },
      });

      return { url: session.url };
    }),

  // Cancel subscription
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await ctx.prisma.user_subscriptions.findUnique({
      where: { user_id: ctx.session.user.id },
    });

    if (!sub || sub.status !== "ACTIVE") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active subscription to cancel",
      });
    }

    if (stripe && sub.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    await ctx.prisma.user_subscriptions.update({
      where: { id: sub.id },
      data: {
        cancel_at_period_end: true,
        updated_at: new Date(),
      },
    });

    return { success: true };
  }),

  // Reactivate cancelled subscription
  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await ctx.prisma.user_subscriptions.findUnique({
      where: { user_id: ctx.session.user.id },
    });

    if (!sub || !sub.cancel_at_period_end) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No cancelled subscription to reactivate",
      });
    }

    if (stripe && sub.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
    }

    await ctx.prisma.user_subscriptions.update({
      where: { id: sub.id },
      data: {
        cancel_at_period_end: false,
        cancelled_at: null,
        updated_at: new Date(),
      },
    });

    return { success: true };
  }),

  // Validate promo code
  validatePromo: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const promo = await ctx.prisma.promo_codes.findUnique({
        where: { code: input.code },
      });

      if (!promo || !promo.is_active) {
        return { valid: false, message: "Invalid promo code" };
      }

      if (promo.valid_until && promo.valid_until < new Date()) {
        return { valid: false, message: "Promo code has expired" };
      }

      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        return { valid: false, message: "Promo code fully redeemed" };
      }

      return {
        valid: true,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        applicableTo: promo.applicableTo,
        description: promo.description,
      };
    }),

  // Usage stats for current period
  usage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [debatesToday, appealsThisMonth] = await Promise.all([
      ctx.prisma.debates.count({
        where: {
          challenger_id: userId,
          created_at: { gte: startOfDay },
        },
      }),
      ctx.prisma.usage_tracking.findFirst({
        where: {
          user_id: userId,
          featureType: "APPEAL",
          period_start: { gte: startOfMonth },
        },
        select: { count: true },
      }),
    ]);

    const sub = await ctx.prisma.user_subscriptions.findUnique({
      where: { user_id: userId },
      select: { tier: true },
    });

    const limits = getPlanLimits(sub?.tier ?? "FREE");

    return {
      debates: {
        used: debatesToday,
        limit: limits.dailyDebates,
        unlimited: limits.dailyDebates === -1,
      },
      appeals: {
        used: appealsThisMonth?.count ?? 0,
        limit: limits.monthlyAppeals,
      },
    };
  }),
});
