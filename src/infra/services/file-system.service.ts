import fs from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export class FileSystemService {
  async ensureDirectory(dirPath: string) {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  getCollections(basePath: string): string[] {
    if (!existsSync(basePath)) return [];
    return readdirSync(basePath).filter(file => 
      statSync(path.join(basePath, file)).isDirectory()
    );
  }

  getFilesFromCollection(collectionPath: string, extension: string = '.txt'): string[] {
    if (!existsSync(collectionPath)) return [];
    return readdirSync(collectionPath).filter(f => f.endsWith(extension));
  }

  async deleteDirectory(dirPath: string) {
    await fs.rm(dirPath, { recursive: true, force: true });
  }
}