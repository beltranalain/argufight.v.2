"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    PENDING: "bg-neon-orange text-black",
    APPROVED: "bg-cyber-green text-black",
    REJECTED: "bg-red-500 text-white",
    SUSPENDED: "bg-red-500 text-white",
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-neon-orange" />
        <h1 className="text-[24px] font-extrabold text-foreground">Advertiser Settings</h1>
      </div>

      {/* Account Status Card */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-af-border">
          <h2 className="text-sm font-bold text-foreground">Account Status</h2>
          <span
            className={`inline-flex px-[10px] py-[3px] rounded-[6px] text-[11px] font-bold ${statusColors[profile.status] ?? "bg-muted text-muted-foreground"}`}
          >
            {profile.status}
          </span>
        </div>
        <div className="p-6 text-sm text-text-secondary space-y-1">
          <p>Email: {profile.contact_email}</p>
          <p>Industry: {profile.industry}</p>
          {profile.stripe_account_id && <p>Stripe: Connected</p>}
        </div>
      </div>

      {/* Company Info Card */}
      <div className="bg-bg-secondary border border-af-border rounded-[14px] overflow-hidden">
        <div className="p-6 border-b border-af-border">
          <h2 className="text-sm font-bold text-foreground">Company Info</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Website</Label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <div>
            <Label className="text-[13px] text-text-secondary mb-1.5 block">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-bg-tertiary border-af-border"
            />
          </div>
          <button
            onClick={() =>
              updateSettings.mutate({
                companyName,
                website,
                contactPhone: phone || undefined,
              })
            }
            disabled={updateSettings.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-electric-blue text-black font-bold text-sm hover:bg-[#00b8e6] transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
