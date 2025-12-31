import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, "A API Key do Google é obrigatória"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash-lite"),
  GEMINI_MAX_TOKENS: z.coerce.number().default(2048),
  EMBEDDING_MODEL: z.string().default("text-embedding-004"),
  CHUNK_SIZE: z.coerce.number().default(2500),
  CHUNK_OVERLAP: z.coerce.number().default(500),
  VECTOR_SEARCH_LIMIT: z.coerce.number().default(5),
  MAX_CHAT_HISTORY: z.coerce.number().default(6),
  BATCH_SIZE: z.coerce.number().default(100),
  INGEST_DELAY: z.coerce.number().default(1000),
  STORAGE_PATH: z.string().default("storage/vectors"),
  DATA_PATH: z.string().default("data"),
});

const _envs = envSchema.safeParse(process.env);

if (!_envs.success) {
  console.error("❌ Variáveis de ambiente inválidas:", _envs.error.format());
  throw new Error("Variáveis de ambiente inválidas");
}

export const envs = _envs.data;