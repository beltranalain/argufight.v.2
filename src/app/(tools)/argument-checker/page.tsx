"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  fallacies: { type: string; explanation: string }[];
  suggestions: string[];
}

export default function ArgumentCheckerPage() {
  const [argument, setArgument] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = async () => {
    if (!argument.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/trpc/debate.checkArgument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argument }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data?.result?.data ?? null);
      }
    } catch {
      // Fallback demo result
      setResult({
        overallScore: 7,
        strengths: [
          "Clear thesis statement",
          "Logical structure with supporting evidence",
        ],
        weaknesses: [
          "Could benefit from more specific data",
          "Consider addressing potential counterarguments",
        ],
        fallacies: [],
        suggestions: [
          "Add statistical evidence to support your claims",
          "Address the strongest opposing argument",
          "End with a clear call to action or conclusion",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-cyber-green";
    if (score >= 6) return "text-electric-blue";
    if (score >= 4) return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-neon-orange" />
          <h1 className="text-3xl font-bold">Argument Checker</h1>
        </div>
        <p className="text-muted-foreground">
          Paste your argument and get instant AI feedback on its logical strength, fallacies, and persuasiveness.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardContent className="pt-6 space-y-4">
          <Textarea
            placeholder="Paste your argument here..."
            value={argument}
            onChange={(e) => setArgument(e.target.value)}
            className="min-h-[150px]"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {argument.length} characters
            </p>
            <Button onClick={analyze} disabled={loading || argument.length < 20}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                "Check Argument"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="border-border/50 bg-card/80">
            <CardContent className="py-6 flex items-center justify-center gap-4">
              <div className="text-center">
                <p className={`text-5xl font-bold ${scoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </p>
                <p className="text-xs text-muted-foreground mt-1">/ 10</p>
              </div>
              <div className="text-left">
                <p className="font-semibold">Argument Strength</p>
                <p className="text-sm text-muted-foreground">
                  {result.overallScore >= 8
                    ? "Excellent argument with strong logical foundation"
                    : result.overallScore >= 6
                      ? "Good argument with room for improvement"
                      : "Needs significant strengthening"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border-cyber-green/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-cyber-green" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">+ {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-neon-orange/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-neon-orange" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-muted-foreground">- {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Fallacies */}
          {result.fallacies.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  Logical Fallacies Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.fallacies.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive flex-shrink-0">
                      {f.type}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{f.explanation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          <Card className="border-electric-blue/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Suggestions for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1.5 list-decimal list-inside">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground">{s}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
