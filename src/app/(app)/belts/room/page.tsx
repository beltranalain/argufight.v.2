"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { BeltCard } from "@/components/belt/belt-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  const { data: belts, isLoading } = trpc.belt.list.useQuery({ type: typeFilter === "ALL" ? undefined : typeFilter });
  const grouped = (belts ?? []).reduce<Record<string, typeof belts>>((acc, belt) => { const key = belt.type; if (!acc[key]) acc[key] = []; acc[key]!.push(belt); return acc; }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-neon-orange" /> Belt Championship Room
        </h1>
        <p className="text-[13px] text-text-secondary">Challenge belt holders or claim vacant titles</p>
      </div>
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BeltType | "ALL")}>
          <SelectTrigger className="w-48 bg-bg-tertiary border-af-border"><SelectValue placeholder="Belt Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="ROOKIE">Rookie</SelectItem>
            <SelectItem value="CATEGORY">Category</SelectItem>
            <SelectItem value="CHAMPIONSHIP">Championship</SelectItem>
            <SelectItem value="UNDEFEATED">Undefeated</SelectItem>
            <SelectItem value="TOURNAMENT">Tournament</SelectItem>
          </SelectContent>
        </Select>
        {typeFilter !== "ALL" && <span className="inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold bg-muted text-muted-foreground">{(belts ?? []).length} belts</span>}
      </div>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-36 w-full rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />))}</div>
      ) : (belts ?? []).length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-af-border rounded-[14px]">
          <Award className="w-12 h-12 mx-auto mb-4 text-electric-blue opacity-60" />
          <p className="text-base font-bold text-foreground">No belts found</p>
          <p className="text-[13px] text-muted-foreground mt-1">Try adjusting your filter.</p>
        </div>
      ) : typeFilter !== "ALL" ? (
        <div className="grid gap-4 sm:grid-cols-2">{belts?.map((belt) => <BeltCard key={belt.id} belt={belt} />)}</div>
      ) : (
        Object.entries(grouped).map(([type, typeBelts]) => {
          const info = beltTypeInfo[type]; const Icon = info?.icon ?? Award;
          return (<section key={type}><div className="flex items-center gap-2 mb-4"><Icon className={`h-5 w-5 ${info?.color ?? ""}`} /><h2 className="text-lg font-bold text-foreground">{type} Belts</h2><span className="text-xs text-muted-foreground">{info?.desc}</span></div><div className="grid gap-4 sm:grid-cols-2">{typeBelts?.map((belt) => <BeltCard key={belt.id} belt={belt} />)}</div></section>);
        })
      )}
    </div>
  );
}
