import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Using Gemini AI instead of OpenAI for chat completions
// Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PromptGenerationRequest {
  name: string;
  intent: string;
  examples: Array<{ input: string; output: string }>;
}

export async function generateSystemPrompt(request: PromptGenerationRequest): Promise<string> {
  const examplesText = request.examples.length > 0
    ? `\n\nHere are some example interactions:\n${request.examples
        .map((ex, i) => `Example ${i + 1}:\nUser: ${ex.input}\nAssistant: ${ex.output}`)
        .join("\n\n")}`
    : "";

  return `You are ${request.name}.

${request.intent}${examplesText}

Always respond in character based on the above description and examples.`;
}

export interface ChatCompletionRequest {
  systemPrompt: string;
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatCompletionResponse {
  message: string;
  tokensUsed: number;
}

export async function getChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const contents: any[] = [];

  if (request.conversationHistory) {
    for (const msg of request.conversationHistory) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: request.message }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: request.systemPrompt,
    },
    contents,
  });

  const totalTokens = (response.usageMetadata?.totalTokenCount || 0);

  return {
    message: response.text || "I'm sorry, I couldn't generate a response.",
    tokensUsed: totalTokens,
  };
}
