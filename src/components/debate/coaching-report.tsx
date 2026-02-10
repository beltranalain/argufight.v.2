"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  BookOpen,
  Star,
} from "lucide-react";

interface RoundFeedback {
  round: number;
  feedback: string;
  score: number;
}

interface CoachingReportProps {
  overallGrade: string;
  strengths: string[];
  weaknesses: string[];
  roundFeedback: RoundFeedback[];
  tips: string[];
  suggestedReading: string[];
}

const gradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-cyber-green/10 text-cyber-green border-cyber-green/30";
  if (grade.startsWith("B")) return "bg-electric-blue/10 text-electric-blue border-electric-blue/30";
  if (grade.startsWith("C")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  return "bg-destructive/10 text-destructive border-destructive/30";
};

const scoreColor = (score: number) => {
  if (score >= 8) return "text-cyber-green";
  if (score >= 6) return "text-electric-blue";
  if (score >= 4) return "text-yellow-500";
  return "text-destructive";
};

export function CoachingReport({
  overallGrade,
  strengths,
  weaknesses,
  roundFeedback,
  tips,
  suggestedReading,
}: CoachingReportProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-electric-blue" />
          <h3 className="font-bold">AI Coaching Report</h3>
        </div>
        <Badge variant="outline" className={`text-lg px-3 py-1 ${gradeColor(overallGrade)}`}>
          {overallGrade}
        </Badge>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-cyber-green/20 bg-cyber-green/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5 text-cyber-green" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-cyber-green mt-0.5">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-neon-orange/20 bg-neon-orange/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <ThumbsDown className="h-3.5 w-3.5 text-neon-orange" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-neon-orange mt-0.5">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Round-by-Round */}
      {roundFeedback.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-electric-blue" />
              Round-by-Round
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roundFeedback.map((rf) => (
              <div key={rf.round} className="flex gap-3">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-[10px] text-muted-foreground">Round {rf.round}</p>
                  <p className={`text-lg font-bold ${scoreColor(rf.score)}`}>{rf.score}/10</p>
                </div>
                <p className="text-xs text-muted-foreground border-l border-border/50 pl-3">
                  {rf.feedback}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
              Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 list-decimal list-inside">
              {tips.map((t, i) => (
                <li key={i} className="text-xs text-muted-foreground">{t}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Suggested Reading */}
      {suggestedReading.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-electric-blue" />
              Suggested Study Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {suggestedReading.map((r, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
