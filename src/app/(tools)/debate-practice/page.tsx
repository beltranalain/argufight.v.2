"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Clock, ArrowRight, RotateCcw, CheckCircle } from "lucide-react";

const EXERCISES = [
  {
    id: "counterargument",
    title: "Counterargument Builder",
    description: "Given a position, construct the strongest counterargument.",
    icon: "🔄",
    prompt: "Technology companies should be responsible for the mental health effects of their products.",
    timeLimit: 120,
  },
  {
    id: "steelman",
    title: "Steel Man Exercise",
    description: "Present the opposing view as strongly as possible.",
    icon: "🛡️",
    prompt: "Standardized testing should be eliminated from college admissions.",
    timeLimit: 150,
  },
  {
    id: "evidence",
    title: "Evidence Challenge",
    description: "Build an evidence-based argument with at least 3 supporting points.",
    icon: "📊",
    prompt: "Universal basic income would improve society.",
    timeLimit: 180,
  },
  {
    id: "rebuttal",
    title: "Rapid Rebuttal",
    description: "Quickly identify and address the weakest point in an argument.",
    icon: "⚡",
    prompt: "Electric cars are the only solution to climate change because they produce no emissions and are cheaper to maintain.",
    timeLimit: 90,
  },
];

export default function DebatePracticePage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const exercise = EXERCISES.find((e) => e.id === selectedExercise);

  const startExercise = (id: string) => {
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) return;
    setSelectedExercise(id);
    setResponse("");
    setSubmitted(false);
    setTimeLeft(ex.timeLimit);
    setTimerActive(true);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submit = () => {
    setSubmitted(true);
    setTimerActive(false);
  };

  const reset = () => {
    setSelectedExercise(null);
    setResponse("");
    setSubmitted(false);
    setTimerActive(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Dumbbell className="h-8 w-8 text-hot-pink" />
          <h1 className="text-3xl font-bold">Debate Practice</h1>
        </div>
        <p className="text-muted-foreground">
          Sharpen your argumentation skills with timed exercises and drills.
        </p>
      </div>

      {!selectedExercise ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {EXERCISES.map((ex) => (
            <Card
              key={ex.id}
              className="border-border/50 bg-card/80 cursor-pointer hover:border-electric-blue/30 transition-colors"
              onClick={() => startExercise(ex.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ex.icon}</span>
                  <CardTitle className="text-sm">{ex.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{ex.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(ex.timeLimit / 60)} min {ex.timeLimit % 60 > 0 ? `${ex.timeLimit % 60}s` : ""}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  <ArrowRight className="mr-1 h-3 w-3" /> Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{exercise?.icon}</span>
              <h2 className="font-semibold">{exercise?.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {timerActive && (
                <Badge
                  variant="outline"
                  className={timeLeft < 30 ? "bg-destructive/10 text-destructive animate-pulse" : ""}
                >
                  <Clock className="mr-1 h-3 w-3" /> {formatTime(timeLeft)}
                </Badge>
              )}
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw className="h-3 w-3 mr-1" /> Back
              </Button>
            </div>
          </div>

          <Card className="border-electric-blue/20 bg-electric-blue/5">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
              <p className="text-sm font-medium">{exercise?.prompt}</p>
            </CardContent>
          </Card>

          {!submitted ? (
            <>
              <Textarea
                placeholder="Write your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[200px]"
                disabled={timeLeft === 0 && !response}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{response.length} characters</p>
                <Button onClick={submit} disabled={response.length < 20}>
                  Submit Response
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-cyber-green/30 bg-cyber-green/5">
              <CardContent className="py-6 text-center space-y-3">
                <CheckCircle className="h-8 w-8 text-cyber-green mx-auto" />
                <p className="font-bold text-cyber-green">Exercise Complete!</p>
                <p className="text-sm text-muted-foreground">
                  You wrote {response.length} characters in {formatTime((exercise?.timeLimit ?? 0) - timeLeft)}.
                  Sign up for a full account to get AI feedback on your responses.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={reset} variant="outline" size="sm">
                    Try Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
