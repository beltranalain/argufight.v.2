import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<string> {
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: options?.model ?? "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  });

  return completion.choices[0]?.message?.content ?? "";
}
