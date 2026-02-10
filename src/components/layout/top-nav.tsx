"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
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
  Sun,
  Moon,
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
  Shield,
  Menu,
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
      <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-background/80 backdrop-blur-sm border-b border-border/40 z-50">
        <div className="h-full px-4 md:px-8 flex items-center justify-between">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link
              href="/dashboard"
              className="flex items-center text-lg md:text-xl font-bold"
            >
              <span className="text-electric-blue hover:text-electric-blue/80 transition-colors">
                ARGU FIGHT
              </span>
            </Link>
          </div>

          {/* Center: Panel Title */}
          {currentPanel && (
            <h2 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-2xl font-bold text-foreground hidden md:block">
              {currentPanel}
            </h2>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Admin Link */}
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-electric-blue hover:text-neon-orange transition-colors border border-electric-blue/30 rounded-lg hover:bg-electric-blue/10"
              >
                <Shield className="h-3.5 w-3.5 mr-1" />
                Admin
              </Link>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Coin Balance */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1 text-neon-orange md:flex"
              asChild
            >
              <Link href="/coins">
                <Coins className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  {user?.coins ?? 0}
                </span>
              </Link>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatarUrl || undefined}
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback className="text-xs">
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
