import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../init";
import {
  createDebateSchema,
  submitStatementSchema,
  debateListSchema,
  debateCommentSchema,
} from "@/lib/validators/debate";

function generateSlug(topic: string): string {
  return (
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) +
    "-" +
    crypto.randomUUID().slice(0, 8)
  );
}

const debateSelect = {
  id: true,
  topic: true,
  description: true,
  category: true,
  challenger_id: true,
  opponent_id: true,
  challenger_position: true,
  opponent_position: true,
  total_rounds: true,
  current_round: true,
  round_duration: true,
  speed_mode: true,
  status: true,
  winner_id: true,
  verdict_reached: true,
  verdict_date: true,
  spectator_count: true,
  view_count: true,
  featured: true,
  allow_copy_paste: true,
  visibility: true,
  slug: true,
  challenge_type: true,
  has_belt_at_stake: true,
  belt_stake_type: true,
  started_at: true,
  ended_at: true,
  created_at: true,
  updated_at: true,
  round_deadline: true,
  appeal_status: true,
  rematch_status: true,
  users_debates_challenger_idTousers: {
    select: {
      id: true,
      username: true,
      avatar_url: true,
      elo_rating: true,
    },
  },
  users_debates_opponent_idTousers: {
    select: {
      id: true,
      username: true,
      avatar_url: true,
      elo_rating: true,
    },
  },
  _count: {
    select: {
      debate_likes: true,
      debate_comments: true,
      debate_saves: true,
      statements: true,
    },
  },
} as const;

