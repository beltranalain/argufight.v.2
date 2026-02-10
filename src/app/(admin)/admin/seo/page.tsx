"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, MapPin, BarChart3 } from "lucide-react";

const seoTools = [
  {
    title: "SEO Audit",
    description: "Run automated checks for meta tags, structured data, and page speed",
    icon: Search,
    status: "Available",
  },
  {
    title: "Sitemap",
    description: "Auto-generated sitemap at /sitemap.xml with all public pages and debates",
    icon: Globe,
    status: "Active",
  },
  {
    title: "Geo Targeting",
    description: "Configure regional SEO settings and hreflang tags",
    icon: MapPin,
    status: "Available",
  },
  {
    title: "Search Console",
    description: "Integration with Google Search Console for indexing and performance",
    icon: BarChart3,
    status: "Not connected",
  },
];

export default function AdminSEOPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">SEO Tools</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {seoTools.map((tool) => (
          <Card key={tool.title} className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <tool.icon className="h-5 w-5 text-electric-blue" />
                  </div>
                  <CardTitle className="text-sm">{tool.title}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={
                    tool.status === "Active"
                      ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30 text-[10px]"
                      : "text-[10px]"
                  }
                >
                  {tool.status}
                </Badge>
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
