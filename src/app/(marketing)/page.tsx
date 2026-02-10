import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Swords,
  Brain,
  Trophy,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react";

const features = [
  {
    icon: Swords,
    title: "Multi-Round Debates",
    description:
      "Challenge opponents to structured debates with timed arguments across multiple rounds.",
    color: "text-electric-blue",
  },
  {
    icon: Brain,
    title: "7 AI Judges",
    description:
      "Each debate is scored by 7 unique AI personalities with distinct judging styles and perspectives.",
    color: "text-neon-orange",
  },
  {
    icon: Trophy,
    title: "Tournaments",
    description:
      "Compete in bracket-style tournaments with up to 64 participants and win prizes.",
    color: "text-cyber-green",
  },
  {
    icon: Award,
    title: "Belt Championships",
    description:
      "Challenge belt holders in specific categories and become the champion debater.",
    color: "text-hot-pink",
  },
  {
    icon: TrendingUp,
    title: "ELO Rankings",
    description:
      "Climb the global leaderboard with our ELO-based rating system as you win debates.",
    color: "text-electric-blue",
  },
  {
    icon: Users,
    title: "Live Spectating",
    description:
      "Watch debates in real-time, vote on rounds, and react to arguments as they happen.",
    color: "text-neon-orange",
  },
  {
    icon: Zap,
    title: "AI Coaching",
    description:
      "Get personalized feedback on your arguments with AI-powered post-debate coaching reports.",
    color: "text-cyber-green",
  },
  {
    icon: Shield,
    title: "Fallacy Detection",
    description:
      "Real-time AI analysis identifies logical fallacies in arguments for spectators.",
    color: "text-hot-pink",
  },
];

const stats = [
  { value: "50K+", label: "Active Debaters" },
  { value: "200K+", label: "Debates Completed" },
  { value: "7", label: "AI Judges" },
  { value: "30+", label: "Categories" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-background to-background" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center md:py-32 lg:py-40">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-electric-blue">Argue Smarter.</span>
            <br />
            <span className="text-neon-orange">Win Debates.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            The AI-judged debate platform where arguments are settled with logic,
            not volume. Challenge opponents, sharpen your reasoning, and let 7
            unique AI judges deliver the verdict.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-electric-blue text-black hover:bg-electric-blue/90 px-8"
              asChild
            >
              <Link href="/signup">Start Debating Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-card/50">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-electric-blue">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything You Need to Debate
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A complete platform designed for structured argumentation and
            competitive debate.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card/80 p-6 backdrop-blur transition-colors hover:border-electric-blue/30"
            >
              <feature.icon
                className={`h-8 w-8 ${feature.color} transition-transform group-hover:scale-110`}
              />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Challenge",
                desc: "Pick a topic, choose your position, and send a challenge to any debater.",
              },
              {
                step: "2",
                title: "Debate",
                desc: "Exchange arguments across multiple rounds with timed submissions.",
              },
              {
                step: "3",
                title: "Verdict",
                desc: "7 AI judges score your arguments and declare a winner with detailed reasoning.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-electric-blue text-xl font-bold text-black">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
        <h2 className="text-3xl font-bold md:text-4xl">
          Ready to Test Your Arguments?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join thousands of debaters honing their reasoning skills on ArguFight.
          Free to start, no credit card required.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-electric-blue text-black hover:bg-electric-blue/90 px-8"
            asChild
          >
            <Link href="/signup">Create Free Account</Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link href="/debates">Browse Debates</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
