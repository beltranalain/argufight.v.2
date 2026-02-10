"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Pause, Play } from "lucide-react";

const aiUsers = [
  {
    name: "DebateBot Alpha",
    personality: "Analytical and methodical, focuses on logical arguments",
    elo: 1200,
    debates: 45,
    winRate: "62%",
    status: "active",
  },
  {
    name: "RhetoricMaster",
    personality: "Persuasive and eloquent, emphasizes rhetorical techniques",
    elo: 1350,
    debates: 32,
    winRate: "71%",
    status: "active",
  },
  {
    name: "DevilsAdvocate",
    personality: "Contrarian, always takes the opposing view to challenge debaters",
    elo: 1150,
    debates: 28,
    winRate: "46%",
    status: "paused",
  },
];

export default function AdminAIUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-electric-blue" />
          <h1 className="text-2xl font-bold">AI Users</h1>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" /> Create AI User
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aiUsers.map((user) => (
          <Card key={user.name} className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-electric-blue/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-electric-blue" />
                  </div>
                  <CardTitle className="text-sm">{user.name}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={
                    user.status === "active"
                      ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30 text-[10px]"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-[10px]"
                  }
                >
                  {user.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{user.personality}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold">{user.elo}</p>
                  <p className="text-[10px] text-muted-foreground">ELO</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{user.debates}</p>
                  <p className="text-[10px] text-muted-foreground">Debates</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{user.winRate}</p>
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                {user.status === "active" ? (
                  <><Pause className="mr-1 h-3 w-3" /> Pause</>
                ) : (
                  <><Play className="mr-1 h-3 w-3" /> Resume</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
