"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Calendar, Mail, Share2 } from "lucide-react";

const marketingTools = [
  {
    title: "Campaign Calendar",
    description: "Plan and schedule marketing campaigns, seasonal events, and promotions",
    icon: Calendar,
  },
  {
    title: "Newsletter",
    description: "Compose and send email newsletters to platform users via Resend",
    icon: Mail,
  },
  {
    title: "Social Posts",
    description: "Draft and schedule social media posts for debate highlights and announcements",
    icon: Share2,
  },
  {
    title: "Growth Strategy",
    description: "Track user acquisition funnels, referral programs, and retention metrics",
    icon: Megaphone,
  },
];

export default function AdminMarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Marketing</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {marketingTools.map((tool) => (
          <Card key={tool.title} className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <tool.icon className="h-5 w-5 text-electric-blue" />
                </div>
                <CardTitle className="text-sm">{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
