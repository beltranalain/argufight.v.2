"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  Bookmark,
  TrendingUp,
  Award,
  MessageSquare,
  HelpCircle,
  Coins,
  ShoppingCart,
  Zap,
  Menu,
  ArrowLeftRight,
} from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface TopNavProps {
  currentPanel?: string;
}

export function TopNav({ currentPanel }: TopNavProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user;
  const initials = user?.username?.slice(0, 2).toUpperCase() || "AF";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/85 backdrop-blur-[12px] border-b border-af-border z-50">
        <div className="h-full px-4 md:px-8 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 rounded-lg border-none bg-transparent text-text-secondary flex items-center justify-center hover:bg-bg-tertiary hover:text-text-primary transition-all"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/dashboard"
              className="text-xl font-extrabold text-electric-blue hover:text-electric-blue/80 transition-colors tracking-wider"
            >
              ARGU FIGHT
            </Link>
          </div>

          {/* Center: Panel Title */}
          {currentPanel && (
            <h2 className="absolute left-1/2 -translate-x-1/2 text-[22px] font-extrabold text-foreground tracking-[2px] hidden md:block">
              {currentPanel}
            </h2>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Group */}
            <div className="af-theme-group hidden md:flex">
              <button
                className={`af-theme-btn ${!theme || theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
              <button
                className={`af-theme-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                className={`af-theme-btn ${theme === "purple" ? "active" : ""}`}
                onClick={() => setTheme("purple")}
              >
                Purple
              </button>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Switch Button (admin/creator nav) */}
            {(user?.isAdmin || user?.isCreator) && (
              <button
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-electric-blue/50 bg-transparent text-electric-blue text-[13px] font-semibold hover:bg-electric-blue/10 transition-all cursor-pointer"
                onClick={() => {
                  if (user?.isAdmin) router.push("/admin");
                  else if (user?.isCreator) router.push("/creator/dashboard");
                }}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Switch
              </button>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-accent rounded-lg py-1.5 px-2.5 transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatarUrl || undefined}
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback className="text-xs bg-electric-blue/20 text-electric-blue font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground hidden sm:block text-sm">
                    {user?.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-neon-orange">
                      <Coins className="h-3 w-3" />
                      {user?.coins ?? 0} coins
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/debates/saved")}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Debates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/trending")}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Trending Topics
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/belts/room")}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Belts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Direct Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/support")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {user?.isCreator && (
                    <DropdownMenuItem
                      onClick={() => router.push("/creator/dashboard")}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Creator Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push("/coins")}>
                    <Coins className="mr-2 h-4 w-4" />
                    My Coins
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/coins/purchase")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Coins
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out @{user?.username}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Sheet */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
