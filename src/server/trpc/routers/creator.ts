import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../init";

export const creatorRouter = createTRPCRouter({
  // Creator status for current user
  status: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.users.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        is_creator: true,
        creatorStatus: true,
        creator_since: true,
        creator_tax_info: true,
      },
    });

    return {
      isCreator: user?.is_creator ?? false,
      creatorStatus: user?.creatorStatus,
      creatorSince: user?.creator_since,
      hasTaxInfo: !!user?.creator_tax_info,
      taxFormComplete: user?.creator_tax_info?.tax_form_complete ?? false,
      payoutEnabled: user?.creator_tax_info?.payout_enabled ?? false,
    };
  }),

  // Creator setup / become a creator
  setup: protectedProcedure
    .input(
      z.object({
        stripeAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.prisma.users.update({
        where: { id: userId },
        data: {
          is_creator: true,
          creator_since: new Date(),
          creatorStatus: "BRONZE",
          updated_at: new Date(),
        },
      });

      // Create tax info record if Stripe account provided
      if (input.stripeAccountId) {
        await ctx.prisma.creator_tax_info.upsert({
          where: { creator_id: userId },
          create: {
            id: crypto.randomUUID(),
            creator_id: userId,
            stripe_account_id: input.stripeAccountId,
            updated_at: new Date(),
          },
          update: {
            stripe_account_id: input.stripeAccountId,
            updated_at: new Date(),
          },
        });
      }

      return { success: true };
    }),

  // Dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [
      activeContracts,
      totalEarnings,
      pendingOffers,
      completedContracts,
      totalImpressions,
      totalClicks,
    ] = await Promise.all([
      ctx.prisma.ad_contracts.count({ where: { creator_id: userId, status: "ACTIVE" } }),
      ctx.prisma.ad_contracts.aggregate({
        where: { creator_id: userId, status: "COMPLETED" },
        _sum: { creator_payout: true },
      }),
      ctx.prisma.offers.count({ where: { creator_id: userId, status: "PENDING" } }),
      ctx.prisma.ad_contracts.count({ where: { creator_id: userId, status: "COMPLETED" } }),
      ctx.prisma.impressions.count({
        where: { ad_contracts: { creator_id: userId } },
      }),
      ctx.prisma.clicks.count({
        where: { ad_contracts: { creator_id: userId } },
      }),
    ]);

    return {
      activeContracts,
      totalEarnings: Number(totalEarnings._sum.creator_payout ?? 0),
      pendingOffers,
      completedContracts,
      totalImpressions,
      totalClicks,
    };
  }),

  // Earnings breakdown
  earnings: protectedProcedure.query(async ({ ctx }) => {
    const contracts = await ctx.prisma.ad_contracts.findMany({
      where: { creator_id: ctx.session.user.id },
      select: {
        id: true,
        placement: true,
        total_amount: true,
        platform_fee: true,
        creator_payout: true,
        status: true,
        start_date: true,
        end_date: true,
        payout_sent: true,
        payout_date: true,
        campaigns: { select: { name: true } },
        advertisers: { select: { company_name: true } },
      },
      orderBy: { signed_at: "desc" },
    });

    return contracts;
  }),

  // Offers list
  offers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.offers.findMany({
      where: { creator_id: ctx.session.user.id },
      include: {
        campaigns: { select: { name: true, type: true, budget: true } },
        advertisers: { select: { company_name: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  // Respond to offer
  respondOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.string(),
        action: z.enum(["ACCEPT", "DECLINE", "COUNTER"]),
        counterAmount: z.number().optional(),
        counterMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const offer = await ctx.prisma.offers.findUnique({
        where: { id: input.offerId },
      });

      if (!offer || offer.creator_id !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
      }

      if (offer.status !== "PENDING" && offer.status !== "COUNTERED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Offer cannot be responded to" });
      }

      if (input.action === "ACCEPT") {
        // Update offer status
        await ctx.prisma.offers.update({
          where: { id: input.offerId },
          data: { status: "ACCEPTED", responded_at: new Date() },
        });

        // Create ad contract
        const platformFeeRate = 0.15; // 15% platform fee
        const totalAmount = Number(offer.amount);
        const platformFee = totalAmount * platformFeeRate;
        const creatorPayout = totalAmount - platformFee;

        await ctx.prisma.ad_contracts.create({
          data: {
            id: crypto.randomUUID(),
            offer_id: input.offerId,
            advertiser_id: offer.advertiser_id,
            creator_id: offer.creator_id,
            campaign_id: offer.campaign_id,
            placement: offer.placement,
            total_amount: totalAmount,
            platform_fee: platformFee,
            creator_payout: creatorPayout,
            start_date: new Date(),
            end_date: new Date(Date.now() + offer.duration * 24 * 60 * 60 * 1000),
            status: "SCHEDULED",
            escrow_held: true,
          },
        });
      } else if (input.action === "DECLINE") {
        await ctx.prisma.offers.update({
          where: { id: input.offerId },
          data: { status: "DECLINED", responded_at: new Date() },
        });
      } else if (input.action === "COUNTER") {
        await ctx.prisma.offers.update({
          where: { id: input.offerId },
          data: {
            status: "COUNTERED",
            counter_amount: input.counterAmount,
            counter_message: input.counterMessage,
            negotiation_round: { increment: 1 },
            responded_at: new Date(),
          },
        });
      }

      return { success: true };
    }),

  // Tax info
  taxInfo: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.creator_tax_info.findUnique({
      where: { creator_id: ctx.session.user.id },
      include: { tax_form_1099: { orderBy: { tax_year: "desc" } } },
    });
  }),

  // Update tax info
  updateTaxInfo: protectedProcedure
    .input(
      z.object({
        legalName: z.string().optional(),
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        taxIdType: z.string().optional(),
        taxId: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.creator_tax_info.upsert({
        where: { creator_id: ctx.session.user.id },
        create: {
          id: crypto.randomUUID(),
          creator_id: ctx.session.user.id,
          stripe_account_id: `pending_${ctx.session.user.id}`,
          legal_name: input.legalName,
          business_name: input.businessName,
          business_type: input.businessType,
          tax_id_type: input.taxIdType,
          tax_id: input.taxId,
          address_line1: input.addressLine1,
          address_line2: input.addressLine2,
          city: input.city,
          state: input.state,
          zip_code: input.zipCode,
          country: input.country,
          w9_submitted: true,
          w9_submitted_at: new Date(),
          updated_at: new Date(),
        },
        update: {
          legal_name: input.legalName,
          business_name: input.businessName,
          business_type: input.businessType,
          tax_id_type: input.taxIdType,
          tax_id: input.taxId,
          address_line1: input.addressLine1,
          address_line2: input.addressLine2,
          city: input.city,
          state: input.state,
          zip_code: input.zipCode,
          country: input.country,
          w9_submitted: true,
          w9_submitted_at: new Date(),
          updated_at: new Date(),
        },
      });

      return { success: true };
    }),

  // Creator settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        creatorStatus: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.users.update({
        where: { id: ctx.session.user.id },
        data: {
          creatorStatus: input.creatorStatus,
          updated_at: new Date(),
        },
      });
      return { success: true };
    }),
});
