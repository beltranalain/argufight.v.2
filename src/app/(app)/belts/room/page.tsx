"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { BeltCard } from "@/components/belt/belt-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Shield, Crown, Swords } from "lucide-react";

type BeltType = "ROOKIE" | "CATEGORY" | "CHAMPIONSHIP" | "UNDEFEATED" | "TOURNAMENT";

const beltTypeInfo: Record<string, { icon: typeof Award; color: string; desc: string }> = {
  ROOKIE: { icon: Shield, color: "text-cyber-green", desc: "Entry-level belts for new debaters" },
  CATEGORY: { icon: Award, color: "text-electric-blue", desc: "Category-specific championships" },
  CHAMPIONSHIP: { icon: Crown, color: "text-neon-orange", desc: "The ultimate titles" },
  UNDEFEATED: { icon: Swords, color: "text-hot-pink", desc: "Unbroken win streaks" },
  TOURNAMENT: { icon: Crown, color: "text-yellow-400", desc: "Won through tournaments" },
};

export default function BeltRoomPage() {
  const [typeFilter, setTypeFilter] = useState<BeltType | "ALL">("ALL");

  const { data: belts, isLoading } = trpc.belt.list.useQuery({
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  // Group belts by type
  const grouped = (belts ?? []).reduce<Record<string, typeof belts>>((acc, belt) => {
    const key = belt.type;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(belt);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-neon-orange" />
          Belt Championship Room
        </h1>
        <p className="text-sm text-muted-foreground">
          Challenge belt holders or claim vacant titles
        </p>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BeltType | "ALL")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Belt Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="ROOKIE">Rookie</SelectItem>
            <SelectItem value="CATEGORY">Category</SelectItem>
            <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
            <SelectItem value="UNDEFEATED">Undefeated</SelectItem>
            <SelectItem value="TOURNAMENT">Tournament</SelectItem>
          </SelectContent>
        </Select>
        {typeFilter !== "ALL" && (
          <Badge variant="outline" className="text-xs">
            {(belts ?? []).length} belts
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (belts ?? []).length === 0 ? (
        <div className="py-16 text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No belts found.</p>
        </div>
      ) : typeFilter !== "ALL" ? (
        // Flat list when filtered
        <div className="grid gap-4 sm:grid-cols-2">
          {belts?.map((belt) => <BeltCard key={belt.id} belt={belt} />)}
        </div>
      ) : (
        // Grouped by type
        Object.entries(grouped).map(([type, typeBelts]) => {
          const info = beltTypeInfo[type];
          const Icon = info?.icon ?? Award;
          return (
            <section key={type}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`h-5 w-5 ${info?.color ?? ""}`} />
                <h2 className="text-lg font-semibold">{type} Belts</h2>
                <span className="text-xs text-muted-foreground">
                  {info?.desc}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {typeBelts?.map((belt) => <BeltCard key={belt.id} belt={belt} />)}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
