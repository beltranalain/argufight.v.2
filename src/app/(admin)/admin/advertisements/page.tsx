"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorPlay, BarChart3, DollarSign, Users } from "lucide-react";

const adSections = [
  {
    title: "Campaign Review",
    description: "Review and approve pending advertiser campaigns before they go live",
    icon: MonitorPlay,
    stat: "0 pending",
  },
  {
    title: "Performance",
    description: "Track impressions, clicks, CTR, and spend across all active campaigns",
    icon: BarChart3,
    stat: "Overview",
  },
  {
    title: "Revenue",
    description: "Advertising revenue, payout tracking, and commission management",
    icon: DollarSign,
    stat: "Revenue",
  },
  {
    title: "Advertisers",
    description: "Manage advertiser accounts, approvals, and platform access",
    icon: Users,
    stat: "Accounts",
  },
];

export default function AdminAdvertisementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MonitorPlay className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Advertisements</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adSections.map((section) => (
          <Card key={section.title} className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <section.icon className="h-5 w-5 text-electric-blue" />
                  </div>
                  <CardTitle className="text-sm">{section.title}</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">{section.stat}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
