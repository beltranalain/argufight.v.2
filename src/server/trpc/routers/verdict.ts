import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../init";

export const verdictRouter = createTRPCRouter({
  // Get verdicts for a debate
  get: publicProcedure
    .input(z.object({ debateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const verdicts = await ctx.prisma.verdicts.findMany({
        where: { debate_id: input.debateId },
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
            select: {
              id: true,
              name: true,
              personality: true,
              emoji: true,
              description: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
      });

      if (verdicts.length === 0) {
        return { verdicts: [], summary: null };
      }

      // Calculate summary
      const challengerWins = verdicts.filter((v) => v.decision === "CHALLENGER_WINS").length;
      const opponentWins = verdicts.filter((v) => v.decision === "OPPONENT_WINS").length;
      const ties = verdicts.filter((v) => v.decision === "TIE").length;

      const avgChallengerScore =
        verdicts.reduce((sum, v) => sum + (v.challenger_score ?? 0), 0) / verdicts.length;
      const avgOpponentScore =
        verdicts.reduce((sum, v) => sum + (v.opponent_score ?? 0), 0) / verdicts.length;

      let overallDecision: string;
      if (challengerWins > opponentWins) overallDecision = "CHALLENGER_WINS";
      else if (opponentWins > challengerWins) overallDecision = "OPPONENT_WINS";
      else overallDecision = "TIE";

      return {
        verdicts,
        summary: {
          challengerWins,
          opponentWins,
          ties,
          totalJudges: verdicts.length,
          avgChallengerScore: Math.round(avgChallengerScore * 10) / 10,
          avgOpponentScore: Math.round(avgOpponentScore * 10) / 10,
          overallDecision,
        },
      };
    }),

  // Request verdict generation (triggers AI judging)
  requestGeneration: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      const debate = await ctx.prisma.debates.findUnique({
        where: { id: input.debateId },
        select: {
          id: true,
          status: true,
          challenger_id: true,
          opponent_id: true,
          verdict_reached: true,
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (debate.status !== "COMPLETED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate must be completed first" });
      }
      if (debate.verdict_reached) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Verdict already generated" });
      }
      if (debate.challenger_id !== userId && debate.opponent_id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Mark as VERDICT_READY (actual AI generation handled by Inngest)
      await ctx.prisma.debates.update({
        where: { id: input.debateId },
        data: {
          status: "VERDICT_READY",
          updated_at: new Date(),
        },
      });

      // TODO: Trigger Inngest event for verdict generation
      // await inngest.send({ name: "debate/verdict.requested", data: { debateId: input.debateId } });

      return { queued: true };
    }),
});
