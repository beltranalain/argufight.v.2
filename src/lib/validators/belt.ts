import { z } from "zod";

export const beltListSchema = z.object({
  type: z
    .enum(["ROOKIE", "CATEGORY", "CHAMPIONSHIP", "UNDEFEATED", "TOURNAMENT"])
    .optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "VACANT", "STAKED", "GRACE_PERIOD", "MANDATORY"])
    .optional(),
  category: z.string().optional(),
});

export const createChallengeSchema = z.object({
  beltId: z.string(),
  topic: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  challengerPosition: z.string().optional(),
  totalRounds: z.number().int().min(1).max(10).default(3),
  roundDuration: z.number().int().min(300).max(3600).optional(),
  speedMode: z.boolean().optional(),
  allowCopyPaste: z.boolean().optional(),
  usesFreeChallenge: z.boolean().optional(),
});

export const respondChallengeSchema = z.object({
  challengeId: z.string(),
  response: z.enum(["ACCEPTED", "DECLINED"]),
});
