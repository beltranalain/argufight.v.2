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

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Competition",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/debates", label: "Debates", icon: Swords },
      { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
      { href: "/admin/appeals", label: "Appeals", icon: AlertTriangle },
      { href: "/admin/categories", label: "Categories", icon: Folder },
      { href: "/admin/judges", label: "AI Judges", icon: Scale },
      { href: "/admin/llm-models", label: "LLM Models", icon: Brain },
      { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
      { href: "/admin/belts", label: "Belts", icon: Award },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/content", label: "Content CMS", icon: FileText },
      { href: "/admin/seo", label: "SEO", icon: Globe },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/coins", label: "Coins", icon: Coins },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/admin/plans", label: "Plans", icon: Receipt },
      { href: "/admin/advertisements", label: "Advertisements", icon: MonitorPlay },
      { href: "/admin/creator-marketplace", label: "Creators", icon: Sparkles },
      { href: "/admin/creator-taxes", label: "Creator Taxes", icon: Receipt },
      { href: "/admin/finances", label: "Finances", icon: DollarSign },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
      { href: "/admin/support", label: "Support", icon: HelpCircle },
      { href: "/admin/boards", label: "Boards", icon: Kanban },
      { href: "/admin/ai-users", label: "AI Users", icon: Bot },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-bg-secondary border-r border-af-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-af-border">
        <Link href="/admin" className="block">
          <span className="text-lg font-extrabold text-electric-blue tracking-wider">
            ARGUFIGHT
          </span>
          <span className="block text-xs font-medium text-muted-foreground mt-0.5">
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="px-3 mb-2">
            <div className="af-nav-section-title">{group.title}</div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-electric-blue/10 text-electric-blue border-l-[3px] border-electric-blue"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-neon-orange text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Back to App */}
      <div className="border-t border-af-border p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-electric-blue transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
