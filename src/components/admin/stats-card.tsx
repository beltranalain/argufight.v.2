"use client";

import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "pink" | "green" | "orange";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
  className = "",
}: StatsCardProps) {
  return (
    <div className={`af-stat-card stat-${color} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="af-stat-card-title">{title}</span>
        <div className="af-stat-card-icon">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="af-stat-card-value">{value}</div>
      {description && (
        <p className="af-stat-card-desc">{description}</p>
      )}
      {trend && (
        <p
          className={`text-xs mt-1 ${
            trend.value > 0
              ? "text-cyber-green"
              : trend.value < 0
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {trend.value > 0 ? "+" : ""}
          {trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
