"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Type, Layout } from "lucide-react";

const contentSections = [
  {
    title: "Homepage Sections",
    description: "Manage homepage hero, features, testimonials, and CTA sections",
    icon: Layout,
    count: "6 sections",
  },
  {
    title: "Images & Media",
    description: "Upload and manage images, icons, and media files",
    icon: Image,
    count: "Media library",
  },
  {
    title: "Static Pages",
    description: "Edit About, How It Works, FAQ, and other static pages",
    icon: FileText,
    count: "5 pages",
  },
  {
    title: "Text & Copy",
    description: "Manage UI text, labels, and microcopy across the platform",
    icon: Type,
    count: "Global",
  },
];

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Content CMS</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contentSections.map((section) => (
          <Card key={section.title} className="border-border/50 bg-card/80 hover:border-electric-blue/30 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/50 p-2">
                  <section.icon className="h-5 w-5 text-electric-blue" />
                </div>
                <div>
                  <CardTitle className="text-sm">{section.title}</CardTitle>
                  <p className="text-[10px] text-muted-foreground">{section.count}</p>
                </div>
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
