"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Bookmark, Eye, Swords } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

interface DebateUser {
  id: string;
  username: string;
  avatar_url: string | null;
  elo_rating: number | null;
}

interface DebateCardProps {
  debate: {
    id: string;
    topic: string;
    description: string | null;
    category: string;
    status: string;
    visibility: string;
    slug: string | null;
    challenger_position: string;
    opponent_position: string;
    total_rounds: number;
    current_round: number;
    speed_mode: boolean;
    featured: boolean;
    has_belt_at_stake: boolean;
    view_count: number;
    created_at: Date;
    users_debates_challenger_idTousers: DebateUser;
    users_debates_opponent_idTousers: DebateUser | null;
    _count: {
      debate_likes: number;
      debate_comments: number;
      debate_saves: number;
      statements: number;
    };
  };
}

const statusColors: Record<string, string> = {
  WAITING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-electric-blue/20 text-electric-blue border-electric-blue/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
  VERDICT_READY: "bg-cyber-green/20 text-cyber-green border-cyber-green/30",
  APPEALED: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  CANCELLED: "bg-destructive/20 text-destructive border-destructive/30",
};

const categoryColors: Record<string, string> = {
  SPORTS: "text-orange-400",
  POLITICS: "text-red-400",
  TECH: "text-electric-blue",
  ENTERTAINMENT: "text-pink-400",
  SCIENCE: "text-cyber-green",
  MUSIC: "text-purple-400",
  OTHER: "text-muted-foreground",
};

export function DebateCard({ debate }: DebateCardProps) {
  const challenger = debate.users_debates_challenger_idTousers;
  const opponent = debate.users_debates_opponent_idTousers;

  return (
    <Link
      href={`/debate/${debate.id}`}
      className="group block rounded-xl border border-border/50 bg-card/80 p-5 transition-all hover:border-electric-blue/30 hover:bg-card"
    >
      <div className="flex items-start justify-between">
        <span className={`text-xs font-medium ${categoryColors[debate.category] ?? "text-muted-foreground"}`}>
          {debate.category}
        </span>
        <Badge
          variant="outline"
          className={`text-[10px] ${statusColors[debate.status] ?? ""}`}
        >
          {debate.status.replace("_", " ")}
        </Badge>
      </div>

      <h3 className="mt-2 line-clamp-2 font-semibold leading-snug group-hover:text-electric-blue transition-colors">
        {debate.topic}
      </h3>

      {debate.description && (
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {debate.description}
        </p>
      )}

      {/* Participants */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-electric-blue/20 text-electric-blue">
              {challenger.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium">{challenger.username}</span>
          <span className="text-[10px] text-muted-foreground">
            ({challenger.elo_rating ?? 1200})
          </span>
        </div>

        <Swords className="h-3.5 w-3.5 text-muted-foreground" />

        {opponent ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-neon-orange/20 text-neon-orange">
                {opponent.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{opponent.username}</span>
            <span className="text-[10px] text-muted-foreground">
              ({opponent.elo_rating ?? 1200})
            </span>
          </div>
        ) : (
          <span className="text-xs italic text-muted-foreground">Waiting...</span>
        )}
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {debate._count.debate_likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {debate._count.debate_comments}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {debate.view_count}
        </span>
        <span className="ml-auto">
          R{debate.current_round}/{debate.total_rounds}
        </span>
        {debate.speed_mode && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            SPEED
          </Badge>
        )}
        {debate.has_belt_at_stake && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-500/30 text-yellow-400">
            BELT
          </Badge>
        )}
      </div>

      <div className="mt-2 text-[10px] text-muted-foreground">
        {formatDistanceToNow(debate.created_at)}
      </div>
    </Link>
  );
}
