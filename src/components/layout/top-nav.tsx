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
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Moon,
  Search,
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
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
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
              className="flex items-center gap-1 text-lg font-bold"
            >
              <span className="text-electric-blue">ARGU</span>
              <span className="text-neon-orange">FIGHT</span>
            </Link>

            {currentPanel && (
              <Badge
                variant="outline"
                className="hidden border-electric-blue/30 text-electric-blue md:inline-flex"
              >
                {currentPanel}
              </Badge>
            )}
          </div>

          {/* Center: Search (desktop) */}
          <div className="hidden max-w-md flex-1 px-8 md:block">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => router.push("/debates")}
            >
              <Search className="mr-2 h-4 w-4" />
              Search debates, users, topics...
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
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
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-9 w-9 md:flex"
                asChild
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                </Link>
              </Button>
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
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatarUrl || undefined}
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
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
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
