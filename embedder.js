import fs from 'fs/promises';
import { EMBEDDING_MODEL_NAME } from './config/model.js';

const chunksFile = './build/chunks.json';
const outputFile = './build/embeddings.json';

async function getEmbeddingsForChunk(chunk, model) {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: chunk
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

async function main() {
  const chunks = JSON.parse(await fs.readFile(chunksFile, 'utf-8'));
  const results = [];

  console.log(`📊 Processing ${chunks.length} chunks...`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);

    try {
      const embedding = await getEmbeddingsForChunk(chunk.chunk, EMBEDDING_MODEL_NAME);
      results.push({
        embedding,
        metadata: {
          chunk_id: chunk.chunk_id,
          source: chunk.source,
        }
      });
    } catch (error) {
      console.error(`Error processing chunk ${i}:`, error);
      throw error;
    }
  }

  await fs.writeFile(outputFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅ Embeddings saved to ${outputFile}`);
}

main().catch(console.error);
