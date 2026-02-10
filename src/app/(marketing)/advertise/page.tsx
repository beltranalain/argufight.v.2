import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, BarChart3, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach engaged, intelligent audiences on ArguFight.",
};

const benefits = [
  {
    icon: Target,
    title: "Targeted Placement",
    description:
      "Place ads on specific debate categories, user demographics, or during live debates.",
  },
  {
    icon: Users,
    title: "Engaged Audience",
    description:
      "Our users are active, intelligent, and spend an average of 20+ minutes per session.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track impressions, clicks, and CTR with our real-time campaign dashboard.",
  },
  {
    icon: Zap,
    title: "Creator Marketplace",
    description:
      "Partner directly with top debaters for sponsored content and endorsements.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Advertise on ArguFight
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Reach a highly engaged audience of critical thinkers, debaters, and
          lifelong learners.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-xl border border-border/50 bg-card/80 p-6"
          >
            <benefit.icon className="h-8 w-8 text-electric-blue" />
            <h3 className="mt-4 font-semibold">{benefit.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button
          size="lg"
          className="bg-electric-blue text-black hover:bg-electric-blue/90 px-8"
          asChild
        >
          <Link href="/signup?type=advertiser">Apply as Advertiser</Link>
        </Button>
      </div>
    </div>
  );
}
