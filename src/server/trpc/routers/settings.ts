import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../init";
import { updateProfileSchema } from "@/lib/validators/user";

export const settingsRouter = createTRPCRouter({
  // Update profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      if (input.username) {
        const existing = await ctx.prisma.users.findUnique({
          where: { username: input.username },
          select: { id: true },
        });
        if (existing && existing.id !== userId) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }
      }

      const updated = await ctx.prisma.users.update({
        where: { id: userId },
        data: {
          ...(input.username && { username: input.username }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.avatarUrl && { avatar_url: input.avatarUrl }),
          updated_at: new Date(),
        },
        select: {
          id: true,
          username: true,
          bio: true,
          avatar_url: true,
        },
      });

      return updated;
    }),

  // Change password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const user = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: { password_hash: true },
      });

      if (!user?.password_hash) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No password set (use OAuth)" });
      }

      const valid = await bcrypt.compare(input.currentPassword, user.password_hash);
      if (!valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect" });
      }

      const hash = await bcrypt.hash(input.newPassword, 12);
      await ctx.prisma.users.update({
        where: { id: userId },
        data: { password_hash: hash, updated_at: new Date() },
      });

      return { success: true };
    }),

  // Claim daily login reward
  claimDailyReward: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id as string;

      const user = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: {
          last_daily_reward_date: true,
          consecutive_login_days: true,
          coins: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (user.last_daily_reward_date) {
        const lastReward = new Date(user.last_daily_reward_date);
        const lastRewardDay = new Date(
          lastReward.getFullYear(),
          lastReward.getMonth(),
          lastReward.getDate()
        );
        if (lastRewardDay.getTime() === today.getTime()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Already claimed today" });
        }
      }

      // Calculate streak
      let newStreak = 1;
      if (user.last_daily_reward_date) {
        const lastReward = new Date(user.last_daily_reward_date);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastDay = new Date(
          lastReward.getFullYear(),
          lastReward.getMonth(),
          lastReward.getDate()
        );
        if (lastDay.getTime() === yesterday.getTime()) {
          newStreak = (user.consecutive_login_days ?? 0) + 1;
        }
      }

      // Reward: base 10 coins + streak bonus (max 50)
      const reward = Math.min(10 + newStreak * 2, 50);

      await ctx.prisma.users.update({
        where: { id: userId },
        data: {
          coins: { increment: reward },
          consecutive_login_days: newStreak,
          last_daily_reward_date: now,
          last_login_date: now,
          longest_login_streak: Math.max(newStreak, user.consecutive_login_days ?? 0),
          total_login_days: { increment: 1 },
          updated_at: now,
        },
      });

      return { reward, streak: newStreak };
    }),
});
