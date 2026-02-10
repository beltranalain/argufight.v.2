"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { channels } from "@/server/realtime/channels";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface UseRealtimeMessagesOptions {
  conversationId?: string;
  enabled?: boolean;
  onNewMessage?: (message: DirectMessage) => void;
}

export function useRealtimeMessages({
  conversationId,
  enabled = true,
  onNewMessage,
}: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onNewRef = useRef(onNewMessage);
  onNewRef.current = onNewMessage;

  useEffect(() => {
    const sb = getSupabase();
    if (!enabled || !conversationId || !sb) return;

    const channel = sb
      .channel(channels.conversation(conversationId))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as DirectMessage;
          setMessages((prev) => [...prev, msg]);
          onNewRef.current?.(msg);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as DirectMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, enabled]);

  const setInitialMessages = useCallback((msgs: DirectMessage[]) => {
    setMessages(msgs);
  }, []);

  return { messages, setInitialMessages };
}
