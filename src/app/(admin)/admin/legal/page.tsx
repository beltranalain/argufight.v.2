"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, Shield, Cookie } from "lucide-react";
import Link from "next/link";

const legalPages = [
  {
    title: "Terms of Service",
    description: "Platform terms, user agreements, and dispute resolution policies",
    icon: FileText,
    href: "/terms",
  },
  {
    title: "Privacy Policy",
    description: "Data collection, usage, sharing, and user rights documentation",
    icon: Shield,
    href: "/privacy",
  },
  {
    title: "Cookie Policy",
    description: "Cookie usage, tracking, and consent management",
    icon: Cookie,
    href: "#",
  },
  {
    title: "Community Guidelines",
    description: "Debate conduct rules, content policies, and enforcement",
    icon: Scale,
    href: "#",
  },
];

export default function AdminLegalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Legal Pages</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {legalPages.map((page) => (
          <Link key={page.title} href={page.href}>
            <Card className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <page.icon className="h-5 w-5 text-electric-blue" />
                  </div>
                  <CardTitle className="text-sm">{page.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{page.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
