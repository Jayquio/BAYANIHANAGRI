
// Simple Hugging Face Inference API wrapper for server-side usage.
// Usage: callHuggingFace('google/flan-t5-large', 'Your prompt here')
import fetch from 'node-fetch';

const HF_API_URL = 'https://router.huggingface.co/models';

const hfKey = process.env.HUGGINGFACE_API_KEY;
if (!hfKey) {
  // We don't throw here to allow graceful checks elsewhere; functions will throw if used without a key.
  // Keep this check so devs notice the env var requirement.
  // console.warn('HUGGINGFACE_API_KEY not set — Hugging Face provider will not work until set.');
}

export type HFOptions = {
  max_new_tokens?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  // provider-specific extra params
  [k: string]: unknown;
};

export async function callHuggingFace(
  model: string,
  prompt: string,
  options: HFOptions = {}
): Promise<string> {
  if (!hfKey) {
    throw new Error('Hugging Face API key not configured. Set HUGGINGFACE_API_KEY on the server.');
  }

  const url = `${HF_API_URL}/${encodeURIComponent(model)}`;

  const body: any = {
    inputs: prompt,
    parameters: {
      max_new_tokens: options.max_new_tokens ?? 256,
      temperature: options.temperature ?? 0.2,
      top_k: options.top_k ?? 50,
      top_p: options.top_p ?? 0.95,
      ...options,
    },
    options: { wait_for_model: true }, // ensures model is loaded
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Hugging Face error', { status: res.status, statusText: res.statusText, body: text });

    // Normalize common errors into friendly messages
    if (res.status === 401) throw new Error('Invalid Hugging Face API key (401).');
    if (res.status === 403) throw new Error('Permission denied for the requested model (403).');
    if (res.status === 404) throw new Error(`Model '${model}' not found (404). Check the model name.`);
    if (res.status === 410) throw new Error('Model not available or endpoint deprecated (410).');
    if (res.status === 429) throw new Error('Rate limited by Hugging Face (429). Try again later.');
    
    if (text.includes('Model loading') || text.includes('model is loading')) {
        return 'Model is warming up — please try again in a few seconds.';
    }

    const err = new Error(`Hugging Face API error: ${res.status} ${res.statusText}`);
    // @ts-ignore
    err.details = text;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    // Different models return different shapes. Commonly: { generated_text: "..." } or an array.
    if (Array.isArray(data)) {
      // e.g., [{ generated_text: "..." }]
      return (data[0]?.generated_text ?? JSON.stringify(data));
    }
    if (data.generated_text) {
      return data.generated_text;
    }
    // For some newer text-generation endpoints, the structure differs:
    if (data?.output?.length) {
      return data.output.map((o: any) => o.text || '').join('\n');
    }
    return JSON.stringify(data);
  }

  // fallback to raw text
  return res.text();
}
