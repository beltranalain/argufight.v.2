"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdDisplayProps {
  contractId: string;
  campaignId: string;
  placement: "PROFILE_BANNER" | "POST_DEBATE" | "DEBATE_WIDGET" | "EMAIL_SHOUTOUT" | "DEBATE_SPONSORSHIP";
  creativeUrl: string;
  targetUrl: string;
  advertiserName?: string;
  className?: string;
}

export function AdDisplay({
  contractId,
  campaignId,
  placement,
  creativeUrl,
  targetUrl,
  advertiserName,
  className,
}: AdDisplayProps) {
  const impressionTracked = useRef(false);

  const trackImpression = useCallback(async () => {
    if (impressionTracked.current) return;
    impressionTracked.current = true;
    try {
      await fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, campaignId }),
      });
    } catch {
      // Silently fail — don't block rendering
    }
  }, [contractId, campaignId]);

  useEffect(() => {
    trackImpression();
  }, [trackImpression]);

  const handleClick = async () => {
    try {
      await fetch("/api/ads/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, campaignId }),
      });
    } catch {
      // Silently fail
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const placementStyles: Record<string, string> = {
    PROFILE_BANNER: "w-full h-24 sm:h-32",
    POST_DEBATE: "w-full h-20 sm:h-24",
    DEBATE_WIDGET: "w-full max-w-xs h-60",
    DEBATE_SPONSORSHIP: "w-full h-16 sm:h-20",
    EMAIL_SHOUTOUT: "w-full h-20",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-border/30 bg-card/50 cursor-pointer group",
        placementStyles[placement],
        className
      )}
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Ad creative */}
      {creativeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={creativeUrl}
          alt={`Ad by ${advertiserName ?? "advertiser"}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-muted/50 to-muted/30">
          <p className="text-xs text-muted-foreground">Sponsored</p>
        </div>
      )}

      {/* Sponsored label */}
      <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
        Sponsored
      </div>

      {/* Dismiss button (visual only — ad stays visible) */}
      <button
        className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          // Could track "ad dismissed" in analytics
        }}
        aria-label="Dismiss ad"
      >
        <X className="h-3 w-3" />
      </button>

      {/* Advertiser name on hover */}
      {advertiserName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-white/80">{advertiserName}</p>
        </div>
      )}
    </div>
  );
}
