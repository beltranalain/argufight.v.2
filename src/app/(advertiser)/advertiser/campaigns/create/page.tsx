"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, ArrowLeft } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/advertiser/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Megaphone className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Create Campaign</h1>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Campaign Name *</Label>
            <Input
              placeholder="e.g. Summer Debate Series Promotion"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Campaign Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLATFORM_ADS">Platform Ads</SelectItem>
                  <SelectItem value="CREATOR_SPONSORSHIP">Creator Sponsorship</SelectItem>
                  <SelectItem value="TOURNAMENT_SPONSORSHIP">Tournament Sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category *</Label>
              <Input
                placeholder="e.g. Education, Technology"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Budget ($) *</Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="Campaign budget in USD"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Destination URL *</Label>
            <Input
              type="url"
              placeholder="https://your-website.com/landing-page"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
            />
          </div>

          <div>
            <Label>CTA Text</Label>
            <Input
              placeholder="Learn More"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createCampaign.isPending}
            className="w-full bg-neon-orange text-black hover:bg-neon-orange/90"
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Submit Campaign for Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
