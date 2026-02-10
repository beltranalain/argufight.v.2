"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc-client";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { NotificationList } from "./notification-list";
import { toast } from "sonner";

export function NotificationBell() {
  const { data: session } = useSession();
  const userId = session?.user?.id as string | undefined;
  const [open, setOpen] = useState(false);

  // Initial unread count
  const { data: countData } = trpc.notification.unreadCount.useQuery(
    undefined,
    { enabled: !!userId }
  );

  // Initial notifications
  const { data: listData } = trpc.notification.list.useQuery(
    { limit: 20 },
    { enabled: !!userId }
  );

  // Real-time updates
  const {
    notifications: realtimeNotifications,
    unreadCount: realtimeUnread,
    setInitialNotifications,
    markAsRead,
    markAllRead: markAllReadLocal,
  } = useRealtimeNotifications({
    userId,
    enabled: !!userId,
    onNewNotification: (n) => {
      toast(n.title, { description: n.message });
    },
  });

  // Sync initial data
  useEffect(() => {
    if (listData && countData) {
      setInitialNotifications(
        listData.notifications as never[],
        countData.count
      );
    }
  }, [listData, countData, setInitialNotifications]);

  const utils = trpc.useUtils();

  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.unreadCount.invalidate(),
  });

  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      markAllReadLocal();
      utils.notification.unreadCount.invalidate();
    },
  });

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    markReadMutation.mutate({ notificationId: id });
  };

  const handleMarkAllRead = () => {
    markAllReadLocal();
    markAllReadMutation.mutate();
  };

  const displayCount = realtimeUnread;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hot-pink px-1 text-[10px] font-bold text-white">
              {displayCount > 99 ? "99+" : displayCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <NotificationList
          notifications={realtimeNotifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
