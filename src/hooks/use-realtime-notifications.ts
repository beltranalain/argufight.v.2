"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase-client";
import { channels } from "@/server/realtime/channels";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  debate_id: string | null;
  read: boolean;
  created_at: string;
}

interface UseRealtimeNotificationsOptions {
  userId?: string;
  enabled?: boolean;
  onNewNotification?: (notification: Notification) => void;
}

export function useRealtimeNotifications({
  userId,
  enabled = true,
  onNewNotification,
}: UseRealtimeNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onNewRef = useRef(onNewNotification);
  onNewRef.current = onNewNotification;

  useEffect(() => {
    const sb = getSupabase();
    if (!enabled || !userId || !sb) return;

    const channel = sb
      .channel(channels.userNotifications(userId))
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          onNewRef.current?.(notification);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recalculate unread
          setNotifications((prev) => {
            setUnreadCount(prev.filter((n) => !n.read).length);
            return prev;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [userId, enabled]);

  const setInitialNotifications = useCallback(
    (notifs: Notification[], unread: number) => {
      setNotifications(notifs);
      setUnreadCount(unread);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    setInitialNotifications,
    markAsRead,
    markAllRead,
  };
}
