import { Metadata } from "next";
import {
  Swords,
  MessageSquare,
  Scale,
  Trophy,
  Users,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how ArguFight debates work, from challenge to verdict.",
};

const steps = [
  {
    icon: Swords,
    title: "1. Create a Challenge",
    description:
      "Pick a debate topic, choose the number of rounds (1-5), select your position (for/against), set the debate speed, and challenge a specific user or make it open.",
  },
  {
    icon: Users,
    title: "2. Opponent Accepts",
    description:
      "Your opponent reviews the challenge and accepts it, taking the opposing position. Both debaters are now locked in.",
  },
  {
    icon: MessageSquare,
    title: "3. Exchange Arguments",
    description:
      "Take turns submitting arguments each round. Use text or voice input. A character limit keeps arguments focused and concise.",
  },
  {
    icon: Scale,
    title: "4. AI Judges Score",
    description:
      "After all rounds are complete, 7 AI judges evaluate both sides on logic, evidence, clarity, persuasiveness, and more. Each judge provides individual scores and reasoning.",
  },
  {
    icon: Trophy,
    title: "5. Verdict Delivered",
    description:
      "The final verdict is announced with a detailed breakdown. Your ELO rating updates based on the result, and you earn coins for participating.",
  },
  {
    icon: Award,
    title: "6. Appeal (Optional)",
    description:
      "Disagree with the verdict? You can submit an appeal once per month. A fresh AI analysis will reconsider the arguments.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold md:text-4xl">How ArguFight Works</h1>
        <p className="mt-3 text-muted-foreground">
          From challenge to verdict in 6 simple steps.
        </p>
      </div>

      <div className="mt-12 space-y-8">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-xl border border-border/50 bg-card/80 p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-electric-blue/10">
              <step.icon className="h-6 w-6 text-electric-blue" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
