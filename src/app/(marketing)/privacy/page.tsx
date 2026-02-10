import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ArguFight privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 2026
      </p>
      <div className="prose prose-invert mt-8 max-w-none space-y-6 text-muted-foreground">
        <p>
          Your privacy is important to us. This policy explains what data we
          collect, how we use it, and your rights.
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          1. Information We Collect
        </h2>
        <p>
          We collect information you provide (email, username, profile data), data
          generated through platform use (debates, arguments, votes), and
          technical data (IP address, browser, device).
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          2. How We Use Your Data
        </h2>
        <p>
          We use your data to provide the debate platform, generate AI verdicts,
          calculate rankings, send notifications, and improve our services.
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          3. AI Processing
        </h2>
        <p>
          Your debate arguments are sent to AI models (DeepSeek, OpenAI) for
          judging. We do not use your arguments to train AI models.
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          4. Data Sharing
        </h2>
        <p>
          We do not sell your personal data. We share data only with essential
          service providers (Stripe for payments, Supabase for database hosting,
          Resend for email).
        </p>
        <h2 className="text-lg font-semibold text-foreground">
          5. Your Rights
        </h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          data by contacting us at support@argufight.com.
        </p>
        <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management. We
          use analytics cookies to understand platform usage.
        </p>
      </div>
    </div>
  );
}
