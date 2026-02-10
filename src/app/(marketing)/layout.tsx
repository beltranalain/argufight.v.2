import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
