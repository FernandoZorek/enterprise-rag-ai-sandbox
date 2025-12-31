import fs from 'node:fs';
import path from 'node:path';

export interface LogEntry {
  timestamp: string;
  collection: string;
  originalQuestion: string;
  rephrasedQuery: string;
  retrievedChunks: number;
  answer: string;
}

export class HistoryLogger {
  private static logDir = path.join(process.cwd(), 'logs');

  static async save(entry: LogEntry): Promise<void> {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }

    const fileName = `chat_history_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(this.logDir, fileName);

    let logs: LogEntry[] = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      logs = JSON.parse(fileContent);
    }

    logs.push(entry);

    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
  }
}