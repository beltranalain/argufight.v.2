"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Loader2, FileText, Shield, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function CreatorSettingsPage() {
  const { data: status, isLoading: statusLoading } = trpc.creator.status.useQuery();
  const { data: taxInfo, isLoading: taxLoading } = trpc.creator.taxInfo.useQuery();
  const utils = trpc.useUtils();

  const [legalName, setLegalName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [taxIdType, setTaxIdType] = useState("");
  const [taxId, setTaxId] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (taxInfo) {
      setLegalName(taxInfo.legal_name ?? "");
      setBusinessName(taxInfo.business_name ?? "");
      setBusinessType(taxInfo.business_type ?? "");
      setTaxIdType(taxInfo.tax_id_type ?? "");
      setTaxId(taxInfo.tax_id ?? "");
      setAddressLine1(taxInfo.address_line1 ?? "");
      setCity(taxInfo.city ?? "");
      setState(taxInfo.state ?? "");
      setZipCode(taxInfo.zip_code ?? "");
      setCountry(taxInfo.country ?? "");
    }
  }, [taxInfo]);

  const updateTaxInfo = trpc.creator.updateTaxInfo.useMutation({
    onSuccess: () => {
      toast.success("Tax info updated");
      utils.creator.taxInfo.invalidate();
      utils.creator.status.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const isLoading = statusLoading || taxLoading;

  const statusColors: Record<string, string> = {
    BRONZE: "bg-amber-700/10 text-amber-600 border-amber-700/30",
    SILVER: "bg-gray-400/10 text-gray-400 border-gray-400/30",
    GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    PLATINUM: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-cyber-green" />
        <h1 className="text-2xl font-bold">Creator Settings</h1>
      </div>

      {/* Status Overview */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyber-green" />
              <CardTitle className="text-sm">Creator Status</CardTitle>
            </div>
            {status?.creatorStatus && (
              <Badge variant="outline" className={statusColors[status.creatorStatus] ?? ""}>
                {status.creatorStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Creator since</span>
            <span>{status?.creatorSince ? new Date(status.creatorSince).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax info</span>
            <span>{status?.hasTaxInfo ? "Submitted" : "Not submitted"}</span>
          </div>
          <div className="flex justify-between">
            <span>Payouts</span>
            <span>{status?.payoutEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stripe / Payout */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-neon-orange" />
            <CardTitle className="text-sm">Payout Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {taxInfo?.stripe_account_id ? (
            <div className="space-y-1">
              <p>Stripe: <Badge variant="outline" className="bg-cyber-green/10 text-cyber-green text-[10px]">Connected</Badge></p>
              <p>Bank verified: {taxInfo.bank_verified ? "Yes" : "No"}</p>
            </div>
          ) : (
            <p>No Stripe account connected. Complete your tax info below to enable payouts.</p>
          )}
        </CardContent>
      </Card>

      {/* Tax Info Form */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-electric-blue" />
            <CardTitle className="text-sm">Tax Information (W-9)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Legal Name</Label>
              <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Full legal name" />
            </div>
            <div>
              <Label className="text-xs">Business Name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Business Type</Label>
              <Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Individual, LLC, etc." />
            </div>
            <div>
              <Label className="text-xs">Tax ID Type</Label>
              <Input value={taxIdType} onChange={(e) => setTaxIdType(e.target.value)} placeholder="SSN or EIN" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Tax ID</Label>
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XXX-XX-XXXX" />
          </div>
          <div>
            <Label className="text-xs">Address</Label>
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">ZIP Code</Label>
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Country</Label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="US" />
          </div>
          <Button
            onClick={() =>
              updateTaxInfo.mutate({
                legalName: legalName || undefined,
                businessName: businessName || undefined,
                businessType: businessType || undefined,
                taxIdType: taxIdType || undefined,
                taxId: taxId || undefined,
                addressLine1: addressLine1 || undefined,
                city: city || undefined,
                state: state || undefined,
                zipCode: zipCode || undefined,
                country: country || undefined,
              })
            }
            disabled={updateTaxInfo.isPending}
          >
            {updateTaxInfo.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Tax Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
