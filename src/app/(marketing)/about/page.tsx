import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about ArguFight — the AI-judged debate platform.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold md:text-4xl">About ArguFight</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          ArguFight is the world&apos;s first AI-judged online debate platform.
          We believe that structured argumentation is a skill that can be
          learned, practiced, and mastered — and that AI can help make that
          process fairer and more accessible.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
        <p>
          To create a platform where anyone can engage in meaningful debate,
          develop their critical thinking skills, and have their arguments
          evaluated objectively by AI judges with diverse perspectives.
        </p>
        <h2 className="text-xl font-semibold text-foreground">How We Judge</h2>
        <p>
          Every debate is scored by 7 unique AI judges, each with a distinct
          personality and judging philosophy. This panel approach ensures balanced,
          fair verdicts that consider multiple angles of argumentation quality.
        </p>
        <h2 className="text-xl font-semibold text-foreground">
          Built for Everyone
        </h2>
        <p>
          Whether you&apos;re a seasoned debater, a student practicing
          argumentation, or someone who just loves a good argument — ArguFight
          is for you. Our tiered system ensures debaters of all skill levels
          can find competitive matches.
        </p>
      </div>
    </div>
  );
}
