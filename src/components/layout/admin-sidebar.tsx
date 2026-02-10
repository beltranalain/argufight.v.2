"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Swords,
  ShieldAlert,
  Folder,
  Brain,
  BarChart3,
  Globe,
  FileText,
  CreditCard,
  Scale,
  Trophy,
  Award,
  Coins,
  Receipt,
  AlertTriangle,
  HelpCircle,
  Megaphone,
  DollarSign,
  MonitorPlay,
  Bell,
  Settings,
  ArrowLeft,
  Kanban,
  Bot,
  Sparkles,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/debates", label: "Debates", icon: Swords },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { href: "/admin/appeals", label: "Appeals", icon: AlertTriangle },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/judges", label: "AI Judges", icon: Scale },
  { href: "/admin/llm-models", label: "LLM Models", icon: Brain },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/admin/belts", label: "Belts", icon: Award },
  { href: "/admin/coins", label: "Coins", icon: Coins },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/plans", label: "Plans", icon: Receipt },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/content", label: "Content CMS", icon: FileText },
  { href: "/admin/seo", label: "SEO", icon: Globe },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/advertisements", label: "Advertisements", icon: MonitorPlay },
  { href: "/admin/creator-marketplace", label: "Creators", icon: Sparkles },
  { href: "/admin/creator-taxes", label: "Creator Taxes", icon: Receipt },
  { href: "/admin/finances", label: "Finances", icon: DollarSign },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/support", label: "Support", icon: HelpCircle },
  { href: "/admin/boards", label: "Boards", icon: Kanban },
  { href: "/admin/ai-users", label: "AI Users", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border/40 px-4">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <div className="flex h-7 items-center rounded bg-electric-blue px-2 text-xs font-bold text-black">
            ADMIN
          </div>
          <span className="text-sm">
            <span className="text-electric-blue">ARGU</span>
            <span className="text-neon-orange">FIGHT</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-0.5">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Back to App */}
      <div className="border-t border-border/40 p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
