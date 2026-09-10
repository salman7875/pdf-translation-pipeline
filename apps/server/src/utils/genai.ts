import OpenAI from "openai";

const URL = "http://localhost:12434/engines/v1";

const SYS_PROMPT = `You are a professional legal translator specializing in Tamil 
               land deeds and boundary schedules. 
               Review the provided Tamil text, correct any minor character 
               layout or typing artifacts, and provide a precise, 
               standard Indian legal English boundary translation. Only output the english translation`;

const client = new OpenAI({
  baseURL: URL,
  apiKey: "dmr",
});

export const llmTranslate = async (text: string) => {
  try {
    const response = await client.chat.completions.create({
      model: "ai/qwen2.5",
      messages: [
        { role: "system", content: SYS_PROMPT },
        { role: "user", content: text },
      ],
    });

    console.log(response.choices[0]?.message?.content);

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.log(error);
  }
};
