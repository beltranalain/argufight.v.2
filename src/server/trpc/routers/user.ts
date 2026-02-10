import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../init";
import { userSearchSchema } from "@/lib/validators/user";

const publicProfileSelect = {
  id: true,
  username: true,
  email: true,
  avatar_url: true,
  bio: true,
  elo_rating: true,
  total_debates: true,
  debates_won: true,
  debates_lost: true,
  debates_tied: true,
  coins: true,
  is_creator: true,
  total_belt_defenses: true,
  current_belts_count: true,
  total_belt_wins: true,
  follower_count: true,
  created_at: true,
} as const;

export const userRouter = createTRPCRouter({
  // Get user profile by ID or username
  profile: publicProcedure
    .input(z.object({ id: z.string().optional(), username: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.username) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide id or username" });
      }

      const where = input.username ? { username: input.username } : { id: input.id };

      const user = await ctx.prisma.users.findUnique({
        where,
        select: publicProfileSelect,
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  // Search users
  search: publicProcedure
    .input(userSearchSchema)
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.users.findMany({
        where: {
          OR: [
            { username: { contains: input.query, mode: "insensitive" } },
            { email: { contains: input.query, mode: "insensitive" } },
          ],
          is_banned: false,
        },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          elo_rating: true,
          debates_won: true,
        },
        take: input.limit,
        orderBy: { elo_rating: "desc" },
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      return users;
    }),

  // Get current user's full profile
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id as string;

      const user = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: {
          ...publicProfileSelect,
          totp_enabled: true,
          is_admin: true,
          consecutive_login_days: true,
          last_daily_reward_date: true,
          last_login_date: true,
          longest_login_streak: true,
          user_subscriptions: {
            select: {
              tier: true,
              status: true,
              current_period_end: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user;
    }),

  // Get leaderboard
  leaderboard: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.users.findMany({
        where: {
          is_banned: false,
          total_debates: { gt: 0 },
        },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          elo_rating: true,
          debates_won: true,
          debates_lost: true,
          debates_tied: true,
          total_debates: true,
        },
        orderBy: { elo_rating: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      return users;
    }),
});
