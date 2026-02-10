import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";
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
      <TopNav />
      <div className="flex pt-14">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            {children}
          </div>
        </main>
      </div>
      <PushManager />
      <NotificationTicker />
    </div>
  );
}
