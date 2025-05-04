import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline-sync';
import askOllama from '../ollama.js';
import { cosineSimilarity, getEmbedding } from './embedding-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const embeddingsPath = path.join(__dirname, '../build/embeddings.json');
const promptTemplatePath = path.join(__dirname, '../config/prompt.txt');

const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');

const question = readline.question("Question au MJ (Mother) : ");
const questionEmbedding = await getEmbedding(question);

const topChunks = embeddings
  .map(entry => ({
    ...entry,
    similarity: cosineSimilarity(entry.embedding, questionEmbedding)
  }))
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 3); // On garde les 3 meilleurs

const context = topChunks.map(c => c.chunk).join("\n---\n");

const prompt = `${promptTemplate}

Voici des extraits du livre des règles :
---
${context}
---

Voici la question du joueur :
${question}
`;

const answer = await askOllama(prompt);
console.log("\nMother : " + answer);
