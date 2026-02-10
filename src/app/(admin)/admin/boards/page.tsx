"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kanban, Plus, Layout, CheckSquare } from "lucide-react";

export default function AdminBoardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Kanban className="h-6 w-6 text-electric-blue" />
          <h1 className="text-2xl font-bold">Project Boards</h1>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-3 w-3" /> New Board
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-electric-blue/10 p-2">
                <Layout className="h-5 w-5 text-electric-blue" />
              </div>
              <div>
                <CardTitle className="text-sm">Platform Development</CardTitle>
                <p className="text-[10px] text-muted-foreground">Main project board</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>4 lists</span>
              <span>12 cards</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-neon-orange/10 p-2">
                <CheckSquare className="h-5 w-5 text-neon-orange" />
              </div>
              <div>
                <CardTitle className="text-sm">Bug Tracker</CardTitle>
                <p className="text-[10px] text-muted-foreground">Issue tracking</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>3 lists</span>
              <span>8 cards</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
