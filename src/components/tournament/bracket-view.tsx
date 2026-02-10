"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface MatchData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  debate_id?: string | null;
  winner_id?: string | null;
  status: string;
  participant1_score?: number | null;
  participant2_score?: number | null;
  tournament_participants_tournament_matches_participant1_idTotournament_participants: {
    users: { id: string; username: string; avatar_url?: string | null };
  };
  tournament_participants_tournament_matches_participant2_idTotournament_participants: {
    users: { id: string; username: string; avatar_url?: string | null };
  };
}

interface RoundData {
  id: string;
  round_number: number;
  status: string;
  tournament_matches: MatchData[];
}

interface BracketViewProps {
  rounds: RoundData[];
  totalRounds: number;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "text-muted-foreground",
  IN_PROGRESS: "text-electric-blue",
  COMPLETED: "text-cyber-green",
  FORFEITED: "text-destructive",
};

function MatchCard({ match }: { match: MatchData }) {
  const p1 =
    match.tournament_participants_tournament_matches_participant1_idTotournament_participants;
  const p2 =
    match.tournament_participants_tournament_matches_participant2_idTotournament_participants;
  const isComplete = match.status === "COMPLETED" || match.status === "FORFEITED";

  const content = (
    <div className="rounded-lg border border-border/50 bg-card/80 overflow-hidden w-56">
      {/* Player 1 */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          isComplete && match.winner_id === match.participant1_id
            ? "bg-cyber-green/10 border-l-2 border-l-cyber-green"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px]">
              {p1.users.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate">
            {p1.users.username}
          </span>
        </div>
        {match.participant1_score != null && (
          <span className="text-xs font-bold ml-2">
            {match.participant1_score}
          </span>
        )}
      </div>

      <div className="border-t border-border/30" />

      {/* Player 2 */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${
          isComplete && match.winner_id === match.participant2_id
            ? "bg-cyber-green/10 border-l-2 border-l-cyber-green"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px]">
              {p2.users.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate">
            {p2.users.username}
          </span>
        </div>
        {match.participant2_score != null && (
          <span className="text-xs font-bold ml-2">
            {match.participant2_score}
          </span>
        )}
      </div>
    </div>
  );

  if (match.debate_id) {
    return (
      <Link href={`/debate/${match.debate_id}`} className="block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export function BracketView({ rounds, totalRounds }: BracketViewProps) {
  if (rounds.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Bracket will be generated when the tournament starts.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {rounds.map((round) => (
          <div key={round.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold">
                {round.round_number === totalRounds
                  ? "Final"
                  : round.round_number === totalRounds - 1
                    ? "Semifinal"
                    : `Round ${round.round_number}`}
              </h3>
              <Badge
                variant="outline"
                className={`text-[10px] ${statusColors[round.status] ?? ""}`}
              >
                {round.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div
              className="flex flex-col justify-around flex-1 gap-4"
              style={{
                paddingTop: `${Math.pow(2, round.round_number - 1) * 16 - 16}px`,
                gap: `${Math.pow(2, round.round_number) * 16}px`,
              }}
            >
              {round.tournament_matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
