"use client";

import { Button } from "@/components/ui/button";

interface PositionSelectorProps {
  value?: string;
  onChange: (position: string) => void;
}

const positions = [
  { value: "FOR", label: "For", description: "Argue in favor" },
  { value: "AGAINST", label: "Against", description: "Argue against" },
  { value: "NEUTRAL", label: "Neutral", description: "No pre-set stance" },
];

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {positions.map((pos) => (
        <Button
          key={pos.value}
          type="button"
          variant={value === pos.value ? "default" : "outline"}
          className={`flex flex-col h-auto py-3 ${
            value === pos.value
              ? "bg-electric-blue text-black hover:bg-electric-blue/90"
              : ""
          }`}
          onClick={() => onChange(pos.value)}
        >
          <span className="font-medium text-sm">{pos.label}</span>
          <span className="text-[10px] opacity-70">{pos.description}</span>
        </Button>
      ))}
    </div>
  );
}
