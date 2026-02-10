import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { AdvertiserNav } from "@/components/layout/advertiser-nav";

export default async function AdvertiserLayout({
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
      <AdvertiserNav />
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-6">{children}</main>
    </div>
  );
}
