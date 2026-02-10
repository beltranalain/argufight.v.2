// Channel name conventions — the actual Supabase client comes from lib/supabase-client.ts
export const channels = {
  debateChat: (debateId: string) => `debate:${debateId}:chat`,
  debateState: (debateId: string) => `debate:${debateId}:state`,
  debatePresence: (debateId: string) => `debate:${debateId}:presence`,
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  conversation: (conversationId: string) => `dm:${conversationId}`,
} as const;
