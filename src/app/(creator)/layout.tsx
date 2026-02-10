import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { CreatorNav } from "@/components/layout/creator-nav";

export default async function CreatorLayout({
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
      <CreatorNav />
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-6">{children}</main>
    </div>
  );
}
