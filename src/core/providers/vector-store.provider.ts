export interface VectorDoc {
  pageContent: string;
  metadata: Record<string, any>;
}

export interface IVectorStoreProvider {
  addDocuments(documents: VectorDoc[], collection: string): Promise<void>;
  search(query: string, collection: string, limit?: number): Promise<VectorDoc[]>;
}