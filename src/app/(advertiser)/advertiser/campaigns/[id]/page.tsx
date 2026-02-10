"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, MousePointer, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  APPROVED: "bg-electric-blue/10 text-electric-blue border-electric-blue/30",
  ACTIVE: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  PAUSED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/30",
};

const offerStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500",
  ACCEPTED: "bg-cyber-green/10 text-cyber-green",
  DECLINED: "bg-destructive/10 text-destructive",
  COUNTERED: "bg-neon-orange/10 text-neon-orange",
  EXPIRED: "bg-muted text-muted-foreground",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const { data: campaign, isLoading } = trpc.advertiser.campaign.useQuery({
    id: params.id as string,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return <p className="text-muted-foreground">Campaign not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/advertiser/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`text-[10px] ${statusColors[campaign.status] ?? ""}`}>
              {campaign.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{campaign.type.replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-neon-orange" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-lg font-bold">${Number(campaign.budget).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-electric-blue" />
            <div>
              <p className="text-xs text-muted-foreground">Impressions</p>
              <p className="text-lg font-bold">{campaign._count.impressions.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-4 flex items-center gap-3">
            <MousePointer className="h-5 w-5 text-cyber-green" />
            <div>
              <p className="text-xs text-muted-foreground">Clicks</p>
              <p className="text-lg font-bold">{campaign._count.clicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Category</p>
              <p>{campaign.category}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">CTA</p>
              <p>{campaign.cta_text}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Start</p>
              <p>{new Date(campaign.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">End</p>
              <p>{new Date(campaign.end_date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Destination</p>
              <a
                href={campaign.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-blue hover:underline flex items-center gap-1 text-xs"
              >
                {campaign.destination_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers */}
      {campaign.offers.length > 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm">Creator Offers ({campaign.offers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaign.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between rounded-lg border border-border/30 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{offer.users?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {offer.placement.replace(/_/g, " ")} · ${Number(offer.amount).toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${offerStatusColors[offer.status] ?? ""}`}>
                    {offer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
