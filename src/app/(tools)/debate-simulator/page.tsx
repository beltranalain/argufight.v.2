"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Loader2, Play, Users } from "lucide-react";

interface SimulatedDebate {
  topic: string;
  rounds: { round: number; challenger: string; opponent: string }[];
  verdict: { winner: string; reasoning: string };
}

export default function DebateSimulatorPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulatedDebate | null>(null);

  const simulate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setSimulation(null);

    try {
      const res = await fetch("/api/trpc/debate.simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulation(data?.result?.data ?? null);
      }
    } catch {
      // Fallback demo simulation
      setSimulation({
        topic,
        rounds: [
          {
            round: 1,
            challenger: `The proposition that "${topic}" has significant merit. Historical evidence shows that similar approaches have led to measurable positive outcomes. Key stakeholders benefit from this perspective, and economic analysis supports the underlying assumptions.`,
            opponent: `While the initial argument raises valid points, it overlooks critical counterevidence. The historical parallels drawn are incomplete, and more recent studies suggest a more nuanced picture. We must consider the unintended consequences that often accompany such positions.`,
          },
          {
            round: 2,
            challenger: "Building on the foundation laid, the data overwhelmingly supports this position. Multiple independent studies corroborate the core thesis, and the practical implementations we've seen demonstrate clear benefits. The concerns raised about unintended consequences, while noted, are mitigated by proper implementation frameworks.",
            opponent: "The reliance on selective data points reveals a confirmation bias in the argument. When we examine the full body of evidence, including longitudinal studies, the picture is far less clear. Furthermore, the implementation frameworks mentioned have shown significant gaps in real-world applications.",
          },
          {
            round: 3,
            challenger: "In conclusion, the weight of evidence, practical outcomes, and logical reasoning all point toward this position being sound. While no argument is perfect, the preponderance of supporting evidence, combined with the feasibility of proper implementation, makes this the stronger position.",
            opponent: "To summarize, this debate has revealed that the initial proposition, while appealing, rests on incomplete evidence and oversimplified assumptions. A more measured approach that acknowledges the complexity of the issue would better serve all stakeholders involved.",
          },
        ],
        verdict: {
          winner: "Challenger",
          reasoning: "The Challenger presented a more structured and evidence-based argument, effectively building their case across rounds. While the Opponent raised valid concerns, they relied more heavily on critique than on establishing an independent positive case.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Clapperboard className="h-8 w-8 text-cyber-green" />
          <h1 className="text-3xl font-bold">Debate Simulator</h1>
        </div>
        <p className="text-muted-foreground">
          Watch two AI debaters argue any topic. Learn from their strategies and techniques.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter any debate topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && simulate()}
            />
            <Button onClick={simulate} disabled={loading || !topic.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Play className="mr-1 h-4 w-4" /> Simulate</>
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Should voting be mandatory?",
              "Is space exploration worth the cost?",
              "Should homework be banned?",
            ].map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="cursor-pointer hover:bg-electric-blue/10 text-xs"
                onClick={() => setTopic(t)}
              >
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {simulation && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-electric-blue/10 flex items-center justify-center mx-auto">
                <Users className="h-5 w-5 text-electric-blue" />
              </div>
              <p className="text-xs font-medium mt-1">Challenger</p>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">vs</span>
            <div className="text-center">
              <div className="h-10 w-10 rounded-full bg-neon-orange/10 flex items-center justify-center mx-auto">
                <Users className="h-5 w-5 text-neon-orange" />
              </div>
              <p className="text-xs font-medium mt-1">Opponent</p>
            </div>
          </div>

          {simulation.rounds.map((round) => (
            <div key={round.round} className="space-y-2">
              <Badge variant="outline" className="text-[10px]">Round {round.round}</Badge>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="border-electric-blue/20">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[10px] text-electric-blue">Challenger</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{round.challenger}</p>
                  </CardContent>
                </Card>
                <Card className="border-neon-orange/20">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[10px] text-neon-orange">Opponent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{round.opponent}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {/* Verdict */}
          <Card className="border-cyber-green/30 bg-cyber-green/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                ⚖️ Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-bold text-cyber-green">Winner: {simulation.verdict.winner}</p>
              <p className="text-sm text-muted-foreground">{simulation.verdict.reasoning}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
