"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

const models = [
  {
    name: "DeepSeek V3",
    provider: "DeepSeek",
    use: "Primary judge verdicts",
    status: "active",
    model: "deepseek-chat",
  },
  {
    name: "GPT-4o",
    provider: "OpenAI",
    use: "Fallback judge, coaching",
    status: "active",
    model: "gpt-4o",
  },
  {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    use: "Content moderation, fallacy detection",
    status: "active",
    model: "gpt-4o-mini",
  },
];

export default function AdminLLMModelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">LLM Models</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.name} className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{model.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    model.status === "active"
                      ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30 text-[10px]"
                      : "text-[10px]"
                  }
                >
                  {model.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs">
                <span className="text-muted-foreground">Provider: </span>
                <span>{model.provider}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Model ID: </span>
                <span className="font-mono">{model.model}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Use: </span>
                <span>{model.use}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
