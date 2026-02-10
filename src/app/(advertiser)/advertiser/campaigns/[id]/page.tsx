"use client";

import { trpc } from "@/lib/trpc-client";
import { ArrowLeft, Eye, MousePointer, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const statusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-neon-orange text-black",
  APPROVED: "bg-electric-blue text-black",
  ACTIVE: "bg-cyber-green text-black",
  PAUSED: "bg-yellow-500 text-black",
  COMPLETED: "bg-blue-500 text-white",
  REJECTED: "bg-red-500 text-white",
};

const offerStatusColors: Record<string, string> = {
  PENDING: "bg-neon-orange text-black",
  ACCEPTED: "bg-cyber-green text-black",
  DECLINED: "bg-red-500 text-white",
  COUNTERED: "bg-neon-orange/80 text-black",
  EXPIRED: "bg-bg-tertiary text-muted-foreground",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const { data: campaign, isLoading } = trpc.advertiser.campaign.useQuery({
    id: params.id as string,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-bg-secondary animate-pulse" />
        <div className="h-64 rounded-[14px] bg-bg-secondary border border-af-border animate-pulse" />
      </div>
    );
  }

  if (!campaign) {
    return <p className="text-muted-foreground">Campaign not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/advertiser/dashboard"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-tertiary border border-af-border hover:border-electric-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${statusColors[campaign.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {campaign.status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-muted-foreground uppercase">
              {campaign.type.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="af-stat-card stat-orange">
          <div className="flex items-center gap-3">
            <div className="af-stat-card-icon">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Budget</p>
              <p className="text-lg font-bold text-foreground">${Number(campaign.budget).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="af-stat-card stat-blue">
          <div className="flex items-center gap-3">
            <div className="af-stat-card-icon">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Impressions</p>
              <p className="text-lg font-bold text-foreground">{campaign._count.impressions.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="af-stat-card stat-green">
          <div className="flex items-center gap-3">
            <div className="af-stat-card-icon">
              <MousePointer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Clicks</p>
              <p className="text-lg font-bold text-foreground">{campaign._count.clicks.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details Card */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-sm font-bold text-foreground">Campaign Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-foreground font-medium">{campaign.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CTA</p>
              <p className="text-foreground font-medium">{campaign.cta_text}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start</p>
              <p className="text-foreground font-medium">{new Date(campaign.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End</p>
              <p className="text-foreground font-medium">{new Date(campaign.end_date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <a
                href={campaign.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-blue hover:underline flex items-center gap-1 text-sm"
              >
                {campaign.destination_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Offers */}
      {campaign.offers.length > 0 && (
        <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
          <div className="p-6 border-b border-af-border">
            <h2 className="text-sm font-bold text-foreground">
              Creator Offers ({campaign.offers.length})
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {campaign.offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between rounded-[10px] bg-bg-tertiary border border-af-border p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{offer.users?.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {offer.placement.replace(/_/g, " ")} &middot; ${Number(offer.amount).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${offerStatusColors[offer.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {offer.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
