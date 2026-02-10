"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, Shield } from "lucide-react";

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md";
}

export function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  if (tier === "FREE" || !tier) {
    return null;
  }

  const Icon = tier === "PRO" ? Crown : Shield;
  const sizeClass = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <Badge
      variant="outline"
      className={`${sizeClass} border-electric-blue/30 text-electric-blue gap-1`}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {tier}
    </Badge>
  );
}
