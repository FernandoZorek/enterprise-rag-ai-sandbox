import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import type { ILLMProvider } from "../../core/providers/llm.provider.js";
import { envs } from "../../shared/config/envs.js";

export class GeminiAdapter implements ILLMProvider {
  private model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: envs.GEMINI_MODEL,
      apiKey: envs.GOOGLE_API_KEY,
      maxOutputTokens: envs.GEMINI_MAX_TOKENS,
    });
  }

  async generateResponse(prompt: string, context: string = ""): Promise<string> {
    const fullPrompt = `Context: ${context}\n\nQuestion: ${prompt}`;
    const response = await this.model.invoke(fullPrompt);
    return response.content.toString();
  }

  async *streamResponse(prompt: string, context: string = ""): AsyncIterable<string> {
    const stream = await this.model.stream(`Context: ${context}\n\nQuestion: ${prompt}`);
    for await (const chunk of stream) {
      yield chunk.content.toString();
    }
  }
}