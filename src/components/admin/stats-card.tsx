"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <Card className={`border-border/50 bg-card/80 ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
            {trend && (
              <p
                className={`text-xs mt-1 ${
                  trend.value > 0 ? "text-cyber-green" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
