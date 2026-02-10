"use client";

import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  feature,
  description,
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-electric-blue/30 bg-electric-blue/5 px-3 py-2">
        <Zap className="h-4 w-4 text-electric-blue shrink-0" />
        <span className="text-xs text-muted-foreground">
          {feature} requires Pro.
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="text-electric-blue text-xs h-auto p-0 ml-auto"
          asChild
        >
          <Link href="/upgrade">Upgrade</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-electric-blue/30 bg-electric-blue/5 p-6 text-center">
      <div className="mx-auto mb-3 rounded-full bg-electric-blue/10 p-3 w-fit">
        <Zap className="h-6 w-6 text-electric-blue" />
      </div>
      <h3 className="font-semibold">{feature}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {description ?? "This feature is available on the Pro plan."}
      </p>
      <Button
        className="mt-4 bg-electric-blue text-black hover:bg-electric-blue/90"
        asChild
      >
        <Link href="/upgrade">
          Upgrade to Pro
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
