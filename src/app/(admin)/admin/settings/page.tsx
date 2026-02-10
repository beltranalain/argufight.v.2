"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, Mail, CreditCard, Database } from "lucide-react";

const configSections = [
  {
    title: "API Keys",
    description: "Manage environment variables and API keys for third-party services",
    icon: Key,
    items: [
      { label: "Stripe", status: process.env.NEXT_PUBLIC_STRIPE_KEY ? "Connected" : "Not set" },
      { label: "DeepSeek", status: "Check server" },
      { label: "OpenAI", status: "Check server" },
      { label: "Supabase", status: "Connected" },
    ],
  },
  {
    title: "Email (Resend)",
    description: "Email delivery configuration and test sending",
    icon: Mail,
    items: [
      { label: "Provider", status: "Resend" },
      { label: "Domain", status: "argufight.com" },
    ],
  },
  {
    title: "Payments (Stripe)",
    description: "Stripe mode, webhook status, and payment configuration",
    icon: CreditCard,
    items: [
      { label: "Mode", status: "Test" },
      { label: "Webhook", status: "Active" },
    ],
  },
  {
    title: "Database",
    description: "Database connection status, pool size, and health metrics",
    icon: Database,
    items: [
      { label: "Provider", status: "Supabase PostgreSQL" },
      { label: "Pooler", status: "PgBouncer (port 6543)" },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {configSections.map((section) => (
          <Card key={section.title} className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <section.icon className="h-5 w-5 text-electric-blue" />
                </div>
                <div>
                  <CardTitle className="text-sm">{section.title}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
