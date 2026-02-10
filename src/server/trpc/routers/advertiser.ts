import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../init";

export const advertiserRouter = createTRPCRouter({
  // Get advertiser profile for current user
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.advertisers.findFirst({
      where: { contact_email: ctx.session.user.email ?? "" },
    });
  }),

  // Apply as advertiser
  submitApplication: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(2),
        website: z.string().url(),
        industry: z.string().min(2),
        contactName: z.string().min(2),
        contactPhone: z.string().optional(),
        companySize: z.string().optional(),
        monthlyAdBudget: z.string().optional(),
        marketingGoals: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = ctx.session.user.email;
      if (!email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email required" });
      }

      const existing = await ctx.prisma.advertisers.findFirst({
        where: { contact_email: email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Application already exists",
        });
      }

      return ctx.prisma.advertisers.create({
        data: {
          id: crypto.randomUUID(),
          company_name: input.companyName,
          website: input.website,
          industry: input.industry,
          contact_email: email,
          contact_name: input.contactName,
          contact_phone: input.contactPhone,
          company_size: input.companySize,
          monthly_ad_budget: input.monthlyAdBudget,
          marketing_goals: input.marketingGoals,
          status: "PENDING",
          updated_at: new Date(),
        },
      });
    }),

  // Dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const advertiser = await ctx.prisma.advertisers.findFirst({
      where: { contact_email: ctx.session.user.email ?? "" },
    });

    if (!advertiser) return null;

    const [campaigns, totalSpent, activeContracts, totalImpressions, totalClicks] =
      await Promise.all([
        ctx.prisma.campaigns.count({ where: { advertiser_id: advertiser.id } }),
        ctx.prisma.campaigns.aggregate({
          where: { advertiser_id: advertiser.id },
          _sum: { budget: true },
        }),
        ctx.prisma.ad_contracts.count({
          where: { advertiser_id: advertiser.id, status: "ACTIVE" },
        }),
        ctx.prisma.impressions.count({
          where: { campaigns: { advertiser_id: advertiser.id } },
        }),
        ctx.prisma.clicks.count({
          where: { campaigns: { advertiser_id: advertiser.id } },
        }),
      ]);

    return {
      advertiserId: advertiser.id,
      status: advertiser.status,
      campaigns,
      totalSpent: Number(totalSpent._sum.budget ?? 0),
      activeContracts,
      totalImpressions,
      totalClicks,
      ctr: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00",
    };
  }),

  // List campaigns
  campaigns: protectedProcedure.query(async ({ ctx }) => {
    const advertiser = await ctx.prisma.advertisers.findFirst({
      where: { contact_email: ctx.session.user.email ?? "" },
      select: { id: true },
    });

    if (!advertiser) return [];

    return ctx.prisma.campaigns.findMany({
      where: { advertiser_id: advertiser.id },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        budget: true,
        start_date: true,
        end_date: true,
        destination_url: true,
        created_at: true,
        _count: { select: { impressions: true, clicks: true, offers: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  // Get single campaign
  campaign: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaigns.findUnique({
        where: { id: input.id },
        include: {
          offers: {
            include: { users: { select: { id: true, username: true, elo_rating: true } } },
          },
          ad_contracts: true,
          _count: { select: { impressions: true, clicks: true } },
        },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      return campaign;
    }),

  // Create campaign
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        type: z.enum(["PLATFORM_ADS", "CREATOR_SPONSORSHIP", "TOURNAMENT_SPONSORSHIP"]),
        category: z.string(),
        budget: z.number().min(1),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        destinationUrl: z.string().url(),
        ctaText: z.string().default("Learn More"),
        bannerUrl: z.string().optional(),
        targetCategories: z.array(z.string()).default([]),
        minElo: z.number().int().optional(),
        minFollowers: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const advertiser = await ctx.prisma.advertisers.findFirst({
        where: { contact_email: ctx.session.user.email ?? "", status: "APPROVED" },
      });

      if (!advertiser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not an approved advertiser" });
      }

      return ctx.prisma.campaigns.create({
        data: {
          id: crypto.randomUUID(),
          advertiser_id: advertiser.id,
          name: input.name,
          type: input.type,
          category: input.category,
          budget: input.budget,
          start_date: new Date(input.startDate),
          end_date: new Date(input.endDate),
          destination_url: input.destinationUrl,
          cta_text: input.ctaText,
          banner_url: input.bannerUrl,
          target_categories: input.targetCategories,
          min_elo: input.minElo,
          min_followers: input.minFollowers,
          status: "PENDING_REVIEW",
          updated_at: new Date(),
        },
      });
    }),

  // Send offer to creator
  sendOffer: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        creatorId: z.string(),
        placement: z.enum(["PROFILE_BANNER", "POST_DEBATE", "DEBATE_WIDGET", "EMAIL_SHOUTOUT", "DEBATE_SPONSORSHIP"]),
        duration: z.number().int().min(1),
        paymentType: z.enum(["FLAT_RATE", "PAY_PER_CLICK", "PAY_PER_IMPRESSION", "PERFORMANCE_BONUS", "REVENUE_SHARE"]),
        amount: z.number().min(0),
        cpcRate: z.number().optional(),
        cpmRate: z.number().optional(),
        message: z.string().optional(),
        expiresInDays: z.number().int().min(1).max(30).default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const advertiser = await ctx.prisma.advertisers.findFirst({
        where: { contact_email: ctx.session.user.email ?? "", status: "APPROVED" },
      });

      if (!advertiser) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not an approved advertiser" });
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      return ctx.prisma.offers.create({
        data: {
          id: crypto.randomUUID(),
          advertiser_id: advertiser.id,
          campaign_id: input.campaignId,
          creator_id: input.creatorId,
          placement: input.placement,
          duration: input.duration,
          payment_type: input.paymentType,
          amount: input.amount,
          cpc_rate: input.cpcRate,
          cpm_rate: input.cpmRate,
          message: input.message,
          status: "PENDING",
          expires_at: expiresAt,
        },
      });
    }),

  // Browse creators for marketplace
  creators: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        minElo: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const creators = await ctx.prisma.users.findMany({
        where: {
          is_creator: true,
          username: input.search ? { contains: input.search, mode: "insensitive" } : undefined,
          elo_rating: input.minElo ? { gte: input.minElo } : undefined,
        },
        select: {
          id: true,
          username: true,
          elo_rating: true,
          total_debates: true,
          debates_won: true,
          creatorStatus: true,
          creator_since: true,
          _count: { select: { follows_follows_following_idTousers: true } },
        },
        orderBy: { elo_rating: "desc" },
        take: 50,
      });

      return creators.map((c) => ({
        ...c,
        followers: c._count.follows_follows_following_idTousers,
      }));
    }),

  // Advertiser settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        companyName: z.string().optional(),
        website: z.string().url().optional(),
        contactPhone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const advertiser = await ctx.prisma.advertisers.findFirst({
        where: { contact_email: ctx.session.user.email ?? "" },
      });

      if (!advertiser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No advertiser profile" });
      }

      await ctx.prisma.advertisers.update({
        where: { id: advertiser.id },
        data: {
          company_name: input.companyName,
          website: input.website,
          contact_phone: input.contactPhone,
          updated_at: new Date(),
        },
      });

      return { success: true };
    }),
});
