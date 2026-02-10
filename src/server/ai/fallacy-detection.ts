import { callDeepSeek } from "./deepseek";

export interface FallacyResult {
  fallacyType: string;
  explanation: string;
  confidence: number;
  excerpt: string;
}

const FALLACY_SYSTEM_PROMPT = `You are an expert in logical reasoning and argumentation. Analyze debate statements for logical fallacies.

For each fallacy found, provide:
- fallacyType: The name of the fallacy (e.g., "Ad Hominem", "Straw Man", "Appeal to Authority")
- explanation: A clear, concise explanation of why this is a fallacy
- confidence: A score from 0.0 to 1.0 indicating your confidence
- excerpt: The exact text excerpt that contains the fallacy

Return a JSON array of fallacies. If no fallacies are found, return an empty array.
Only return the JSON array, no other text.`;

export async function detectFallacies(statementContent: string): Promise<FallacyResult[]> {
  try {
    const response = await callDeepSeek(
      [
        { role: "system", content: FALLACY_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this debate statement for logical fallacies:\n\n"${statementContent}"` },
      ],
      { temperature: 0.3, maxTokens: 1024 }
    );

    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const fallacies = JSON.parse(cleaned) as FallacyResult[];

    return fallacies.filter(
      (f) =>
        typeof f.fallacyType === "string" &&
        typeof f.explanation === "string" &&
        typeof f.confidence === "number" &&
        f.confidence >= 0.5
    );
  } catch {
    return [];
  }
}
