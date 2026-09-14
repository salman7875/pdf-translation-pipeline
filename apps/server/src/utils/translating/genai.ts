import OpenAI from "openai";

const URL = "http://localhost:12434/engines/v1";

const SYS_PROMPT =
  "Translate Tamil land-deed text into precise standard Indian legal English. " +
  "Preserve the input JSON structure and keys. Translate Tamil text only, " +
  "correcting minor character-layout artifacts. Return only valid JSON.";

const client = new OpenAI({
  baseURL: URL,
  apiKey: "dmr",
});

export const llmTranslate = async (text: string): Promise<string> => {
  try {
    const response = await client.chat.completions.create({
      model: "ai/qwen2.5",
      messages: [
        { role: "system", content: SYS_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 2048,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("The translation model returned an empty response");
    }
    return content;
  } catch (error) {
    console.error("Translation request failed:", error);
    throw error;
  }
};
