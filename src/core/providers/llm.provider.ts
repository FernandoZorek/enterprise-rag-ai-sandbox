export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ILLMProvider {
  generateResponse(prompt: string, context?: string): Promise<string>;
  streamResponse(prompt: string, context?: string): AsyncIterable<string>;
}