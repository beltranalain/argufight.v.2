"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdvertiserSettingsPage() {
  const { data: profile, isLoading } = trpc.advertiser.profile.useQuery();
  const utils = trpc.useUtils();

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name);
      setWebsite(profile.website);
      setPhone(profile.contact_phone ?? "");
    }
  }, [profile]);

  const updateSettings = trpc.advertiser.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated");
      utils.advertiser.profile.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return null;

  if (!profile) {
    return <p className="text-muted-foreground">No advertiser profile found.</p>;
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500",
    APPROVED: "bg-cyber-green/10 text-cyber-green",
    REJECTED: "bg-destructive/10 text-destructive",
    SUSPENDED: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-neon-orange" />
        <h1 className="text-2xl font-bold">Advertiser Settings</h1>
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Account Status</CardTitle>
            <Badge variant="outline" className={statusColors[profile.status] ?? ""}>
              {profile.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Email: {profile.contact_email}</p>
          <p>Industry: {profile.industry}</p>
          {profile.stripe_account_id && (
            <p>Stripe: Connected</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-sm">Company Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button
            onClick={() =>
              updateSettings.mutate({
                companyName,
                website,
                contactPhone: phone || undefined,
              })
            }
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
