"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Scale, Minus } from "lucide-react";

interface Judge {
  id: string;
  name: string;
  personality: string;
  emoji: string;
  description?: string;
}

interface Verdict {
  id: string;
  judge_id: string;
  winner_id: string | null;
  decision: "CHALLENGER_WINS" | "OPPONENT_WINS" | "TIE";
  reasoning: string;
  challenger_score: number | null;
  opponent_score: number | null;
  created_at: Date;
  judges: Judge;
}

interface VerdictSummary {
  challengerWins: number;
  opponentWins: number;
  ties: number;
  totalJudges: number;
  avgChallengerScore: number;
  avgOpponentScore: number;
  overallDecision: string;
}

interface VerdictDisplayProps {
  verdicts: Verdict[];
  summary: VerdictSummary | null;
  challengerName: string;
  opponentName: string;
}

const decisionColors: Record<string, string> = {
  CHALLENGER_WINS: "text-electric-blue",
  OPPONENT_WINS: "text-neon-orange",
  TIE: "text-muted-foreground",
};

const decisionIcons: Record<string, React.ReactNode> = {
  CHALLENGER_WINS: <Trophy className="h-5 w-5 text-electric-blue" />,
  OPPONENT_WINS: <Trophy className="h-5 w-5 text-neon-orange" />,
  TIE: <Scale className="h-5 w-5 text-muted-foreground" />,
};

export function VerdictDisplay({
  verdicts,
  summary,
  challengerName,
  opponentName,
}: VerdictDisplayProps) {
  if (!summary || verdicts.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/80 p-8 text-center">
        <Scale className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Verdict Pending</p>
        <p className="mt-1 text-sm text-muted-foreground">
          AI judges are analyzing the arguments...
        </p>
      </div>
    );
  }

  const overallLabel =
    summary.overallDecision === "CHALLENGER_WINS"
      ? `${challengerName} Wins`
      : summary.overallDecision === "OPPONENT_WINS"
        ? `${opponentName} Wins`
        : "Tie";

  return (
    <div className="space-y-4">
      {/* Overall verdict banner */}
      <div className="rounded-xl border border-border/50 bg-card/80 p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {decisionIcons[summary.overallDecision]}
          <h3 className={`text-xl font-bold ${decisionColors[summary.overallDecision]}`}>
            {overallLabel}
          </h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {summary.challengerWins}-{summary.opponentWins}
          {summary.ties > 0 ? `-${summary.ties}` : ""} ({summary.totalJudges} judges)
        </p>
        <div className="mt-3 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-electric-blue">
              {summary.avgChallengerScore}
            </p>
            <p className="text-xs text-muted-foreground">{challengerName}</p>
          </div>
          <Minus className="h-4 w-4 text-muted-foreground" />
          <div className="text-center">
            <p className="text-2xl font-bold text-neon-orange">
              {summary.avgOpponentScore}
            </p>
            <p className="text-xs text-muted-foreground">{opponentName}</p>
          </div>
        </div>
      </div>

      {/* Individual judge verdicts */}
      <div className="space-y-3">
        {verdicts.map((verdict) => (
          <Card key={verdict.id} className="border-border/50 bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{verdict.judges.emoji}</span>
                  {verdict.judges.name}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({verdict.judges.personality})
                  </span>
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    verdict.decision === "CHALLENGER_WINS"
                      ? "border-electric-blue/30 text-electric-blue"
                      : verdict.decision === "OPPONENT_WINS"
                        ? "border-neon-orange/30 text-neon-orange"
                        : "border-border text-muted-foreground"
                  }
                >
                  {verdict.decision === "CHALLENGER_WINS"
                    ? challengerName
                    : verdict.decision === "OPPONENT_WINS"
                      ? opponentName
                      : "Tie"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(verdict.challenger_score !== null || verdict.opponent_score !== null) && (
                <div className="mb-3 flex items-center gap-4 text-sm">
                  <span className="text-electric-blue font-medium">
                    {challengerName}: {verdict.challenger_score ?? 0}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-neon-orange font-medium">
                    {opponentName}: {verdict.opponent_score ?? 0}
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {verdict.reasoning}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
