import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import {
  beltListSchema,
  createChallengeSchema,
  respondChallengeSchema,
} from "@/lib/validators/belt";

const beltSelect = {
  id: true,
  name: true,
  type: true,
  category: true,
  current_holder_id: true,
  status: true,
  acquired_at: true,
  last_defended_at: true,
  next_defense_due: true,
  times_defended: true,
  successful_defenses: true,
  total_days_held: true,
  is_staked: true,
  design_image_url: true,
  design_colors: true,
  coin_value: true,
  is_active: true,
  created_at: true,
  users: {
    select: {
      id: true,
      username: true,
      avatar_url: true,
      elo_rating: true,
    },
  },
  _count: {
    select: { belt_challenges: true, belt_history: true },
  },
} as const;

export const beltRouter = createTRPCRouter({
  list: publicProcedure.input(beltListSchema).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = { is_active: true };
    if (input.type) where.type = input.type;
    if (input.status) where.status = input.status;
    if (input.category) where.category = input.category;

    const belts = await ctx.prisma.belts.findMany({
      where,
      select: beltSelect,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return belts;
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const belt = await ctx.prisma.belts.findUnique({
        where: { id: input.id },
        select: {
          ...beltSelect,
          grace_period_ends: true,
          inactive_at: true,
          is_first_holder: true,
          sponsor_name: true,
          sponsor_logo_url: true,
          creation_cost: true,
          admin_notes: true,
          belt_challenges: {
            where: { status: { in: ["PENDING", "ACCEPTED"] } },
            select: {
              id: true,
              challenger_id: true,
              status: true,
              entry_fee: true,
              expires_at: true,
              created_at: true,
              users_belt_challenges_challenger_idTousers: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                  elo_rating: true,
                },
              },
            },
            orderBy: { created_at: "desc" },
            take: 10,
          },
        },
      });

      if (!belt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Belt not found" });
      }

      return belt;
    }),

  history: publicProcedure
    .input(
      z.object({
        beltId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.belt_history.findMany({
        where: { belt_id: input.beltId },
        select: {
          id: true,
          reason: true,
          days_held: true,
          defenses_won: true,
          defenses_lost: true,
          transferred_at: true,
          users_belt_history_from_user_idTousers: {
            select: { id: true, username: true, avatar_url: true },
          },
          users_belt_history_to_user_idTousers: {
            select: { id: true, username: true, avatar_url: true },
          },
          debates: {
            select: { id: true, topic: true },
          },
        },
        orderBy: { transferred_at: "desc" },
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

  settings: publicProcedure
    .input(z.object({ beltType: z.enum(["ROOKIE", "CATEGORY", "CHAMPIONSHIP", "UNDEFEATED", "TOURNAMENT"]) }))
    .query(async ({ ctx, input }) => {
      const settings = await ctx.prisma.belt_settings.findUnique({
        where: { belt_type: input.beltType },
      });
      return settings;
    }),

  challenge: protectedProcedure
    .input(createChallengeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const belt = await ctx.prisma.belts.findUnique({
        where: { id: input.beltId },
        select: {
          id: true,
          current_holder_id: true,
          status: true,
          type: true,
          category: true,
        },
      });

      if (!belt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Belt not found" });
      }

      if (!belt.current_holder_id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Belt is vacant" });
      }

      if (belt.current_holder_id === userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot challenge your own belt",
        });
      }

      if (!["ACTIVE", "MANDATORY", "GRACE_PERIOD"].includes(belt.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Belt is not available for challenges",
        });
      }

      // Check for existing pending challenge
      const existingChallenge = await ctx.prisma.belt_challenges.findFirst({
        where: {
          belt_id: input.beltId,
          challenger_id: userId,
          status: "PENDING",
        },
      });

      if (existingChallenge) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a pending challenge for this belt",
        });
      }

      // Get belt settings for fees
      const settings = await ctx.prisma.belt_settings.findUnique({
        where: { belt_type: belt.type },
      });

      const entryFee =
        !input.usesFreeChallenge && settings?.require_coins_for_challenge
          ? settings.entry_fee_base
          : 0;

      // Check coins
      const user = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: { coins: true, elo_rating: true },
      });

      if (entryFee > 0 && (user?.coins ?? 0) < entryFee) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient coins for challenge entry fee",
        });
      }

      const holder = await ctx.prisma.users.findUnique({
        where: { id: belt.current_holder_id },
        select: { elo_rating: true },
      });

      const challengerElo = user?.elo_rating ?? 1200;
      const holderElo = holder?.elo_rating ?? 1200;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (settings?.challenge_expiry_days ?? 3));

      // Deduct entry fee
      if (entryFee > 0) {
        await ctx.prisma.users.update({
          where: { id: userId },
          data: { coins: { decrement: entryFee } },
        });

        const updatedUser = await ctx.prisma.users.findUnique({
          where: { id: userId },
          select: { coins: true },
        });

        await ctx.prisma.coin_transactions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: userId,
            type: "BELT_CHALLENGE_ENTRY",
            amount: -entryFee,
            balance_after: updatedUser?.coins ?? 0,
            belt_id: belt.id,
            description: `Belt challenge entry fee`,
            status: "COMPLETED",
            updated_at: new Date(),
          },
        });
      }

      const challenge = await ctx.prisma.belt_challenges.create({
        data: {
          id: crypto.randomUUID(),
          belt_id: input.beltId,
          challenger_id: userId,
          belt_holder_id: belt.current_holder_id,
          entry_fee: entryFee,
          coin_reward: Math.round(entryFee * (settings?.winner_reward_percent ?? 60) / 100),
          challenger_elo: challengerElo,
          holder_elo: holderElo,
          elo_difference: Math.abs(challengerElo - holderElo),
          expires_at: expiresAt,
          uses_free_challenge: input.usesFreeChallenge ?? false,
          debate_topic: input.topic,
          debate_description: input.description,
          debate_category: input.category ?? belt.category,
          debate_challenger_position: input.challengerPosition,
          debate_total_rounds: input.totalRounds,
          debate_round_duration: input.roundDuration,
          debate_speed_mode: input.speedMode,
          debate_allow_copy_paste: input.allowCopyPaste,
          status: "PENDING",
          updated_at: new Date(),
        },
      });

      return challenge;
    }),

  respondToChallenge: protectedProcedure
    .input(respondChallengeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const challenge = await ctx.prisma.belt_challenges.findUnique({
        where: { id: input.challengeId },
        select: {
          id: true,
          belt_holder_id: true,
          status: true,
          entry_fee: true,
          challenger_id: true,
          belt_id: true,
        },
      });

      if (!challenge) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (challenge.belt_holder_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the belt holder can respond" });
      }

      if (challenge.status !== "PENDING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Challenge is no longer pending" });
      }

      if (input.response === "DECLINED") {
        await ctx.prisma.belt_challenges.update({
          where: { id: input.challengeId },
          data: {
            status: "DECLINED",
            response: "DECLINED",
            responded_at: new Date(),
            decline_count: { increment: 1 },
            updated_at: new Date(),
          },
        });

        // Refund entry fee to challenger
        if (challenge.entry_fee > 0) {
          await ctx.prisma.users.update({
            where: { id: challenge.challenger_id },
            data: { coins: { increment: challenge.entry_fee } },
          });

          const refundedUser = await ctx.prisma.users.findUnique({
            where: { id: challenge.challenger_id },
            select: { coins: true },
          });

          await ctx.prisma.coin_transactions.create({
            data: {
              id: crypto.randomUUID(),
              user_id: challenge.challenger_id,
              type: "REFUND",
              amount: challenge.entry_fee,
              balance_after: refundedUser?.coins ?? 0,
              belt_challenge_id: challenge.id,
              belt_id: challenge.belt_id,
              description: "Belt challenge declined — entry fee refunded",
              status: "COMPLETED",
              updated_at: new Date(),
            },
          });
        }

        return { status: "DECLINED" as const };
      }

      // Accepted — create the debate
      const challengeData = await ctx.prisma.belt_challenges.findUnique({
        where: { id: input.challengeId },
        select: {
          debate_topic: true,
          debate_description: true,
          debate_category: true,
          debate_challenger_position: true,
          debate_total_rounds: true,
          debate_round_duration: true,
          debate_speed_mode: true,
          debate_allow_copy_paste: true,
          challenger_id: true,
          belt_holder_id: true,
          belt_id: true,
        },
      });

      const debate = await ctx.prisma.debates.create({
        data: {
          id: crypto.randomUUID(),
          topic: challengeData?.debate_topic ?? "Belt Challenge",
          description: challengeData?.debate_description,
          category: (challengeData?.debate_category ?? "OTHER") as "SPORTS" | "POLITICS" | "TECH" | "ENTERTAINMENT" | "SCIENCE" | "MUSIC" | "OTHER",
          challenger_id: challengeData?.challenger_id ?? "",
          opponent_id: challengeData?.belt_holder_id,
          challenger_position: (challengeData?.debate_challenger_position ?? "FOR") as "FOR" | "AGAINST",
          opponent_position: (challengeData?.debate_challenger_position === "AGAINST" ? "FOR" : "AGAINST") as "FOR" | "AGAINST",
          total_rounds: challengeData?.debate_total_rounds ?? 3,
          speed_mode: challengeData?.debate_speed_mode ?? false,
          allow_copy_paste: challengeData?.debate_allow_copy_paste ?? true,
          status: "ACTIVE",
          visibility: "PUBLIC",
          current_round: 1,
          slug: `belt-${Date.now()}`,
          updated_at: new Date(),
        },
      });

      await ctx.prisma.belt_challenges.update({
        where: { id: input.challengeId },
        data: {
          status: "ACCEPTED",
          response: "ACCEPTED",
          responded_at: new Date(),
          debate_id: debate.id,
          updated_at: new Date(),
        },
      });

      // Stake the belt
      await ctx.prisma.belts.update({
        where: { id: challenge.belt_id },
        data: {
          is_staked: true,
          staked_in_debate_id: debate.id,
          status: "STAKED",
          updated_at: new Date(),
        },
      });

      return { status: "ACCEPTED" as const, debateId: debate.id };
    }),

  myBelts: protectedProcedure.query(async ({ ctx }) => {
    const belts = await ctx.prisma.belts.findMany({
      where: { current_holder_id: ctx.session.user.id, is_active: true },
      select: beltSelect,
      orderBy: { acquired_at: "desc" },
    });
    return belts;
  }),

  activeChallenges: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const challenges = await ctx.prisma.belt_challenges.findMany({
      where: {
        OR: [{ challenger_id: userId }, { belt_holder_id: userId }],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      select: {
        id: true,
        belt_id: true,
        challenger_id: true,
        belt_holder_id: true,
        status: true,
        entry_fee: true,
        coin_reward: true,
        expires_at: true,
        debate_id: true,
        debate_topic: true,
        created_at: true,
        belts: { select: { id: true, name: true, type: true } },
        users_belt_challenges_challenger_idTousers: {
          select: { id: true, username: true, avatar_url: true, elo_rating: true },
        },
        users_belt_challenges_belt_holder_idTousers: {
          select: { id: true, username: true, avatar_url: true, elo_rating: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return challenges;
  }),
});
