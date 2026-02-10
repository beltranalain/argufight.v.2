import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
