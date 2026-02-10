import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set — Stripe features disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Plan configuration (maps tier names to Stripe price IDs)
export const PLAN_CONFIG = {
  FREE: {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    limits: {
      dailyDebates: 5,
      monthlyAppeals: 2,
      aiCoaching: false,
      advancedAnalytics: false,
      priorityMatchmaking: false,
      customThemes: false,
      coinMultiplier: 1,
      beltChallenges: true,
      tournamentCreation: false,
      adFree: false,
    },
  },
  PRO: {
    name: "Pro",
    priceMonthly: 999, // cents
    priceYearly: 9990, // cents
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null,
    limits: {
      dailyDebates: -1, // unlimited
      monthlyAppeals: 10,
      aiCoaching: true,
      advancedAnalytics: true,
      priorityMatchmaking: true,
      customThemes: true,
      coinMultiplier: 2,
      beltChallenges: true,
      tournamentCreation: true,
      adFree: true,
    },
  },
} as const;

export type PlanTier = keyof typeof PLAN_CONFIG;

export function getPlanLimits(tier: string) {
  const plan = PLAN_CONFIG[tier as PlanTier];
  return plan?.limits ?? PLAN_CONFIG.FREE.limits;
}
