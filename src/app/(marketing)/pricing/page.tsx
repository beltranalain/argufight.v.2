import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "ArguFight pricing plans — free and pro tiers.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for casual debaters",
    features: [
      "5 debates per day",
      "AI judge verdicts",
      "ELO ranking",
      "Public profile",
      "Basic stats",
      "Coin earning",
      "Tournament entry",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For competitive debaters",
    features: [
      "Unlimited debates",
      "AI judge verdicts",
      "AI coaching reports",
      "Advanced analytics",
      "Priority matchmaking",
      "Custom themes",
      "2x coin earning",
      "Belt challenges",
      "Tournament creation",
      "Ad-free experience",
    ],
    cta: "Upgrade to Pro",
    href: "/signup?plan=pro",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Simple Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Start free. Upgrade when you&apos;re ready to compete.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-8 ${
              plan.highlighted
                ? "border-electric-blue bg-electric-blue/5"
                : "border-border/50 bg-card/80"
            }`}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-cyber-green" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`mt-8 w-full ${
                plan.highlighted
                  ? "bg-electric-blue text-black hover:bg-electric-blue/90"
                  : ""
              }`}
              variant={plan.highlighted ? "default" : "outline"}
              asChild
            >
              <Link href={plan.href}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
