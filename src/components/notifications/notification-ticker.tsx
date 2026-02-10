"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { X } from "lucide-react";

export function NotificationTicker() {
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const { notifications } = useRealtimeNotifications({
    userId,
    enabled: !!userId,
    onNewNotification: (n) => {
      setCurrentNotification({ title: n.title, message: n.message });
      setVisible(true);
    },
  });

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [visible, currentNotification]);

  if (!visible || !currentNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-right-5">
      <div className="rounded-lg border border-electric-blue/30 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{currentNotification.title}</p>
            <p className="text-xs text-muted-foreground">
              {currentNotification.message}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
