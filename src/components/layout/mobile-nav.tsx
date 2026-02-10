"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Swords,
  Trophy,
  Award,
  BarChart3,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  Search,
  Bookmark,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debates", label: "Debates", icon: Swords },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/belts/room", label: "Belts", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/debates/saved", label: "Saved", icon: Bookmark },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-left">
            <span className="text-electric-blue">ARGU</span>
            <span className="text-neon-orange">FIGHT</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col py-2">
          {/* Search */}
          <Link
            href="/debates"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>

          {/* Nav Items */}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "border-r-2 border-electric-blue bg-electric-blue/10 text-electric-blue"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Admin link */}
          {session?.user?.isAdmin && (
            <>
              <div className="mx-4 my-2 border-t border-border" />
              <Link
                href="/admin"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
