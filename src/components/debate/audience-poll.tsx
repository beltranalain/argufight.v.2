"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Vote, Users } from "lucide-react";

interface AudiencePollProps {
  debateId: string;
  round: number;
  challengerName: string;
  opponentName: string;
  challengerVotes: number;
  opponentVotes: number;
  userVote?: string | null;
  onVote?: (votedForId: string) => void;
  challengerId: string;
  opponentId: string;
  disabled?: boolean;
}

export function AudiencePoll({
  round,
  challengerName,
  opponentName,
  challengerVotes,
  opponentVotes,
  userVote,
  onVote,
  challengerId,
  opponentId,
  disabled = false,
}: AudiencePollProps) {
  const [voting, setVoting] = useState(false);
  const total = challengerVotes + opponentVotes;
  const challengerPct = total > 0 ? Math.round((challengerVotes / total) * 100) : 50;
  const opponentPct = total > 0 ? Math.round((opponentVotes / total) * 100) : 50;

  const handleVote = async (userId: string) => {
    if (userVote || disabled) return;
    setVoting(true);
    onVote?.(userId);
    setVoting(false);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card/80 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <Vote className="h-3 w-3" />
          <span>Round {round} — Audience Vote</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{total} votes</span>
        </div>
      </div>

      {/* Vote bar */}
      <div className="relative h-8 rounded-full overflow-hidden bg-muted/30 flex">
        <div
          className="bg-electric-blue/30 transition-all duration-500 flex items-center justify-start pl-2"
          style={{ width: `${challengerPct}%` }}
        >
          <span className="text-[10px] font-medium text-electric-blue whitespace-nowrap">
            {challengerPct}%
          </span>
        </div>
        <div
          className="bg-neon-orange/30 transition-all duration-500 flex items-center justify-end pr-2"
          style={{ width: `${opponentPct}%` }}
        >
          <span className="text-[10px] font-medium text-neon-orange whitespace-nowrap">
            {opponentPct}%
          </span>
        </div>
      </div>

      {/* Vote buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "text-xs",
            userVote === challengerId && "border-electric-blue bg-electric-blue/10 text-electric-blue"
          )}
          disabled={!!userVote || voting || disabled}
          onClick={() => handleVote(challengerId)}
        >
          {challengerName}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "text-xs",
            userVote === opponentId && "border-neon-orange bg-neon-orange/10 text-neon-orange"
          )}
          disabled={!!userVote || voting || disabled}
          onClick={() => handleVote(opponentId)}
        >
          {opponentName}
        </Button>
      </div>
    </div>
  );
}
