"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Settings,
  ArrowLeft,
  Handshake,
} from "lucide-react";

const creatorNavItems = [
  { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/earnings", label: "Earnings", icon: DollarSign },
  { href: "/creator/offers", label: "Offers", icon: Handshake },
  { href: "/creator/settings", label: "Settings", icon: Settings },
];

export function CreatorNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/creator/dashboard"
            className="flex items-center gap-2 font-bold"
          >
            <span className="text-lg">
              <span className="text-electric-blue">ARGU</span>
              <span className="text-neon-orange">FIGHT</span>
            </span>
            <span className="rounded bg-cyber-green/20 px-2 py-0.5 text-xs font-semibold text-cyber-green">
              CREATOR
            </span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="hidden items-center gap-1 md:flex">
          {creatorNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-electric-blue/10 text-electric-blue"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Back to App */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden md:inline">Back to App</span>
        </Link>
      </div>
    </header>
  );
}
