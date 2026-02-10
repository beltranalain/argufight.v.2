import { callDeepSeek } from "./deepseek";

export interface CoachingAnalysis {
  overallGrade: string;
  strengths: string[];
  weaknesses: string[];
  roundFeedback: { round: number; feedback: string; score: number }[];
  tips: string[];
  suggestedReading: string[];
}

const COACHING_SYSTEM_PROMPT = `You are an expert debate coach. Analyze a debater's performance across all their statements and provide constructive, actionable feedback.

Return a JSON object with:
- overallGrade: A letter grade (A+, A, B+, B, C+, C, D, F)
- strengths: Array of 2-4 specific things the debater did well
- weaknesses: Array of 2-4 specific areas for improvement
- roundFeedback: Array of objects with { round: number, feedback: string, score: 1-10 }
- tips: Array of 3-5 actionable improvement tips
- suggestedReading: Array of 2-3 topic suggestions to study

Only return the JSON object, no other text.`;

export async function generateCoachingReport(
  debateTopic: string,
  userStatements: { round: number; content: string }[],
  opponentStatements: { round: number; content: string }[],
  verdict?: { winner: string; reasoning: string }
): Promise<CoachingAnalysis> {
  const statementsText = userStatements
    .map((s) => `Round ${s.round}: "${s.content}"`)
    .join("\n\n");

  const opponentText = opponentStatements
    .map((s) => `Round ${s.round}: "${s.content}"`)
    .join("\n\n");

  const userPrompt = `Debate Topic: "${debateTopic}"

The debater's statements:
${statementsText}

Their opponent's statements:
${opponentText}

${verdict ? `Verdict: ${verdict.winner} won. Reasoning: ${verdict.reasoning}` : ""}

Provide coaching feedback for the debater (not the opponent).`;

  try {
    const response = await callDeepSeek(
      [
        { role: "system", content: COACHING_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.5, maxTokens: 2048 }
    );

    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as CoachingAnalysis;
  } catch {
    return {
      overallGrade: "N/A",
      strengths: ["Unable to generate coaching report at this time."],
      weaknesses: [],
      roundFeedback: [],
      tips: ["Try again later when the AI service is available."],
      suggestedReading: [],
    };
  }
}
