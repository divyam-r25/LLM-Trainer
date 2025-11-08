import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: request.systemPrompt },
  ];

  if (request.conversationHistory) {
    messages.push(...request.conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })));
  }

  messages.push({ role: "user", content: request.message });

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
    max_completion_tokens: 8192,
  });

  return {
    message: response.choices[0].message.content || "I'm sorry, I couldn't generate a response.",
    tokensUsed: response.usage?.total_tokens || 0,
  };
}
