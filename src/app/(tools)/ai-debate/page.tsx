"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, RotateCcw, User } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  round: number;
}

export default function AIDebatePage() {
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const maxRounds = 3;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startDebate = () => {
    if (!topic.trim()) return;
    setStarted(true);
    setMessages([]);
    setRound(1);
  };

  const submitArgument = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input, round };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/trpc/debate.aiPractice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userArgument: input, round, history: messages }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponse = data?.result?.data ?? "I appreciate your argument. Let me counter with a different perspective...";
        setMessages((prev) => [...prev, { role: "ai", content: aiResponse, round }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "That's an interesting point. While I see the merit in your argument, consider that there are multiple perspectives to evaluate. The strength of any position lies in acknowledging its limitations.", round },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "An interesting perspective. In response, I would argue that we should consider the broader implications and alternative viewpoints that may strengthen or challenge this position.", round },
      ]);
    } finally {
      setLoading(false);
      setRound((r) => Math.min(r + 1, maxRounds + 1));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setTopic("");
    setInput("");
    setRound(1);
  };

  const isComplete = round > maxRounds;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-electric-blue" />
          <h1 className="text-3xl font-bold">AI Debate Practice</h1>
        </div>
        <p className="text-muted-foreground">
          Practice your debate skills against an AI opponent. Choose a topic and argue your case.
        </p>
      </div>

      {!started ? (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm">Choose Your Topic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter a debate topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startDebate()}
            />
            <div className="flex flex-wrap gap-2">
              {["Should AI be regulated?", "Is social media harmful?", "Should college be free?", "Is remote work better?"].map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="cursor-pointer hover:bg-electric-blue/10 text-xs"
                  onClick={() => { setTopic(t); }}
                >
                  {t}
                </Badge>
              ))}
            </div>
            <Button onClick={startDebate} disabled={!topic.trim()}>
              Start Debate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Topic:</p>
              <p className="font-semibold">{topic}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {isComplete ? "Complete" : `Round ${round} / ${maxRounds}`}
              </Badge>
              <Button size="sm" variant="outline" onClick={reset}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reset
              </Button>
            </div>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-electric-blue" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2.5 max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-electric-blue/10 border border-electric-blue/20"
                      : "bg-muted/50 border border-border/50"
                  }`}
                >
                  <p className="text-[10px] text-muted-foreground mb-1">Round {msg.round}</p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyber-green/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-cyber-green" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-electric-blue" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted/50 border border-border/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!isComplete ? (
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your argument..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitArgument();
                  }
                }}
              />
              <Button onClick={submitArgument} disabled={loading || !input.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Card className="border-cyber-green/30 bg-cyber-green/5">
              <CardContent className="py-6 text-center space-y-2">
                <p className="font-bold text-cyber-green">Debate Complete!</p>
                <p className="text-sm text-muted-foreground">
                  You completed {maxRounds} rounds of debate. Sign up for a full account to get AI coaching on your performance.
                </p>
                <Button onClick={reset} variant="outline" size="sm">
                  Try Another Topic
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
