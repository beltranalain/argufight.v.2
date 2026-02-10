"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Swords } from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    status: string;
    debate_id?: string | null;
    participant1_score?: number | null;
    participant2_score?: number | null;
    winner_id?: string | null;
    participant1_id: string;
    participant2_id: string;
    scheduled_at?: Date | string | null;
    tournament_participants_tournament_matches_participant1_idTotournament_participants: {
      users: { id: string; username: string; avatar_url?: string | null };
    };
    tournament_participants_tournament_matches_participant2_idTotournament_participants: {
      users: { id: string; username: string; avatar_url?: string | null };
    };
  };
}

const matchStatusColors: Record<string, string> = {
  SCHEDULED: "border-muted-foreground/30 text-muted-foreground",
  IN_PROGRESS: "border-electric-blue/30 text-electric-blue",
  COMPLETED: "border-cyber-green/30 text-cyber-green",
  FORFEITED: "border-destructive/30 text-destructive",
};

export function MatchCard({ match }: MatchCardProps) {
  const p1 =
    match.tournament_participants_tournament_matches_participant1_idTotournament_participants
      .users;
  const p2 =
    match.tournament_participants_tournament_matches_participant2_idTotournament_participants
      .users;
  const isComplete = match.status === "COMPLETED" || match.status === "FORFEITED";

  const inner = (
    <div className="rounded-lg border border-border/50 bg-card/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <Swords className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge
          variant="outline"
          className={`text-[10px] ${matchStatusColors[match.status] ?? ""}`}
        >
          {match.status}
        </Badge>
      </div>
      <div className="space-y-2">
        <div
          className={`flex items-center justify-between ${
            isComplete && match.winner_id === match.participant1_id
              ? "text-cyber-green"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[8px]">
                {p1.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{p1.username}</span>
          </div>
          <span className="text-sm font-bold">
            {match.participant1_score ?? "-"}
          </span>
        </div>
        <div className="text-center text-xs text-muted-foreground">vs</div>
        <div
          className={`flex items-center justify-between ${
            isComplete && match.winner_id === match.participant2_id
              ? "text-cyber-green"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[8px]">
                {p2.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{p2.username}</span>
          </div>
          <span className="text-sm font-bold">
            {match.participant2_score ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );

  if (match.debate_id) {
    return (
      <Link
        href={`/debate/${match.debate_id}`}
        className="block hover:border-electric-blue/30 transition-colors"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
