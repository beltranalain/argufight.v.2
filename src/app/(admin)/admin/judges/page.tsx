"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale } from "lucide-react";

export default function AdminJudgesPage() {
  const { data: judges, isLoading } = trpc.admin.judges.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">AI Judges</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(judges ?? []).map((judge) => (
            <div
              key={judge.id}
              className="rounded-xl border border-border/50 bg-card/80 p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-electric-blue/10 flex items-center justify-center text-lg shrink-0">
                  {judge.emoji}
                </div>
                <div>
                  <h3 className="font-semibold">{judge.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{judge.personality}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {judge.description}
              </p>
              <div className="flex gap-2 text-[10px]">
                <span className="text-muted-foreground">
                  Debates judged: <span className="text-foreground font-mono">{judge.debates_judged}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
