import { MODEL_NAME } from './config/model.js';

import axios from 'axios';

export default async function askOllama(prompt, options = {}) {
  const res = await axios.post('http://localhost:11434/api/generate', {
    model: MODEL_NAME,
    prompt,
    stream: false,
    temperature: 0.1,
    ...options
  });
  return res.data.response.trim();
}
