import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import {
  createTournamentSchema,
  tournamentListSchema,
  registerTournamentSchema,
} from "@/lib/validators/tournament";

const tournamentSelect = {
  id: true,
  name: true,
  description: true,
  creator_id: true,
  max_participants: true,
  current_round: true,
  total_rounds: true,
  status: true,
  min_elo: true,
  start_date: true,
  end_date: true,
  round_duration: true,
  format: true,
  reseed_method: true,
  reseed_after_round: true,
  is_private: true,
  entry_fee: true,
  prize_pool: true,
  prize_distribution: true,
  winner_id: true,
  created_at: true,
  updated_at: true,
  users_tournaments_creator_idTousers: {
    select: { id: true, username: true, avatar_url: true, elo_rating: true },
  },
  users_tournaments_winner_idTousers: {
    select: { id: true, username: true, avatar_url: true },
  },
  _count: {
    select: { tournament_participants: true, tournament_matches: true },
  },
} as const;

export const tournamentRouter = createTRPCRouter({
  list: publicProcedure.input(tournamentListSchema).query(async ({ ctx, input }) => {
    const { status, format, cursor, limit } = input;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (format) where.format = format;

    const items = await ctx.prisma.tournaments.findMany({
      where,
      select: tournamentSelect,
      orderBy: { start_date: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      const next = items.pop();
      nextCursor = next?.id;
    }

    return { items, nextCursor };
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournaments.findUnique({
        where: { id: input.id },
        select: {
          ...tournamentSelect,
          tournament_participants: {
            select: {
              id: true,
              user_id: true,
              seed: true,
              current_seed: true,
              wins: true,
              losses: true,
              elo_at_start: true,
              status: true,
              selected_position: true,
              cumulative_score: true,
              elimination_round: true,
              registered_at: true,
              users: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                  elo_rating: true,
                },
              },
            },
            orderBy: { seed: "asc" },
          },
          tournament_rounds: {
            select: {
              id: true,
              round_number: true,
              status: true,
              start_date: true,
              end_date: true,
              tournament_matches: {
                select: {
                  id: true,
                  participant1_id: true,
                  participant2_id: true,
                  debate_id: true,
                  winner_id: true,
                  status: true,
                  scheduled_at: true,
                  completed_at: true,
                  participant1_score: true,
                  participant2_score: true,
                  tournament_participants_tournament_matches_participant1_idTotournament_participants:
                    {
                      select: {
                        users: {
                          select: { id: true, username: true, avatar_url: true },
                        },
                      },
                    },
                  tournament_participants_tournament_matches_participant2_idTotournament_participants:
                    {
                      select: {
                        users: {
                          select: { id: true, username: true, avatar_url: true },
                        },
                      },
                    },
                },
                orderBy: { scheduled_at: "asc" },
              },
            },
            orderBy: { round_number: "asc" },
          },
        },
      });

      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }

      return tournament;
    }),

  create: protectedProcedure
    .input(createTournamentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Calculate total rounds based on participants if bracket format
      const totalRounds =
        input.format === "BRACKET"
          ? Math.ceil(Math.log2(input.maxParticipants))
          : input.totalRounds;

      const tournament = await ctx.prisma.tournaments.create({
        data: {
          id: crypto.randomUUID(),
          name: input.name,
          description: input.description,
          creator_id: userId,
          max_participants: input.maxParticipants,
          total_rounds: totalRounds,
          round_duration: input.roundDuration,
          start_date: new Date(input.startDate),
          format: input.format,
          reseed_method: input.reseedMethod,
          reseed_after_round: input.reseedAfterRound ?? true,
          min_elo: input.minElo,
          is_private: input.isPrivate ?? false,
          entry_fee: input.entryFee ?? 0,
          prize_pool: input.prizePool ?? 0,
          prize_distribution: input.prizeDistribution,
          status: "REGISTRATION_OPEN",
          updated_at: new Date(),
        },
      });

      // Auto-create rounds
      const roundPromises = [];
      for (let i = 1; i <= totalRounds; i++) {
        roundPromises.push(
          ctx.prisma.tournament_rounds.create({
            data: {
              id: crypto.randomUUID(),
              tournament_id: tournament.id,
              round_number: i,
              status: "UPCOMING",
            },
          })
        );
      }
      await Promise.all(roundPromises);

      // Creator auto-registers
      await ctx.prisma.tournament_participants.create({
        data: {
          id: crypto.randomUUID(),
          tournament_id: tournament.id,
          user_id: userId,
          seed: 1,
          elo_at_start:
            (
              await ctx.prisma.users.findUnique({
                where: { id: userId },
                select: { elo_rating: true },
              })
            )?.elo_rating ?? 1200,
          status: "REGISTERED",
          registered_at: new Date(),
        },
      });

      return tournament;
    }),

  register: protectedProcedure
    .input(registerTournamentSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const tournament = await ctx.prisma.tournaments.findUnique({
        where: { id: input.tournamentId },
        select: {
          id: true,
          status: true,
          max_participants: true,
          min_elo: true,
          entry_fee: true,
          _count: { select: { tournament_participants: true } },
        },
      });

      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (tournament.status !== "REGISTRATION_OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Registration is not open",
        });
      }

      if (tournament._count.tournament_participants >= tournament.max_participants) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tournament is full",
        });
      }

      const user = await ctx.prisma.users.findUnique({
        where: { id: userId },
        select: { elo_rating: true, coins: true },
      });

      if (tournament.min_elo && (user?.elo_rating ?? 1200) < tournament.min_elo) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum ELO of ${tournament.min_elo} required`,
        });
      }

      // Check entry fee
      if (tournament.entry_fee && tournament.entry_fee > 0) {
        if ((user?.coins ?? 0) < tournament.entry_fee) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient coins for entry fee",
          });
        }

        // Deduct entry fee
        await ctx.prisma.users.update({
          where: { id: userId },
          data: { coins: { decrement: tournament.entry_fee } },
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
            amount: -tournament.entry_fee,
            balance_after: updatedUser?.coins ?? 0,
            tournament_id: tournament.id,
            description: `Tournament entry fee: ${tournament.entry_fee} coins`,
            status: "COMPLETED",
            updated_at: new Date(),
          },
        });
      }

      const participant = await ctx.prisma.tournament_participants.create({
        data: {
          id: crypto.randomUUID(),
          tournament_id: input.tournamentId,
          user_id: userId,
          seed: tournament._count.tournament_participants + 1,
          elo_at_start: user?.elo_rating ?? 1200,
          status: "REGISTERED",
          selected_position: input.selectedPosition,
          registered_at: new Date(),
        },
      });

      return participant;
    }),

  unregister: protectedProcedure
    .input(z.object({ tournamentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const participant = await ctx.prisma.tournament_participants.findUnique({
        where: {
          tournament_id_user_id: {
            tournament_id: input.tournamentId,
            user_id: userId,
          },
        },
        include: { tournaments: { select: { status: true, entry_fee: true } } },
      });

      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (participant.tournaments.status !== "REGISTRATION_OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot unregister after registration closes",
        });
      }

      await ctx.prisma.tournament_participants.delete({
        where: { id: participant.id },
      });

      // Refund entry fee
      if (participant.tournaments.entry_fee && participant.tournaments.entry_fee > 0) {
        await ctx.prisma.users.update({
          where: { id: userId },
          data: { coins: { increment: participant.tournaments.entry_fee } },
        });

        const updatedUser = await ctx.prisma.users.findUnique({
          where: { id: userId },
          select: { coins: true },
        });

        await ctx.prisma.coin_transactions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: userId,
            type: "REFUND",
            amount: participant.tournaments.entry_fee,
            balance_after: updatedUser?.coins ?? 0,
            tournament_id: input.tournamentId,
            description: "Tournament entry fee refund",
            status: "COMPLETED",
            updated_at: new Date(),
          },
        });
      }

      return { success: true };
    }),

  myTournaments: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const participations = await ctx.prisma.tournament_participants.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        seed: true,
        wins: true,
        losses: true,
        status: true,
        tournaments: { select: tournamentSelect },
      },
      orderBy: { registered_at: "desc" },
    });

    return participations;
  }),

  isRegistered: protectedProcedure
    .input(z.object({ tournamentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const participant = await ctx.prisma.tournament_participants.findUnique({
        where: {
          tournament_id_user_id: {
            tournament_id: input.tournamentId,
            user_id: ctx.session.user.id,
          },
        },
        select: { id: true, status: true },
      });
      return participant;
    }),
});
