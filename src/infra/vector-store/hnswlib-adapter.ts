import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { IVectorStoreProvider, VectorDoc } from "../../core/providers/vector-store.provider.js";
import { envs } from "../../shared/config/envs.js";
import fs from "node:fs";
import path from "node:path";

export class HNSWLibAdapter implements IVectorStoreProvider {
  private vectorStore: HNSWLib | null = null;
  private currentCollection: string | null = null;
  private BASE_PATH = envs.STORAGE_PATH
  
  private embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: envs.GOOGLE_API_KEY,
    modelName: envs.EMBEDDING_MODEL,
  });

  private getCollectionPath(collection: string): string {
    return path.join(this.BASE_PATH, collection);
  }

  async addDocuments(documents: VectorDoc[], collection: string): Promise<void> {
    const vectorPath = this.getCollectionPath(collection);

    if (this.currentCollection !== collection) {
      this.vectorStore = null;
      this.currentCollection = collection;
    }

    if (this.vectorStore) {
      await this.vectorStore.addDocuments(documents);
    } 
    else if (fs.existsSync(path.join(vectorPath, "docstore.json"))) {
      this.vectorStore = await HNSWLib.load(vectorPath, this.embeddings);
      await this.vectorStore.addDocuments(documents);
    } 
    else {
      this.vectorStore = await HNSWLib.fromDocuments(documents, this.embeddings);
    }

    await this.vectorStore.save(vectorPath);
  }

  async search(query: string, collection: string, limit: number = envs.VECTOR_SEARCH_LIMIT): Promise<VectorDoc[]> {
    const vectorPath = this.getCollectionPath(collection);

    if (this.currentCollection !== collection) {
      this.vectorStore = null;
      this.currentCollection = collection;
    }

    if (!this.vectorStore) {
      if (fs.existsSync(path.join(vectorPath, "docstore.json"))) {
        this.vectorStore = await HNSWLib.load(vectorPath, this.embeddings);
      } else {
        console.log(`⚠️ Collection "${collection}" not found in storage.`);
        return [];
      }
    }

    return await this.vectorStore.similaritySearch(query, limit);
  }
}