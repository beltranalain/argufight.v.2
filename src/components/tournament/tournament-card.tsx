"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Users, Calendar, Swords, Crown } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    format: string;
    max_participants: number;
    current_round: number;
    total_rounds: number;
    start_date: Date | string;
    entry_fee?: number | null;
    prize_pool?: number | null;
    min_elo?: number | null;
    users_tournaments_creator_idTousers: {
      username: string;
      avatar_url?: string | null;
    };
    users_tournaments_winner_idTousers?: {
      username: string;
    } | null;
    _count: {
      tournament_participants: number;
      tournament_matches: number;
    };
  };
}

const statusColors: Record<string, string> = {
  UPCOMING: "border-muted-foreground/30 text-muted-foreground",
  REGISTRATION_OPEN: "border-cyber-green/30 text-cyber-green",
  IN_PROGRESS: "border-electric-blue/30 text-electric-blue",
  COMPLETED: "border-neon-orange/30 text-neon-orange",
  CANCELLED: "border-destructive/30 text-destructive",
};

const formatLabels: Record<string, string> = {
  BRACKET: "Bracket",
  CHAMPIONSHIP: "Championship",
  KING_OF_THE_HILL: "King of the Hill",
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const startDate = new Date(tournament.start_date);
  const isFuture = startDate > new Date();

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="block rounded-xl border border-border/50 bg-card/80 p-5 hover:border-electric-blue/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-neon-orange shrink-0" />
            <h3 className="font-semibold truncate">{tournament.name}</h3>
          </div>
          {tournament.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {tournament.description}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 text-[10px] ${statusColors[tournament.status] ?? ""}`}
        >
          {tournament.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {tournament._count.tournament_participants}/{tournament.max_participants}
        </span>
        <span className="flex items-center gap-1">
          <Swords className="h-3 w-3" />
          Round {tournament.current_round}/{tournament.total_rounds}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {isFuture
            ? `Starts ${formatDistanceToNow(startDate)}`
            : formatDistanceToNow(startDate)}
        </span>
        <Badge variant="outline" className="text-[10px]">
          {formatLabels[tournament.format] ?? tournament.format}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px]">
              {tournament.users_tournaments_creator_idTousers.username
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            by {tournament.users_tournaments_creator_idTousers.username}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {tournament.entry_fee && tournament.entry_fee > 0 && (
            <span className="text-xs text-neon-orange font-medium">
              {tournament.entry_fee} coins entry
            </span>
          )}
          {tournament.prize_pool && tournament.prize_pool > 0 && (
            <span className="text-xs text-cyber-green font-medium flex items-center gap-1">
              <Crown className="h-3 w-3" />
              {tournament.prize_pool} prize
            </span>
          )}
          {tournament.users_tournaments_winner_idTousers && (
            <span className="text-xs text-neon-orange font-medium">
              Winner: {tournament.users_tournaments_winner_idTousers.username}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
