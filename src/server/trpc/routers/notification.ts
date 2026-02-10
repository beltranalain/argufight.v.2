import { z } from "zod";
import crypto from "crypto";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../init";

export const notificationRouter = createTRPCRouter({
  // Get user notifications
  list: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(30),
      cursor: z.string().optional(),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const where: Record<string, unknown> = { user_id: userId };
      if (input.unreadOnly) where.read = false;

      const notifications = await ctx.prisma.notifications.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          debate_id: true,
          read: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (notifications.length > input.limit) {
        const next = notifications.pop();
        nextCursor = next?.id;
      }

      return { notifications, nextCursor };
    }),

  // Get unread count
  unreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id as string;

      const count = await ctx.prisma.notifications.count({
        where: { user_id: userId, read: false },
      });

      return { count };
    }),

  // Mark notification as read
  markRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      await ctx.prisma.notifications.updateMany({
        where: { id: input.notificationId, user_id: userId },
        data: { read: true, read_at: new Date() },
      });

      return { success: true };
    }),

  // Mark all notifications as read
  markAllRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id as string;

      await ctx.prisma.notifications.updateMany({
        where: { user_id: userId, read: false },
        data: { read: true, read_at: new Date() },
      });

      return { success: true };
    }),
});
