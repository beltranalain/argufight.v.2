"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FallacyAnnotation {
  fallacyType: string;
  explanation: string;
  confidence: number;
  excerpt: string;
}

interface FallacyAnnotationsProps {
  fallacies: FallacyAnnotation[];
}

const confidenceColor = (c: number) => {
  if (c >= 0.8) return "bg-destructive/10 text-destructive border-destructive/30";
  if (c >= 0.6) return "bg-neon-orange/10 text-neon-orange border-neon-orange/30";
  return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
};

export function FallacyAnnotations({ fallacies }: FallacyAnnotationsProps) {
  if (fallacies.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <AlertTriangle className="h-3 w-3" />
          <span>Fallacies Detected</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {fallacies.map((f, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`text-[10px] cursor-help ${confidenceColor(f.confidence)}`}
                >
                  {f.fallacyType}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs font-medium mb-1">{f.fallacyType}</p>
                <p className="text-[11px] text-muted-foreground">{f.explanation}</p>
                {f.excerpt && (
                  <p className="text-[10px] italic mt-1 text-muted-foreground/70">
                    &quot;{f.excerpt}&quot;
                  </p>
                )}
                <p className="text-[10px] mt-1">
                  Confidence: {Math.round(f.confidence * 100)}%
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
