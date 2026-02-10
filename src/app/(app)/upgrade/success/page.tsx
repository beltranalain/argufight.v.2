"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc-client";

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Invalidate subscription status so it refreshes
    utils.subscription.status.invalidate();
    utils.user.me.invalidate();
  }, [utils]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center space-y-6">
      <div className="mx-auto rounded-full bg-cyber-green/10 p-4 w-fit">
        <Check className="h-12 w-12 text-cyber-green" />
      </div>

      <div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Crown className="h-6 w-6 text-neon-orange" />
          Welcome to Pro!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your subscription is now active. Enjoy unlimited debates, AI coaching, and more.
        </p>
      </div>

      <div className="rounded-xl border border-cyber-green/30 bg-cyber-green/5 p-6 text-left">
        <h2 className="font-semibold mb-3">What you just unlocked:</h2>
        <ul className="space-y-2">
          {[
            "Unlimited debates per day",
            "AI coaching reports",
            "Advanced analytics",
            "2x coin earning rate",
            "Tournament creation",
            "Ad-free experience",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-cyber-green shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          className="bg-electric-blue text-black hover:bg-electric-blue/90"
          asChild
        >
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/debates">Start Debating</Link>
        </Button>
      </div>
    </div>
  );
}
