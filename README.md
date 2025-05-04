# Local AI RAG Playground

This lightweight local RAG project allows you to experiment with Retrieval-Augmented Generation pipelines for a wide range of applications.

## 💡 Project Overview

This project is a technical playground to test how a local LLM (like Gemma) can assist users by answering context-aware questions using local documents. It allows:

- Document injection via text/markdown files,
- Chunking and vectorization of knowledge,
- Prompt-based interaction with a model like `gemma3:12b-it-qat`,
- Multilingual vector embeddings with `nomic-embed-text`,
- Local and configurable RAG pipeline.

## 📦 Prerequisites

- [Ollama](https://ollama.com) (to run local LLMs)
- Node.js (v18+ recommended)
- macOS (tested on M2 with 16GB RAM)

## 🚀 Installation Steps

### 1. Install Ollama and the Model

On macOS you must install [brew](https://brew.sh/), then type this command:

```bash
brew install ollama
```

Launch the Ollama server:

```bash
ollama serve
```

Open a new Terminal, or a new tab, then enter this command to install the model:

```bash
ollama pull gemma3:12b-it-qat && ollama pull nomic-embed-text
```

### 2. Clone and Install Project

```bash
git clone https://github.com/craft-and-code/ai-agent-rpg.git
cd ai-agent-rpg
npm install
```

## 🧠 Preparing Knowledge Files

Put your `.txt` or `.md` files inside the `data/` directory. Suggested structure:

```bash
data/
├── rules/
│   ├── character-creation.md
│   ├── combat.md
│   └── gear.md
├── univers/
│   ├── timeline.txt
│   └── factions.md
```

These files will be automatically chunked and vectorized.

### ✂️ Step 1: Chunk the Files

```bash
node chunker.js
```

- This reads all `.md` and `.txt` files from `./data/`,
- Files already processed (based on MD5 hash) will be skipped.

Output: `./build/chunks.json`

### 🔢 Step 2: Generate Embeddings

```bash
node embedder.js
```

This will produce vector embeddings stored in: `./build/embeddings.json`, using the `nomic-embed-text` model served by Ollama.

### 🧾 Customizing the Prompt

Edit this file: `config/prompt.txt`.

This file contains the system prompt that defines:

- The tone (cold, factual, machine-like),
- Instructions to avoid *hallucination*,
- Role-playing logic and interaction preferences.

### 🤖 Ask a Question

```bash
node rag/query.js
```

This script will:

- Prompt the user for a question,
- Find top-matching *chunks* from the document base,
- Construct a prompt with *prompt* + *chunks* + *question*,
- Send it to Ollama’s local model and return the answer.

## 🗺️ Roadmap

### 🔄 Contextual Memory

This feature is not yet implemented but is planned for a future update. It will allow the AI agent to:

- Retain previous interactions with the user,
- Maintain coherence across multiple sessions,
- Adapt its responses based on conversation history.

## ⚙️ Adjusting Generation Settings

You can tune model behavior in `ollama.js`, and define the default model name in `config/model.js`.
Embedding generation uses `nomic-embed-text` as the default embedding model, served by Ollama.

```
const response = await axios.post('http://localhost:11434/api/generate', {
  model: 'gemma3:12b-it-qat',
  prompt,
  stream: false,
  temperature: 0.2,
  top_k: 40,
  top_p: 0.9,
  repeat_penalty: 1.2,
  num_predict: 512
});
```

The constants in `config/model.js` ensures consistent use across scripts.

### ✅ Tips

- Lower temperature = stricter answers,
- Add/remove `.md` or `.txt` → re-run `chunker.js` + `embedder.js`
- Prompt is your AI’s “soul” → shape it wisely.
