import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, relative } from "path";
import { createHash } from "crypto";
import { encode, decode } from "gpt-3-encoder";

const DATA_DIR = "data";
const BUILD_DIR = "build";
const HASH_FILE = join(BUILD_DIR, "hashes.json");
const OUTPUT_FILE = join(BUILD_DIR, "chunks.json");

const MAX_TOKENS = 512;
const OVERLAP = 50;

function md5(content) {
  return createHash("md5").update(content).digest("hex");
}

function loadHashes() {
  if (!existsSync(HASH_FILE)) return {};
  return JSON.parse(readFileSync(HASH_FILE, "utf-8"));
}

function saveHashes(hashes) {
  writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
}

function getAllTextFiles(dir) {
  const results = [];

  function walk(subdir) {
    const files = readdirSync(subdir);
    for (const file of files) {
      const fullPath = join(subdir, file);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".txt") || file.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function chunkText(text, source) {
  const tokens = encode(text);
  const chunks = [];
  let i = 0;
  let id = 0;

  while (i < tokens.length) {
    const chunkTokens = tokens.slice(i, i + MAX_TOKENS);
    const chunkText = decode(chunkTokens);

    chunks.push({
      chunk: chunkText,
      source,
      chunk_id: id++,
    });

    i += MAX_TOKENS - OVERLAP;
  }

  return chunks;
}

function main() {
  if (!existsSync(BUILD_DIR)) {
    mkdirSync(BUILD_DIR);
  }

  const hashes = loadHashes();
  const files = getAllTextFiles(DATA_DIR);
  const allChunks = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const fileHash = md5(content);

    if (hashes[file] === fileHash) {
      console.log(`✅ Skipping unchanged file: ${file}`);
      continue;
    }

    console.log(`🔍 Processing: ${file}`);
    const relPath = relative(DATA_DIR, file);
    const chunks = chunkText(content, relPath);
    allChunks.push(...chunks);
    hashes[file] = fileHash;
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allChunks, null, 2));
  saveHashes(hashes);

  console.log(`✅ Chunking complete. Total chunks: ${allChunks.length}`);
}

main();
