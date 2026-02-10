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
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 pt-24 pb-10">{children}</main>
    </div>
  );
}
