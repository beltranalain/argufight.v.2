"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";

interface BeltTransferAnimProps {
  fromUsername: string;
  toUsername: string;
  beltName: string;
  onComplete?: () => void;
}

export function BeltTransferAnim({
  fromUsername,
  toUsername,
  beltName,
  onComplete,
}: BeltTransferAnimProps) {
  const [phase, setPhase] = useState<"start" | "moving" | "landed" | "done">("start");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("moving"), 500),
      setTimeout(() => setPhase("landed"), 2000),
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-80 h-48">
        {/* From user */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
          <div className="rounded-full h-16 w-16 bg-muted flex items-center justify-center mx-auto border-2 border-border">
            <span className="text-lg font-bold">
              {fromUsername.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-medium mt-2">{fromUsername}</p>
        </div>

        {/* Belt icon (animated) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-[1500ms] ease-in-out ${
            phase === "start"
              ? "left-8"
              : phase === "moving"
                ? "left-[calc(100%-4rem)]"
                : "left-[calc(100%-4rem)]"
          }`}
        >
          <div
            className={`rounded-full h-12 w-12 flex items-center justify-center transition-all duration-500 ${
              phase === "landed"
                ? "bg-neon-orange/20 border-2 border-neon-orange scale-125"
                : "bg-neon-orange/10 border border-neon-orange/50"
            }`}
          >
            <Award
              className={`h-6 w-6 text-neon-orange transition-transform duration-500 ${
                phase === "moving" ? "animate-spin" : ""
              } ${phase === "landed" ? "scale-110" : ""}`}
            />
          </div>
        </div>

        {/* To user */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
          <div
            className={`rounded-full h-16 w-16 flex items-center justify-center mx-auto border-2 transition-colors duration-500 ${
              phase === "landed"
                ? "bg-neon-orange/10 border-neon-orange"
                : "bg-muted border-border"
            }`}
          >
            <span className="text-lg font-bold">
              {toUsername.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <p className="text-sm font-medium mt-2">{toUsername}</p>
        </div>

        {/* Belt name label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p
            className={`text-sm font-semibold text-neon-orange transition-opacity duration-500 ${
              phase === "landed" ? "opacity-100" : "opacity-0"
            }`}
          >
            {beltName} transferred!
          </p>
        </div>
      </div>
    </div>
  );
}
