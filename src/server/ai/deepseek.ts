const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: { message: { content: string } }[];
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not set");

  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model ?? "deepseek-chat",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as DeepSeekResponse;
  return data.choices[0]?.message?.content ?? "";
}
