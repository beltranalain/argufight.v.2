"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"PLATFORM_ADS" | "CREATOR_SPONSORSHIP" | "TOURNAMENT_SPONSORSHIP">("PLATFORM_ADS");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [ctaText, setCtaText] = useState("Learn More");

  const createCampaign = trpc.advertiser.createCampaign.useMutation({
    onSuccess: (campaign) => {
      toast.success("Campaign created and submitted for review");
      router.push(`/advertiser/campaigns/${campaign.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!name || !category || !budget || !startDate || !endDate || !destinationUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    createCampaign.mutate({
      name,
      type,
      category,
      budget: parseFloat(budget),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      destinationUrl,
      ctaText,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/advertiser/dashboard"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-tertiary border border-af-border hover:border-electric-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Megaphone className="h-6 w-6 text-neon-orange" />
        <h1 className="text-[24px] font-extrabold text-foreground">Create Campaign</h1>
      </div>

      {/* Form Card */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-sm font-bold text-foreground">Campaign Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Campaign Name *</Label>
            <Input
              placeholder="e.g. Summer Debate Series Promotion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[13px] text-text-secondary mb-1.5 block">Campaign Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="bg-bg-tertiary border-af-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLATFORM_ADS">Platform Ads</SelectItem>
                  <SelectItem value="CREATOR_SPONSORSHIP">Creator Sponsorship</SelectItem>
                  <SelectItem value="TOURNAMENT_SPONSORSHIP">Tournament Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-text-secondary mb-1.5 block">Category *</Label>
              <Input
                placeholder="e.g. Education, Technology"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-bg-tertiary border-af-border"
              />
            </div>
          </div>

          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Budget ($) *</Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="Campaign budget in USD"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[13px] text-text-secondary mb-1.5 block">Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-bg-tertiary border-af-border"
              />
            </div>
            <div>
              <Label className="text-[13px] text-text-secondary mb-1.5 block">End Date *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-bg-tertiary border-af-border"
              />
            </div>
          </div>

          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Destination URL *</Label>
            <Input
              type="url"
              placeholder="https://your-website.com/landing-page"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>

          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">CTA Text</Label>
            <Input
              placeholder="Learn More"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={createCampaign.isPending}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] bg-neon-orange text-black font-bold text-sm hover:bg-neon-orange/90 transition-colors disabled:opacity-50"
          >
            {createCampaign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Megaphone className="h-4 w-4" />
            Submit Campaign for Review
          </button>
        </div>
      </div>
    </div>
  );
}
