import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import type { IVectorStoreProvider } from "../core/providers/vector-store.provider.js";
import { envs } from "../shared/config/envs.js";
import { TerminalUI } from "../presentation/terminal/terminal-ui.js";

export class IngestDocumentUseCase {
  constructor(private vectorStore: IVectorStoreProvider) {}

  async execute(filePath: string, collection: string): Promise<void> {
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension !== 'txt') {
      TerminalUI.info(`Skipping non-txt file: ${filePath}`);
      return;
    }

    try {
      const loader = new TextLoader(filePath);
      const rawDocs = await loader.load();      
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: envs.CHUNK_SIZE,
        chunkOverlap: envs.CHUNK_OVERLAP,
      });

      const splitDocs = await splitter.splitDocuments(rawDocs);      
      const docsWithMetadata = splitDocs.map(doc => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          collection,
          ingestedAt: new Date().toISOString()
        }
      }));

      const batchSize = envs.BATCH_SIZE;
      
      for (let i = 0; i < docsWithMetadata.length; i += batchSize) {
        const batch = docsWithMetadata.slice(i, i + batchSize);
        
        await this.vectorStore.addDocuments(batch, collection);
        
        const progress = Math.min(i + batchSize, docsWithMetadata.length);
        console.log(`   [BATCH] ${progress}/${docsWithMetadata.length} chunks indexed...`);

        if (i + batchSize < docsWithMetadata.length) {
          await new Promise(resolve => setTimeout(resolve, envs.INGEST_DELAY || 500));
        }
      }

    } catch (error) {
      TerminalUI.error(`Ingestion failed for ${filePath}: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }
}