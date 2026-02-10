import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ArguFight.",
};

const faqs = [
  {
    q: "What is ArguFight?",
    a: "ArguFight is an AI-judged online debate platform where users challenge each other to structured debates on any topic. Seven AI judges with unique personalities evaluate the arguments and deliver verdicts.",
  },
  {
    q: "How are debates judged?",
    a: "Each debate is scored by 7 AI judges. They evaluate arguments on criteria like logical reasoning, evidence quality, clarity, persuasiveness, and counterargument handling. The majority verdict determines the winner.",
  },
  {
    q: "Is ArguFight free?",
    a: "Yes! You can create an account and start debating for free. A Pro subscription unlocks additional features like AI coaching reports, more debates per day, and advanced analytics.",
  },
  {
    q: "What is the ELO rating system?",
    a: "ELO is a rating system originally designed for chess. Your rating goes up when you win debates and down when you lose, with adjustments based on your opponent's rating. New users start at 1200.",
  },
  {
    q: "Can I appeal a verdict?",
    a: "Yes, you can submit one appeal per month. A fresh AI analysis will reconsider the arguments and may overturn the original verdict.",
  },
  {
    q: "What are belt championships?",
    a: "Belts are championship titles in specific debate categories. You can challenge the current belt holder, and if you win, the belt transfers to you. You must defend your belt periodically.",
  },
  {
    q: "How do coins work?",
    a: "Coins are the in-app currency. You earn them by winning debates, completing daily login streaks, and other activities. Coins can be used for special features or to tip great debaters.",
  },
  {
    q: "Can I use voice input?",
    a: "Yes! ArguFight supports voice-to-text for submitting arguments. Just click the microphone button and speak your argument.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold md:text-4xl">
        Frequently Asked Questions
      </h1>
      <div className="mt-8 space-y-6">
        {faqs.map((faq) => (
          <div
            key={faq.q}
            className="rounded-lg border border-border/50 bg-card/80 p-5"
          >
            <h3 className="font-semibold">{faq.q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
