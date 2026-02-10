"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, FileText, Sidebar, Mail, Trophy } from "lucide-react";

const placements = [
  {
    type: "PROFILE_BANNER",
    label: "Profile Banner",
    icon: LayoutDashboard,
    description: "Full-width banner displayed at the top of a creator's profile page.",
    dimensions: "728 x 90 or 1200 x 300",
    avgCpm: "$5 – $15",
  },
  {
    type: "POST_DEBATE",
    label: "Post-Debate",
    icon: FileText,
    description: "Banner shown after a debate concludes, during the verdict display.",
    dimensions: "728 x 90",
    avgCpm: "$8 – $20",
  },
  {
    type: "DEBATE_WIDGET",
    label: "Debate Widget",
    icon: Sidebar,
    description: "Sidebar widget displayed alongside active debates.",
    dimensions: "300 x 600",
    avgCpm: "$3 – $10",
  },
  {
    type: "EMAIL_SHOUTOUT",
    label: "Email Shoutout",
    icon: Mail,
    description: "Sponsored mention in the creator's email newsletters or notifications.",
    dimensions: "600 x 200",
    avgCpm: "$10 – $25",
  },
  {
    type: "DEBATE_SPONSORSHIP",
    label: "Debate Sponsorship",
    icon: Trophy,
    description: "Full debate sponsorship — brand logo on debate page throughout the event.",
    dimensions: "1200 x 100",
    avgCpm: "$15 – $40",
  },
];

export function AdPlacementGuide() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Ad Placement Guide</h2>
        <p className="text-sm text-muted-foreground">
          Choose the right placement for your campaign goals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placements.map((p) => (
          <Card key={p.type} className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p.icon className="h-4 w-4 text-neon-orange" />
                </div>
                <CardTitle className="text-sm">{p.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{p.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Size</span>
                <Badge variant="outline" className="text-[10px]">{p.dimensions}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg CPM</span>
                <span className="font-medium text-cyber-green">{p.avgCpm}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
