"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Check, DollarSign, Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const benefits = [
  { icon: DollarSign, title: "Earn Money", description: "Get paid for sponsorships and ad placements on your debates" },
  { icon: Users, title: "Grow Your Audience", description: "Access brand partnerships that increase your visibility" },
  { icon: Shield, title: "Platform Support", description: "Dedicated creator support and escrow payment protection" },
];

export default function CreatorSetupPage() {
  const router = useRouter();
  const { data: status } = trpc.creator.status.useQuery();

  const setup = trpc.creator.setup.useMutation({
    onSuccess: () => {
      toast.success("Welcome to the Creator Program!");
      router.push("/creator/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  if (status?.isCreator) {
    router.push("/creator/dashboard");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto mb-4 rounded-full bg-cyber-green/10 p-4 w-fit">
          <Sparkles className="h-8 w-8 text-cyber-green" />
        </div>
        <h1 className="text-2xl font-bold">Join the Creator Program</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Start earning money by partnering with advertisers on ArguFight.
        </p>
      </div>

      <div className="grid gap-4">
        {benefits.map((b) => (
          <Card key={b.title} className="border-border/50 bg-card/80">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="rounded-lg bg-cyber-green/10 p-2 shrink-0">
                <b.icon className="h-5 w-5 text-cyber-green" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-cyber-green/30 bg-cyber-green/5">
        <CardHeader>
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Sign up as a creator (free)",
            "Advertisers find you through the marketplace",
            "Review and accept sponsorship offers",
            "Display ads on your debates and earn money",
            "Get paid via Stripe Connect",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Check className="h-3.5 w-3.5 text-cyber-green shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={() => setup.mutate({})}
        disabled={setup.isPending}
        className="w-full bg-cyber-green text-black hover:bg-cyber-green/90"
      >
        {setup.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Become a Creator
      </Button>
    </div>
  );
}
