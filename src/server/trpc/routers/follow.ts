import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../init";

export const followRouter = createTRPCRouter({
  // Follow/unfollow a user (toggle)
  toggle: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followerId = ctx.session.user.id as string;

      if (input.userId === followerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself" });
      }

      const existing = await ctx.prisma.follows.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: followerId,
            following_id: input.userId,
          },
        },
      });

      if (existing) {
        await ctx.prisma.follows.delete({ where: { id: existing.id } });
        await ctx.prisma.users.update({
          where: { id: input.userId },
          data: { follower_count: { decrement: 1 } },
        });
        return { following: false };
      }

      await ctx.prisma.follows.create({
        data: {
          id: crypto.randomUUID(),
          follower_id: followerId,
          following_id: input.userId,
        },
      });
      await ctx.prisma.users.update({
        where: { id: input.userId },
        data: { follower_count: { increment: 1 } },
      });

      return { following: true };
    }),

  // Check if current user follows a specific user
  isFollowing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const followerId = ctx.session.user.id as string;

      const existing = await ctx.prisma.follows.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: followerId,
            following_id: input.userId,
          },
        },
      });

      return { following: !!existing };
    }),

  // Get followers of a user
  followers: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const follows = await ctx.prisma.follows.findMany({
        where: { following_id: input.userId },
        select: {
          id: true,
          created_at: true,
          users_follows_follower_idTousers: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              elo_rating: true,
              bio: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (follows.length > input.limit) {
        const next = follows.pop();
        nextCursor = next?.id;
      }

      return {
        users: follows.map((f) => f.users_follows_follower_idTousers),
        nextCursor,
      };
    }),

  // Get users that a user is following
  following: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const follows = await ctx.prisma.follows.findMany({
        where: { follower_id: input.userId },
        select: {
          id: true,
          created_at: true,
          users_follows_following_idTousers: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              elo_rating: true,
              bio: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (follows.length > input.limit) {
        const next = follows.pop();
        nextCursor = next?.id;
      }

      return {
        users: follows.map((f) => f.users_follows_following_idTousers),
        nextCursor,
      };
    }),
});
