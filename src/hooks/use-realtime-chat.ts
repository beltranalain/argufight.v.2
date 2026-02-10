"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { channels } from "@/server/realtime/channels";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  debate_id: string;
  author_id: string;
  content: string;
  deleted: boolean;
  created_at: string;
  users?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface TypingUser {
  userId: string;
  username: string;
}

interface UseRealtimeChatOptions {
  debateId: string;
  userId?: string;
  username?: string;
  enabled?: boolean;
}

export function useRealtimeChat({
  debateId,
  userId,
  username,
  enabled = true,
}: UseRealtimeChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!enabled || !debateId || !sb) return;

    // Subscribe to new chat messages via postgres_changes
    const chatChannel = sb
      .channel(channels.debateChat(debateId))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `debate_id=eq.${debateId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `debate_id=eq.${debateId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    channelRef.current = chatChannel;

    // Presence for typing indicators
    if (userId && username) {
      const presenceChannel = sb
        .channel(channels.debatePresence(debateId))
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          const typing: TypingUser[] = [];
          for (const [, presences] of Object.entries(state)) {
            for (const p of presences as { userId?: string; username?: string; isTyping?: boolean }[]) {
              if (p.isTyping && p.userId !== userId) {
                typing.push({ userId: p.userId!, username: p.username! });
              }
            }
          }
          setTypingUsers(typing);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              userId,
              username,
              isTyping: false,
              online_at: new Date().toISOString(),
            });
          }
        });

      presenceRef.current = presenceChannel;
    }

    return () => {
      chatChannel.unsubscribe();
      presenceRef.current?.unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [debateId, userId, username, enabled]);

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!presenceRef.current || !userId || !username) return;
      await presenceRef.current.track({
        userId,
        username,
        isTyping,
        online_at: new Date().toISOString(),
      });

      if (isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          presenceRef.current?.track({
            userId,
            username,
            isTyping: false,
            online_at: new Date().toISOString(),
          });
        }, 3000);
      }
    },
    [userId, username]
  );

  const setInitialMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  return { messages, typingUsers, sendTyping, setInitialMessages };
}
