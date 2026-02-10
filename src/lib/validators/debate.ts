import { z } from "zod";

export const debateCategoryEnum = z.enum([
  "SPORTS",
  "POLITICS",
  "TECH",
  "ENTERTAINMENT",
  "SCIENCE",
  "MUSIC",
  "OTHER",
]);

export const debatePositionEnum = z.enum(["FOR", "AGAINST"]);

export const debateStatusEnum = z.enum([
  "WAITING",
  "ACTIVE",
  "COMPLETED",
  "VERDICT_READY",
  "APPEALED",
  "CANCELLED",
]);

export const debateVisibilityEnum = z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]);

export const createDebateSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters").max(200),
  description: z.string().max(1000).optional(),
  category: debateCategoryEnum,
  challengerPosition: debatePositionEnum,
  totalRounds: z.number().int().min(1).max(10).default(5),
  roundDuration: z.number().int().min(60000).default(86400000),
  speedMode: z.boolean().default(false),
  visibility: debateVisibilityEnum.default("PUBLIC"),
  allowCopyPaste: z.boolean().default(true),
  opponentId: z.string().optional(),
  challengeType: z.enum(["OPEN", "DIRECT", "GROUP"]).default("OPEN"),
  invitedUserIds: z.array(z.string()).optional(),
  beltStakeType: z.string().optional(),
});

export const submitStatementSchema = z.object({
  debateId: z.string(),
  content: z.string().min(10, "Argument must be at least 10 characters").max(5000),
  round: z.number().int().min(1),
});

export const debateListSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  status: debateStatusEnum.optional(),
  category: debateCategoryEnum.optional(),
  visibility: debateVisibilityEnum.optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "popular", "trending"]).default("newest"),
});

export const debateCommentSchema = z.object({
  debateId: z.string(),
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export type CreateDebateInput = z.infer<typeof createDebateSchema>;
export type SubmitStatementInput = z.infer<typeof submitStatementSchema>;
export type DebateListInput = z.infer<typeof debateListSchema>;
export type DebateCommentInput = z.infer<typeof debateCommentSchema>;
