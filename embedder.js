import { pipeline } from '@xenova/transformers';
import fs from 'fs/promises';

const chunksFile = './build/chunks.json';
const outputFile = './build/embeddings.json';

const chunks = JSON.parse(await fs.readFile(chunksFile, 'utf-8'));

const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

const results = [];
for (const chunk of chunks) {
  const output = await extractor(chunk.chunk, { pooling: 'mean', normalize: true });
  results.push({
    embedding: Array.from(output.data), // transformer en tableau simple
    metadata: {
      chunk_id: chunk.chunk_id,
      source: chunk.source,
    }
  });
}

await fs.writeFile(outputFile, JSON.stringify(results, null, 2), 'utf-8');
console.log(`✅ Embeddings saved to ${outputFile}`);
