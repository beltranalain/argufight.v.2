import { z } from "zod";

export const userSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export type UserSearchInput = z.infer<typeof userSearchSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
