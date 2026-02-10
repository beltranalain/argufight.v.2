"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, Shield, Swords, Crown } from "lucide-react";

interface BeltCardProps {
  belt: {
    id: string;
    name: string;
    type: string;
    category?: string | null;
    status: string;
    times_defended: number;
    successful_defenses: number;
    total_days_held: number;
    coin_value: number;
    design_colors?: unknown;
    users?: {
      id: string;
      username: string;
      avatar_url?: string | null;
      elo_rating: number;
    } | null;
    _count: {
      belt_challenges: number;
      belt_history: number;
    };
  };
}

const typeIcons: Record<string, typeof Award> = {
  ROOKIE: Shield,
  CATEGORY: Award,
  CHAMPIONSHIP: Crown,
  UNDEFEATED: Swords,
  TOURNAMENT: Crown,
};

const typeColors: Record<string, string> = {
  ROOKIE: "border-cyber-green/30 text-cyber-green",
  CATEGORY: "border-electric-blue/30 text-electric-blue",
  CHAMPIONSHIP: "border-neon-orange/30 text-neon-orange",
  UNDEFEATED: "border-hot-pink/30 text-hot-pink",
  TOURNAMENT: "border-yellow-400/30 text-yellow-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  INACTIVE: "bg-muted text-muted-foreground border-border",
  VACANT: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  STAKED: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  GRACE_PERIOD: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  MANDATORY: "bg-destructive/10 text-destructive border-destructive/30",
};

export function BeltCard({ belt }: BeltCardProps) {
  const Icon = typeIcons[belt.type] ?? Award;

  return (
    <Link
      href={`/belts/${belt.id}`}
      className="block rounded-xl border border-border/50 bg-card/80 p-5 hover:border-electric-blue/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-lg p-2.5 border ${typeColors[belt.type] ?? "border-border"}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{belt.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={`text-[10px] ${typeColors[belt.type] ?? ""}`}>
                {belt.type}
              </Badge>
              {belt.category && (
                <span className="text-xs text-muted-foreground">{belt.category}</span>
              )}
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] ${statusColors[belt.status] ?? ""}`}
        >
          {belt.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Current holder */}
      <div className="mt-4 pt-3 border-t border-border/30">
        {belt.users ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[8px]">
                  {belt.users.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium">{belt.users.username}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ELO {belt.users.elo_rating}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{belt.successful_defenses} defenses</p>
              <p>{belt.total_days_held}d held</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-1">
            Vacant — no current holder
          </p>
        )}
      </div>

      {/* Stats row */}
      {belt.coin_value > 0 && (
        <div className="mt-2 text-xs text-neon-orange text-right">
          {belt.coin_value} coins
        </div>
      )}
    </Link>
  );
}
