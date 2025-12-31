import type { IGeminiProvider } from "../core/providers/gemini.provider.js";
import type { IVectorStoreProvider } from "../core/providers/vector-store.provider.js";
import { envs } from "../shared/config/envs.js";
import { HistoryLogger } from "../shared/utils/history-logger.js";
import { QUERY_REPHRASER_PROMPT } from "../infra/llm/prompts/query-rephraser.js";
import { RAG_ASSISTANT_PROMPT } from "../infra/llm/prompts/rag-assistant.js";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AskQuestionUseCase {
  private chatHistory: ChatMessage[] = [];
  private readonly MAX_HISTORY = envs.MAX_CHAT_HISTORY;

  constructor(
    private gemini: IGeminiProvider,
    private vectorStore: IVectorStoreProvider
  ) {}

  async execute(question: string, collection: string): Promise<string> {
    console.log(`\n[DEBUG] Pipeline Initiated | Collection: [${collection}]`);

    const searchQuery = await this.getSearchQuery(question);

    console.log(`[DEBUG] 🔍 Searching vector space for: "${searchQuery}"`);
    const contextDocs = await this.vectorStore.search(
      searchQuery, 
      collection, 
      envs.VECTOR_SEARCH_LIMIT
    );

    if (contextDocs.length === 0) {
      const fallbackMsg = "I couldn't find relevant information in the current collection.";
      await this.logInteraction(question, searchQuery, 0, fallbackMsg, collection);
      return fallbackMsg;
    }

    const contextText = contextDocs
      .map((doc, i) => `[Source ${i + 1}: ${doc.metadata.source}]: ${doc.pageContent}`)
      .join("\n\n");

    const finalPrompt = RAG_ASSISTANT_PROMPT(contextText, question);

    try {
      console.log(`[DEBUG] 🤖 Generating grounded response...`);
      const response = await this.gemini.generateResponse(finalPrompt);

      await this.logInteraction(question, searchQuery, contextDocs.length, response, collection);
      this.updateChatHistory(question, response);

      console.log(`[DEBUG] ✅ Success.`);
      return response;
    } catch (err: any) {
      console.error(`[DEBUG] ❌ Generation Error:`, err.message);
      throw new Error("Cloud LLM provider failed to generate a response.");
    }
  }

 
  private async getSearchQuery(question: string): Promise<string> {
    if (this.chatHistory.length === 0) {
      return question;
    }

    try {
      const historyText = this.chatHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join("\n");

      const prompt = QUERY_REPHRASER_PROMPT(historyText, question);
      const rephrased = await this.gemini.generateResponse(prompt);
      
      const cleanQuery = rephrased.trim().replace(/"/g, '');
      console.log(`🔎 [REPHRASING] Standalone query: "${cleanQuery}"`);
      return cleanQuery;
    } catch (err) {
      console.warn("[DEBUG] Rephrasing failed, using original question.");
      return question;
    }
  }


  private updateChatHistory(userMsg: string, aiMsg: string) {
    this.chatHistory.push({ role: 'user', content: userMsg });
    this.chatHistory.push({ role: 'assistant', content: aiMsg });

    if (this.chatHistory.length > this.MAX_HISTORY) {
      this.chatHistory.splice(0, 2);
    }
  }

  private async logInteraction(q: string, s: string, chunks: number, ans: string, col: string) {
    await HistoryLogger.save({
      timestamp: new Date().toISOString(),
      collection: col,
      originalQuestion: q,
      rephrasedQuery: s,
      retrievedChunks: chunks,
      answer: ans
    });
  }

  clearContext(): void {
    console.log("[DEBUG] 🧹 UseCase history cleared.");
    this.chatHistory = [];
  }
}