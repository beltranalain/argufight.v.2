"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Swords,
  Trophy,
  MessageSquare,
  Bell,
  Shield,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import type { Notification } from "@/hooks/use-realtime-notifications";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  DEBATE_TURN: <Swords className="h-4 w-4 text-electric-blue" />,
  DEBATE_ACCEPTED: <Swords className="h-4 w-4 text-cyber-green" />,
  VERDICT_READY: <Trophy className="h-4 w-4 text-yellow-400" />,
  DEBATE_WON: <Trophy className="h-4 w-4 text-cyber-green" />,
  DEBATE_LOST: <Trophy className="h-4 w-4 text-destructive" />,
  DEBATE_TIED: <Trophy className="h-4 w-4 text-muted-foreground" />,
  NEW_CHALLENGE: <Swords className="h-4 w-4 text-neon-orange" />,
  NEW_MESSAGE: <MessageSquare className="h-4 w-4 text-electric-blue" />,
  BELT_CHALLENGE: <Shield className="h-4 w-4 text-yellow-400" />,
  BELT_TRANSFER: <Shield className="h-4 w-4 text-cyber-green" />,
};

export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationListProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={onMarkAllRead}
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Mark all read
          </Button>
        )}
      </div>
      <Separator />

      <ScrollArea className="max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No notifications
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.read ? "bg-electric-blue/5" : ""
                }`}
                onClick={() => {
                  if (!notification.read) onMarkRead(notification.id);
                  onClose();
                }}
              >
                <div className="mt-0.5 shrink-0">
                  {typeIcons[notification.type] ?? (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-electric-blue" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
