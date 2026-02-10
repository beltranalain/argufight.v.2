"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, DollarSign, BarChart3 } from "lucide-react";

const creatorSections = [
  {
    title: "Active Creators",
    description: "Manage approved creators, their profiles, and marketplace listings",
    icon: Users,
  },
  {
    title: "Pending Applications",
    description: "Review and approve new creator applications",
    icon: Sparkles,
  },
  {
    title: "Earnings Overview",
    description: "Track creator earnings, platform commissions, and payout schedules",
    icon: DollarSign,
  },
  {
    title: "Marketplace Analytics",
    description: "Offers sent, accepted, declined, and overall marketplace health metrics",
    icon: BarChart3,
  },
];

export default function AdminCreatorMarketplacePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Creator Marketplace</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {creatorSections.map((section) => (
          <Card key={section.title} className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <section.icon className="h-5 w-5 text-electric-blue" />
                </div>
                <CardTitle className="text-sm">{section.title}</CardTitle>
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
