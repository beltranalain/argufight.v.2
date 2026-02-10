"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Trophy,
  Award,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bookmark,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debates", label: "Debates", icon: Swords },
  { href: "/debates/saved", label: "Saved", icon: Bookmark },
  { href: "/debates/history", label: "History", icon: History },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/belts/room", label: "Belts", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border/40 bg-background md:block">
      <nav className="flex flex-col gap-1 p-3">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/30"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
