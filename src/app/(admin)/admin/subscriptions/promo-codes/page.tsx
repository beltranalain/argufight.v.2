"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc-client";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPromoCodesPage() {
  const { data: promoCodes, isLoading } = trpc.admin.promoCodes.useQuery();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const createPromo = trpc.admin.createPromoCode.useMutation({
    onSuccess: () => {
      toast.success("Promo code created");
      utils.admin.promoCodes.invalidate();
      setOpen(false);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setValidUntil("");
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (row: Record<string, unknown>) => (
        <span className="font-mono font-bold text-electric-blue">{String(row.code)}</span>
      ),
    },
    {
      key: "discountType",
      header: "Discount",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs">
          {row.discountType === "PERCENT"
            ? `${Number(row.discountValue)}%`
            : `$${Number(row.discountValue).toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs font-mono">
          {Number(row.current_uses)}/{row.max_uses != null ? String(row.max_uses) : "∞"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.is_active ? "default" : "secondary"} className="text-[10px]">
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "valid_until",
      header: "Expires",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {row.valid_until
            ? formatDistanceToNow(new Date(row.valid_until as string), { addSuffix: true })
            : "Never"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: Record<string, unknown>) => (
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(row.created_at as string), { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-electric-blue" />
        <h1 className="text-2xl font-bold">Promo Codes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto">
              <Plus className="mr-1 h-3 w-3" /> New Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code</Label>
                <Input
                  placeholder="e.g. WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as "PERCENT" | "FIXED")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">Percent</SelectItem>
                      <SelectItem value="FIXED">Fixed $</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    placeholder={discountType === "PERCENT" ? "e.g. 20" : "e.g. 5.00"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Max Uses (optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Expires (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  createPromo.mutate({
                    code,
                    discountType,
                    discountValue: parseFloat(discountValue),
                    maxUses: maxUses ? parseInt(maxUses) : undefined,
                    validFrom: new Date().toISOString(),
                    validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
                  })
                }
                disabled={!code || !discountValue}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={(promoCodes ?? []) as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No promo codes found."
      />
    </div>
  );
}
