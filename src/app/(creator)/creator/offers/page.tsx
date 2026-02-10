"use client";

import { trpc } from "@/lib/trpc-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Handshake, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const offerStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  ACCEPTED: "bg-cyber-green/10 text-cyber-green border-cyber-green/30",
  DECLINED: "bg-destructive/10 text-destructive border-destructive/30",
  COUNTERED: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  EXPIRED: "bg-muted text-muted-foreground",
};

export default function CreatorOffersPage() {
  const { data: offers, isLoading } = trpc.creator.offers.useQuery();
  const utils = trpc.useUtils();
  const [counterTarget, setCounterTarget] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const respondOffer = trpc.creator.respondOffer.useMutation({
    onSuccess: () => {
      toast.success("Offer response sent");
      utils.creator.offers.invalidate();
      utils.creator.stats.invalidate();
      setCounterTarget(null);
      setCounterAmount("");
      setCounterMessage("");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Handshake className="h-6 w-6 text-cyber-green" />
        <h1 className="text-2xl font-bold">Offers</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (offers ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No offers yet. Advertisers will find you through the marketplace.
        </p>
      ) : (
        <div className="space-y-3">
          {(offers ?? []).map((offer) => (
            <div
              key={offer.id}
              className="rounded-xl border border-border/50 bg-card/80 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{offer.campaigns?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    from {offer.advertisers?.company_name}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${offerStatusColors[offer.status] ?? ""}`}>
                  {offer.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Placement</p>
                  <p className="font-medium">{offer.placement.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold text-cyber-green">${Number(offer.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p>{offer.duration} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p>{formatDistanceToNow(new Date(offer.expires_at), { addSuffix: true })}</p>
                </div>
              </div>

              {offer.message && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  "{offer.message}"
                </p>
              )}

              {offer.counter_amount && (
                <div className="mt-2 text-xs rounded-lg bg-neon-orange/5 border border-neon-orange/20 p-2">
                  Counter: ${Number(offer.counter_amount).toFixed(2)}
                  {offer.counter_message && ` — "${offer.counter_message}"`}
                </div>
              )}

              {(offer.status === "PENDING" || offer.status === "COUNTERED") && (
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-cyber-green text-black hover:bg-cyber-green/90"
                    disabled={respondOffer.isPending}
                    onClick={() => respondOffer.mutate({ offerId: offer.id, action: "ACCEPT" })}
                  >
                    {respondOffer.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCounterTarget(offer.id)}
                  >
                    <ArrowRight className="mr-1 h-3 w-3" />
                    Counter
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={respondOffer.isPending}
                    onClick={() => respondOffer.mutate({ offerId: offer.id, action: "DECLINE" })}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter Dialog */}
      <Dialog open={!!counterTarget} onOpenChange={() => setCounterTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Input
                type="number"
                step="0.01"
                placeholder="Your counter amount ($)"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Message (optional)"
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
            />
            <Button
              onClick={() =>
                respondOffer.mutate({
                  offerId: counterTarget!,
                  action: "COUNTER",
                  counterAmount: parseFloat(counterAmount),
                  counterMessage: counterMessage || undefined,
                })
              }
              disabled={!counterAmount}
            >
              Send Counter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
