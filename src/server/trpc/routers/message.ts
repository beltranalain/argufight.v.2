import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  createTRPCRouter,
  protectedProcedure,
} from "../init";

export const messageRouter = createTRPCRouter({
  // Get conversations list
  conversations: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const conversations = await ctx.prisma.conversations.findMany({
        where: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
        select: {
          id: true,
          user1_id: true,
          user2_id: true,
          last_message_at: true,
          user1_last_read_at: true,
          user2_last_read_at: true,
          users_conversations_user1_idTousers: {
            select: { id: true, username: true, avatar_url: true },
          },
          users_conversations_user2_idTousers: {
            select: { id: true, username: true, avatar_url: true },
          },
          direct_messages: {
            take: 1,
            orderBy: { created_at: "desc" },
            select: {
              id: true,
              content: true,
              sender_id: true,
              is_read: true,
              created_at: true,
            },
          },
        },
        orderBy: { last_message_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (conversations.length > input.limit) {
        const next = conversations.pop();
        nextCursor = next?.id;
      }

      // Map to simpler structure
      const mapped = conversations.map((c) => {
        const otherUser =
          c.user1_id === userId
            ? c.users_conversations_user2_idTousers
            : c.users_conversations_user1_idTousers;
        const lastReadAt =
          c.user1_id === userId ? c.user1_last_read_at : c.user2_last_read_at;
        const lastMessage = c.direct_messages[0] ?? null;
        const hasUnread =
          lastMessage &&
          lastMessage.sender_id !== userId &&
          !lastMessage.is_read;

        return {
          id: c.id,
          otherUser,
          lastMessage,
          lastMessageAt: c.last_message_at,
          hasUnread: !!hasUnread,
        };
      });

      return { conversations: mapped, nextCursor };
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      // Verify user is part of conversation
      const conversation = await ctx.prisma.conversations.findUnique({
        where: { id: input.conversationId },
        select: { user1_id: true, user2_id: true },
      });

      if (!conversation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const messages = await ctx.prisma.direct_messages.findMany({
        where: {
          conversation_id: input.conversationId,
          ...(conversation.user1_id === userId
            ? { deleted_by_sender: false }
            : { deleted_by_receiver: false }),
        },
        select: {
          id: true,
          conversation_id: true,
          sender_id: true,
          receiver_id: true,
          content: true,
          is_read: true,
          created_at: true,
          users_direct_messages_sender_idTousers: {
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

      return { messages: messages.reverse(), nextCursor };
    }),

  // Send a direct message
  send: protectedProcedure
    .input(z.object({
      receiverId: z.string(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      if (input.receiverId === userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot message yourself" });
      }

      // Find or create conversation
      const [id1, id2] = [userId, input.receiverId].sort();
      let conversation = await ctx.prisma.conversations.findUnique({
        where: { user1_id_user2_id: { user1_id: id1, user2_id: id2 } },
      });

      if (!conversation) {
        conversation = await ctx.prisma.conversations.create({
          data: {
            id: crypto.randomUUID(),
            user1_id: id1,
            user2_id: id2,
            updated_at: new Date(),
          },
        });
      }

      const message = await ctx.prisma.direct_messages.create({
        data: {
          id: crypto.randomUUID(),
          conversation_id: conversation.id,
          sender_id: userId,
          receiver_id: input.receiverId,
          content: input.content,
        },
        select: {
          id: true,
          conversation_id: true,
          sender_id: true,
          receiver_id: true,
          content: true,
          is_read: true,
          created_at: true,
        },
      });

      // Update conversation last_message
      await ctx.prisma.conversations.update({
        where: { id: conversation.id },
        data: {
          last_message_id: message.id,
          last_message_at: new Date(),
          updated_at: new Date(),
        },
      });

      return message;
    }),

  // Mark messages as read
  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      await ctx.prisma.direct_messages.updateMany({
        where: {
          conversation_id: input.conversationId,
          receiver_id: userId,
          is_read: false,
        },
        data: { is_read: true, read_at: new Date() },
      });

      // Update conversation last_read
      const conversation = await ctx.prisma.conversations.findUnique({
        where: { id: input.conversationId },
        select: { user1_id: true },
      });

      if (conversation) {
        const field =
          conversation.user1_id === userId
            ? "user1_last_read_at"
            : "user2_last_read_at";
        await ctx.prisma.conversations.update({
          where: { id: input.conversationId },
          data: { [field]: new Date(), updated_at: new Date() },
        });
      }

      return { success: true };
    }),

  // Get unread message count
  unreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id as string;

      const count = await ctx.prisma.direct_messages.count({
        where: { receiver_id: userId, is_read: false },
      });

      return { count };
    }),
});
