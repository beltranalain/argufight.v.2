"use client";

import { useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { channels } from "@/server/realtime/channels";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface DebateUpdate {
  id: string;
  status: string;
  current_round: number;
  winner_id: string | null;
  verdict_reached: boolean;
  round_deadline: string | null;
  spectator_count: number;
}

interface UseRealtimeDebateOptions {
  debateId: string;
  onStatusChange?: (update: DebateUpdate) => void;
  onStatementSubmitted?: () => void;
  enabled?: boolean;
}

export function useRealtimeDebate({
  debateId,
  onStatusChange,
  onStatementSubmitted,
  enabled = true,
}: UseRealtimeDebateOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const onStatementSubmittedRef = useRef(onStatementSubmitted);

  // Keep refs current
  onStatusChangeRef.current = onStatusChange;
  onStatementSubmittedRef.current = onStatementSubmitted;

  useEffect(() => {
    const sb = getSupabase();
    if (!enabled || !debateId || !sb) return;

    const channel = sb
      .channel(channels.debateState(debateId))
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "debates",
          filter: `id=eq.${debateId}`,
        },
        (payload) => {
          const update = payload.new as DebateUpdate;
          onStatusChangeRef.current?.(update);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "statements",
          filter: `debate_id=eq.${debateId}`,
        },
        () => {
          onStatementSubmittedRef.current?.();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [debateId, enabled]);

  const unsubscribe = useCallback(() => {
    channelRef.current?.unsubscribe();
  }, []);

  return { unsubscribe };
}
