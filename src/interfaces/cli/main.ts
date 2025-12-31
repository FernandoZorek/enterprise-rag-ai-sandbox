import 'dotenv/config';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'node:path';

import { envs } from "../../shared/config/envs.js";
import { GeminiAdapter } from "../../infra/llm/gemini-adapter.js";
import { HNSWLibAdapter } from "../../infra/vector-store/hnswlib-adapter.js";
import { IngestDocumentUseCase } from "../../use-cases/ingest-document.use-case.js";
import { AskQuestionUseCase } from "../../use-cases/ask-question.use-case.js";
import { FileSystemService } from "../../infra/services/file-system.service.js";
import { TerminalUI } from "../../presentation/terminal/terminal-ui.js";

async function main() {
  const fileSystem = new FileSystemService();
  const gemini = new GeminiAdapter();
  const vectorStore = new HNSWLibAdapter();
  const ingestUseCase = new IngestDocumentUseCase(vectorStore);
  const askUseCase = new AskQuestionUseCase(gemini, vectorStore);
  const rl = readline.createInterface({ input, output });

  TerminalUI.header("Enterprise RAG AI Sandbox");

  try {
    // 1. DATABASE SYNC LOGIC
    const availableData = fileSystem.getCollections(envs.DATA_PATH);
    const hasExistingDb = fileSystem.getCollections(envs.STORAGE_PATH).length > 0;

    if (hasExistingDb) {
      TerminalUI.info(`Existing database found at: ${envs.STORAGE_PATH}`);
      const answer = await rl.question("➤ Do you want to update the database (re-index files)? (y/N): ");
      
      if (answer.toLowerCase() === 'y') {
        TerminalUI.info("Cleaning storage...");
        await fileSystem.deleteDirectory(envs.STORAGE_PATH);
        
        for (const col of availableData) {
          const files = fileSystem.getFilesFromCollection(path.join(envs.DATA_PATH, col));
          TerminalUI.collection(col, files.length);
          for (const file of files) {
            await ingestUseCase.execute(path.join(envs.DATA_PATH, col, file), col);
          }
        }
      }
    } else {
      TerminalUI.info("No database found. Starting initial ingestion...");
      for (const col of availableData) {
        const files = fileSystem.getFilesFromCollection(path.join(envs.DATA_PATH, col));
        if (files.length > 0) {
          TerminalUI.collection(col, files.length);
          for (const file of files) {
            await ingestUseCase.execute(path.join(envs.DATA_PATH, col, file), col);
          }
        }
      }
    }

    // 2. MAIN NAVIGATION LOOP
    while (true) {
      const collections = fileSystem.getCollections(envs.STORAGE_PATH);

      if (collections.length === 0) {
        TerminalUI.error("No collections found to query.");
        break;
      }

      console.log("\n📚 Select a Category:");
      collections.forEach((col, idx) => console.log(`(${idx + 1}) ${col}`));
      const selection = await rl.question("\n➤ Selection (or 'exit'): ");

      if (selection.toLowerCase() === 'exit') break;
      const selectedCol = collections[parseInt(selection) - 1];

      if (!selectedCol) {
        TerminalUI.error("Invalid choice.");
        continue;
      }

      // 3. CHAT SESSION LOOP
      console.log(`\n💬 Context: [${selectedCol}] | Type /help for options.`);
      
      while (true) {
        const question = await rl.question(`\n👤 [${selectedCol}] You: `);
        const cmd = question.trim().toLowerCase();

        if (cmd === '/exit') process.exit(0);
        if (cmd === '/back') {
          askUseCase.clearContext();
          break;
        }
        if (cmd === '/help') {
          TerminalUI.showHelp();
          continue;
        }
        if (cmd === '/clear') {
          askUseCase.clearContext();
          TerminalUI.success("Memory cleared.");
          continue;
        }
        if (!question.trim()) continue;

        try {
          const response = await askUseCase.execute(question, selectedCol);
          console.log(`\n🤖 Gemini: ${response}`);
        } catch (err: any) {
          TerminalUI.error(err.message);
        }
      }
    }
  } catch (error) {
    TerminalUI.error(`Critical error: ${error}`);
  } finally {
    rl.close();
  }
}

main().catch(err => TerminalUI.error(err));