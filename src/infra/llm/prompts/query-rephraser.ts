export const QUERY_REPHRASER_PROMPT = (history: string, question: string) => `
As an AI search optimizer, rewrite the user's question into a standalone search query.
Use context from the history ONLY if the question contains pronouns or relative references.
Return ONLY the optimized query text.

History:
${history}

Question: 
${question}
`.trim();