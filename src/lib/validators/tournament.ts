import { z } from "zod";

export const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  maxParticipants: z.number().int().min(4).max(64),
  totalRounds: z.number().int().min(1).max(6),
  roundDuration: z.number().int().min(300).max(86400), // 5min to 24h in seconds
  startDate: z.string().datetime(),
  format: z.enum(["BRACKET", "CHAMPIONSHIP", "KING_OF_THE_HILL"]),
  reseedMethod: z.enum(["ELO_BASED", "TOURNAMENT_WINS", "RANDOM"]),
  reseedAfterRound: z.boolean().optional(),
  minElo: z.number().int().min(0).optional(),
  isPrivate: z.boolean().optional(),
  entryFee: z.number().int().min(0).optional(),
  prizePool: z.number().int().min(0).optional(),
  prizeDistribution: z.string().optional(), // JSON string
});

export const tournamentListSchema = z.object({
  status: z
    .enum(["UPCOMING", "REGISTRATION_OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  format: z.enum(["BRACKET", "CHAMPIONSHIP", "KING_OF_THE_HILL"]).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const registerTournamentSchema = z.object({
  tournamentId: z.string(),
  selectedPosition: z.string().optional(),
});
