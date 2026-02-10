"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Settings,
  ArrowLeft,
} from "lucide-react";

const advertiserNavItems = [
  { href: "/advertiser/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/advertiser/campaigns/create", label: "Campaigns", icon: Megaphone },
  { href: "/advertiser/creators", label: "Creators", icon: Users },
  { href: "/advertiser/settings", label: "Settings", icon: Settings },
];

export function AdvertiserNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.username?.slice(0, 2).toUpperCase() || "AF";

  return (
    <header className="fixed top-0 z-50 w-full h-16 bg-black/85 backdrop-blur-[12px] border-b border-af-border">
      <div className="flex h-full items-center justify-between px-4 md:px-8">
        {/* Left: Logo + Divider + Label + Nav */}
        <div className="flex items-center gap-5">
          <Link
            href="/advertiser/dashboard"
            className="text-xl font-extrabold text-electric-blue hover:text-electric-blue/80 transition-colors tracking-wider"
          >
            ARGU FIGHT
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-af-border" />

          {/* Section Label */}
          <span className="hidden md:block text-sm font-semibold text-neon-orange tracking-wide">
            Advertiser
          </span>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {advertiserNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/advertiser/dashboard" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-electric-blue/10 text-electric-blue"
                      : "text-muted-foreground hover:bg-bg-tertiary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Back + Profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-electric-blue transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline">Back to App</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.avatarUrl || undefined}
                alt={user?.username || "User"}
              />
              <AvatarFallback className="text-xs bg-electric-blue/20 text-electric-blue font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-semibold text-foreground">
              {user?.username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
