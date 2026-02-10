import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../init";

export const chatRouter = createTRPCRouter({
  // Get chat messages for a debate
  getMessages: protectedProcedure
    .input(z.object({
      debateId: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.chat_messages.findMany({
        where: {
          debate_id: input.debateId,
          deleted: false,
        },
        select: {
          id: true,
          debate_id: true,
          author_id: true,
          content: true,
          deleted: true,
          created_at: true,
          users: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (messages.length > input.limit) {
        const next = messages.pop();
        nextCursor = next?.id;
      }

      // Return in chronological order
      return { messages: messages.reverse(), nextCursor };
    }),

  // Send a chat message
  send: protectedProcedure
    .input(z.object({
      debateId: z.string(),
      content: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const message = await ctx.prisma.chat_messages.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          author_id: userId,
          content: input.content,
        },
        select: {
          id: true,
          debate_id: true,
          author_id: true,
          content: true,
          created_at: true,
          users: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      });

      return message;
    }),

  // Delete a chat message
  delete: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const message = await ctx.prisma.chat_messages.findUnique({
        where: { id: input.messageId },
        select: { author_id: true },
      });

      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (message.author_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.prisma.chat_messages.update({
        where: { id: input.messageId },
        data: { deleted: true, deleted_at: new Date(), deleted_by: userId },
      });

      return { success: true };
    }),
});