export const debateRouter = createTRPCRouter({
  // List debates with filtering/pagination
  list: publicProcedure
    .input(debateListSchema)
    .query(async ({ ctx, input }) => {
      const { cursor, limit, status, category, visibility, search, userId, sortBy } = input;

      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      if (category) where.category = category;
      if (visibility) where.visibility = visibility;
      if (userId) {
        where.OR = [
          { challenger_id: userId },
          { opponent_id: userId },
        ];
      }
      if (search) {
        where.topic = { contains: search, mode: "insensitive" };
      }
      if (cursor) {
        where.id = { lt: cursor };
      }

      const orderBy =
        sortBy === "oldest"
          ? { created_at: "asc" as const }
          : sortBy === "popular"
            ? { view_count: "desc" as const }
            : sortBy === "trending"
              ? { spectator_count: "desc" as const }
              : { created_at: "desc" as const };

      const debates = await ctx.prisma.debates.findMany({
        where,
        select: debateSelect,
        orderBy,
        take: limit + 1,
      });

      let nextCursor: string | undefined;
      if (debates.length > limit) {
        const next = debates.pop();
        nextCursor = next?.id;
      }

      const mapped = debates.map((d) => ({
        ...d,
        challenger: d.users_debates_challenger_idTousers,
        opponent: d.users_debates_opponent_idTousers,
      }));

      return { debates: mapped, nextCursor };
    }),

  // List debate categories
  categories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.categories.findMany({
      where: { is_active: true },
      select: { id: true, name: true, label: true },
      orderBy: { sort_order: "asc" },
    });
    return categories;
  }),

  // Get single debate by ID or slug
  get: publicProcedure
    .input(z.object({ id: z.string().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.slug) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide id or slug" });
      }

      const where = input.slug ? { slug: input.slug } : { id: input.id };

      const debate = await ctx.prisma.debates.findUnique({
        where,
        select: {
          ...debateSelect,
          statements: {
            select: {
              id: true,
              debate_id: true,
              author_id: true,
              round: true,
              content: true,
              flagged: true,
              created_at: true,
              users: {
                select: { id: true, username: true, avatar_url: true },
              },
            },
            orderBy: [{ round: "asc" }, { created_at: "asc" }],
          },
          verdicts: {
            select: {
              id: true,
              judge_id: true,
              winner_id: true,
              decision: true,
              reasoning: true,
              challenger_score: true,
              opponent_score: true,
              created_at: true,
              judges: {
                select: { id: true, name: true, personality: true, emoji: true },
              },
            },
          },
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
      }

      // Increment view count
      await ctx.prisma.debates.update({
        where: { id: debate.id },
        data: { view_count: { increment: 1 } },
      });

      return debate;
    }),

  // Create a new debate
  create: protectedProcedure
    .input(createDebateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const opponentPosition = input.challengerPosition === "FOR" ? "AGAINST" : "FOR";
      const slug = generateSlug(input.topic);
      const shareToken = crypto.randomUUID();

      const debate = await ctx.prisma.debates.create({
        data: {
          id: crypto.randomUUID(),
          topic: input.topic,
          description: input.description,
          category: input.category,
          challenger_id: userId,
          opponent_id: input.opponentId || null,
          challenger_position: input.challengerPosition,
          opponent_position: opponentPosition,
          total_rounds: input.totalRounds,
          round_duration: input.roundDuration,
          speed_mode: input.speedMode,
          visibility: input.visibility,
          allow_copy_paste: input.allowCopyPaste,
          challenge_type: input.challengeType,
          slug,
          share_token: shareToken,
          status: input.opponentId ? "WAITING" : "WAITING",
          has_belt_at_stake: !!input.beltStakeType,
          belt_stake_type: input.beltStakeType,
          updated_at: new Date(),
        },
        select: debateSelect,
      });

      return debate;
    }),

  // Accept a debate challenge
  accept: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const debate = await ctx.prisma.debates.findUnique({
        where: { id: input.debateId },
        select: { id: true, status: true, challenger_id: true, opponent_id: true, challenge_type: true },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
      }
      if (debate.status !== "WAITING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not waiting for an opponent" });
      }
      if (debate.challenger_id === userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot accept your own debate" });
      }
      if (debate.opponent_id && debate.opponent_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This debate is not for you" });
      }

      const updated = await ctx.prisma.debates.update({
        where: { id: input.debateId },
        data: {
          opponent_id: userId,
          status: "ACTIVE",
          started_at: new Date(),
          round_deadline: new Date(Date.now() + 86400000),
          updated_at: new Date(),
        },
        select: debateSelect,
      });

      return updated;
    }),

  // Decline a debate challenge
  decline: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const debate = await ctx.prisma.debates.findUnique({
        where: { id: input.debateId },
        select: { id: true, status: true, opponent_id: true },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (debate.status !== "WAITING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not waiting" });
      }
      if (debate.opponent_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updated = await ctx.prisma.debates.update({
        where: { id: input.debateId },
        data: {
          status: "CANCELLED",
          opponent_id: null,
          updated_at: new Date(),
        },
        select: { id: true, status: true },
      });

      return updated;
    }),

  // Delete (cancel) a debate
  delete: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const debate = await ctx.prisma.debates.findUnique({
        where: { id: input.debateId },
        select: { id: true, challenger_id: true, status: true },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (debate.challenger_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator can delete" });
      }
      if (debate.status !== "WAITING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only delete waiting debates" });
      }

      await ctx.prisma.debates.update({
        where: { id: input.debateId },
        data: { status: "CANCELLED", updated_at: new Date() },
      });

      return { success: true };
    }),

  // Submit a statement for a debate round
  submitStatement: protectedProcedure
    .input(submitStatementSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const debate = await ctx.prisma.debates.findUnique({
        where: { id: input.debateId },
        select: {
          id: true,
          status: true,
          challenger_id: true,
          opponent_id: true,
          current_round: true,
          total_rounds: true,
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (debate.status !== "ACTIVE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" });
      }
      if (debate.challenger_id !== userId && debate.opponent_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant" });
      }
      if (input.round !== debate.current_round) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Wrong round number" });
      }

      // Check if user already submitted for this round
      const existing = await ctx.prisma.statements.findUnique({
        where: {
          debate_id_author_id_round: {
            debate_id: input.debateId,
            author_id: userId,
            round: input.round,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already submitted for this round" });
      }

      const statement = await ctx.prisma.statements.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          author_id: userId,
          round: input.round,
          content: input.content,
          updated_at: new Date(),
        },
      });

      // Check if both participants have submitted for this round
      const roundStatements = await ctx.prisma.statements.count({
        where: { debate_id: input.debateId, round: input.round },
      });

      if (roundStatements >= 2) {
        // Both submitted — advance round or complete debate
        if (debate.current_round >= debate.total_rounds) {
          await ctx.prisma.debates.update({
            where: { id: input.debateId },
            data: {
              status: "COMPLETED",
              ended_at: new Date(),
              updated_at: new Date(),
            },
          });
        } else {
          await ctx.prisma.debates.update({
            where: { id: input.debateId },
            data: {
              current_round: { increment: 1 },
              round_deadline: new Date(Date.now() + debate.total_rounds * 86400000 / debate.total_rounds),
              updated_at: new Date(),
            },
          });
        }
      }

      return statement;
    }),

  // Like a debate
  like: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const existing = await ctx.prisma.debate_likes.findUnique({
        where: { debate_id_user_id: { debate_id: input.debateId, user_id: userId } },
      });

      if (existing) {
        // Unlike
        await ctx.prisma.debate_likes.delete({ where: { id: existing.id } });
        return { liked: false };
      }

      await ctx.prisma.debate_likes.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          user_id: userId,
        },
      });

      return { liked: true };
    }),

  // Save a debate
  save: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const existing = await ctx.prisma.debate_saves.findUnique({
        where: { debate_id_user_id: { debate_id: input.debateId, user_id: userId } },
      });

      if (existing) {
        await ctx.prisma.debate_saves.delete({ where: { id: existing.id } });
        return { saved: false };
      }

      await ctx.prisma.debate_saves.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          user_id: userId,
        },
      });

      return { saved: true };
    }),

  // Share a debate
  share: protectedProcedure
    .input(z.object({ debateId: z.string(), method: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      await ctx.prisma.debate_shares.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          user_id: userId,
          method: input.method,
        },
      });

      return { shared: true };
    }),

  // Add a comment
  addComment: protectedProcedure
    .input(debateCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      if (input.parentId) {
        const parent = await ctx.prisma.debate_comments.findUnique({
          where: { id: input.parentId },
        });
        if (!parent || parent.debate_id !== input.debateId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid parent comment" });
        }
      }

      const comment = await ctx.prisma.debate_comments.create({
        data: {
          id: crypto.randomUUID(),
          debate_id: input.debateId,
          user_id: userId,
          content: input.content,
          parent_id: input.parentId,
          updated_at: new Date(),
        },
        select: {
          id: true,
          content: true,
          parent_id: true,
          created_at: true,
          users: {
            select: { id: true, username: true, avatar_url: true },
          },
        },
      });

      return comment;
    }),

  // Get comments for a debate
  getComments: publicProcedure
    .input(z.object({
      debateId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(100).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const comments = await ctx.prisma.debate_comments.findMany({
        where: {
          debate_id: input.debateId,
          deleted: false,
          parent_id: null, // Top-level comments only
        },
        select: {
          id: true,
          content: true,
          parent_id: true,
          created_at: true,
          users: {
            select: { id: true, username: true, avatar_url: true },
          },
          other_debate_comments: {
            where: { deleted: false },
            select: {
              id: true,
              content: true,
              parent_id: true,
              created_at: true,
              users: {
                select: { id: true, username: true, avatar_url: true },
              },
            },
            orderBy: { created_at: "asc" },
            take: 5,
          },
          _count: { select: { other_debate_comments: true } },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (comments.length > input.limit) {
        const next = comments.pop();
        nextCursor = next?.id;
      }

      return { comments, nextCursor };
    }),

  // Get user's interaction status (liked, saved) for a debate
  interactionStatus: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const [liked, saved] = await Promise.all([
        ctx.prisma.debate_likes.findUnique({
          where: { debate_id_user_id: { debate_id: input.debateId, user_id: userId } },
        }),
        ctx.prisma.debate_saves.findUnique({
          where: { debate_id_user_id: { debate_id: input.debateId, user_id: userId } },
        }),
      ]);

      return { liked: !!liked, saved: !!saved };
    }),

  // Get user's debates (my challenges)
  myDebates: protectedProcedure
    .input(z.object({
      status: z.enum(["WAITING", "ACTIVE", "COMPLETED", "VERDICT_READY", "APPEALED", "CANCELLED"]).optional(),
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const where: Record<string, unknown> = {
        OR: [{ challenger_id: userId }, { opponent_id: userId }],
      };
      if (input.status) where.status = input.status;

      const debates = await ctx.prisma.debates.findMany({
        where,
        select: debateSelect,
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (debates.length > input.limit) {
        const next = debates.pop();
        nextCursor = next?.id;
      }

      return { debates, nextCursor };
    }),

  // Get saved debates
  savedDebates: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const saves = await ctx.prisma.debate_saves.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          created_at: true,
          debates: { select: debateSelect },
        },
        orderBy: { created_at: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (saves.length > input.limit) {
        const next = saves.pop();
        nextCursor = next?.id;
      }

      return {
        debates: saves.map((s) => s.debates),
        nextCursor,
      };
    }),
});
