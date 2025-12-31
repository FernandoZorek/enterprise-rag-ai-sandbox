# 🤖 Enterprise RAG/AI Sandbox

An intelligent terminal assistant that utilizes **RAG (Retrieval-Augmented Generation)** architecture to chat with your own documents (.txt). The system uses **LLMs** for intelligence and **HNSWLib** for high-performance local vector search.

## 🎯 Purpose & Strategic Value

This project is designed as a **Enterprise RAG/AI Sandbox**. It serves as a starting point for infrastructure and innovation departments to prototype AI implementations safely. 

Before deploying a full-scale production system, companies can use this tool to:
* **Prompt Engineering:** Test and refine system instructions (system prompts) to match the company's tone and safety requirements.
* **Knowledge Validation:** Evaluate how existing documentation (.txt) performs within a RAG architecture.
* **Parameter Fine-Tuning:** Determine the ideal `CHUNK_SIZE` and `OVERLAP` for specific corporate data types before committing to a final cloud architecture.

![ScreenShot](https://repository-images.githubusercontent.com/1125866139/5df4861c-d2ed-4d9b-ba65-1115718ff165)

## ✨ Features

* **Multi-collection:** Organize your documents into folders and switch between different contexts (e.g., Books, Manuals, Studies).
* **Short-Term Memory:** The system maintains the context of recent questions, allowing for natural dialogues (e.g., "Who is he?", "Where was he born?").
* **Intelligent Ingestion:** Automatic processing of TXT files with a **batching** system to respect API quota limits (Free Tier).
* **Query Reformulation:** Uses AI to transform contextual questions into precise vector searches.
* **Zod Configuration:** Strict validation of environment variables to ensure stability.

## 🚀 Technologies

* **Runtime:** Node.js + TypeScript + TSX
* **LLM:** Google Gemini (2.5 Flash / Pro)
* **Orchestration:** LangChain
* **Vector Database:** HNSWLib (Local)
* **Validation:** Zod

## 🛠️ Installation and Configuration

1. **Clone the repository:**
```bash
   git clone https://github.com/FernandoZorek/enterprise-rag-ai-sandbox
   cd enterprise-rag-ai-sandbox
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Configure environment variables:**
   Create a **.env** file in the root of the project based on the keys below:

```bash
   GOOGLE_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.5-flash-lite
   GEMINI_MAX_TOKENS=2048
   EMBEDDING_MODEL=text-embedding-004
   CHUNK_SIZE=3000
   CHUNK_OVERLAP=400
   VECTOR_SEARCH_LIMIT=10
   MAX_CHAT_HISTORY=6
   BATCH_SIZE=100
   INGEST_DELAY=1000
   STORAGE_PATH=storage/vectors
   DATA_PATH=data
```

## 📂 How to Use

### 1. Prepare Documents
Create subfolders within the **/data** folder for each collection you desire. The system will ignore files that are not .txt.
```bash
    Example:
    /data/books/The-Adventures-of-Sherlock-Holmes.txt
    /data/others/rogramming/The-Notebooks-of-Leonardo-Da-Vinci.txt
```

### 2. Start the System
```bash
    npm run dev
```

### 3. Chat Commands
During the conversation, you can use special commands in the terminal:
```bash
    /help: Lists available commands.
    /clear: Resets the current conversation memory (AI forgets previous context).
    /back: Returns to the main menu to switch collections.
    /exit: Closes the program.
```

## ⚙️ System Architecture

The processing flow follows these steps:

1. **Ingestion:** Text is extracted, divided into chunks, and converted into vectors (embeddings) saved locally.
2. **Reformulation (Query Rewriting):** If there is chat history, the AI rewrites your question to make it independent.
3. **Search:** The system searches the HNSWLib database for the most relevant snippets.
4. **Generation:** Gemini receives the snippets + the question and generates the final response.


## 🧪 Testing & Validation

This project was extensively tested with real-world documents to ensure accuracy and prevent AI hallucinations. 

You can check the detailed logs and performance analysis here:
👉 **[View RAG Performance Report (RAG_TEST_RESULTS.md)](./RAG_TEST_RESULTS.md)**

**Test Cases included:**
* **Fiction (Sherlock Holmes):** Testing contextual memory and pronoun resolution.
* **Technical (Da Vinci Notebooks):** Testing handling of dense, fragmented data.
* **Grounding (Safety):** Verifying the system's ability to deny non-existent facts (e.g., smartphones in 1890).


## ⚠️ Troubleshooting

### Error 429 (Too Many Requests)
If you use the Gemini free tier, you may encounter this error during the ingestion of large files or by exceeding daily limits. The project already includes:
* **Batching:** Sending documents in controlled batches.
* **Adjustment:** If the error persists, increase CHUNK_SIZE in the .env to generate fewer requests.


## 🛠️ Roadmap & Future Evolutions

This repository represents the "Core" logic. Future evolutions will be handled in separate forks or versions to transition from a CLI tool to a production-grade infrastructure:

* **📄 Native PDF Support:** Implementation of parsing libraries (e.g., `pdf-parse`) to handle complex document structures, technical manuals, and contracts.
* **🤖 Multi-LLM Integration (OpenAI):** Adding support for **GPT-4o** via OpenAI API, allowing users to switch between Google Gemini and OpenAI based on precision or cost needs.
* **☁️ AWS Cloud Infrastructure:** * **AWS Bedrock:** Integration to utilize high-performance models within Amazon's secure infrastructure.
    * **AWS S3:** Centralized document storage for large-scale ingestion.
* **🌐 API Layer:** Implementation of REST/GraphQL routes for modern front-end integration (React/Next.js).
* **🗄️ Production Vector Database:** Migration from local HNSWLib to scalable, managed solutions like **Pinecone**, **Milvus**, or **pgvector** (PostgreSQL).