import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { TopNav } from "@/components/layout/top-nav";
import { PushManager } from "@/components/notifications/push-manager";
import { NotificationTicker } from "@/components/notifications/notification-ticker";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentPanel="THE ARENA" />
      <main className="pt-16 overflow-auto">{children}</main>
      <PushManager />
      <NotificationTicker />
    </div>
  );
}
