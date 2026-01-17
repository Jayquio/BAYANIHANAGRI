/**
 * Lightweight TypeScript wrapper that:
 * - Calls a local model HTTP service (default: http://localhost:8000/generate)
 * - Extracts JSON from the model text output
 * - Validates the JSON using a Zod schema
 * - Retries once with a corrective prompt if parsing/validation fails
 */

import { AnalysisSchema, type Analysis } from '@/ai/schemas/analysis';
import { YieldPredictionOutputSchema, type YieldPredictionOutput } from '@/ai/schemas/prediction';

const LOCAL_MODEL_URL = process.env.LOCAL_MODEL_URL || 'http://localhost:8000/generate';
const DEFAULT_MODEL_OPTS = { max_new_tokens: 1024, temperature: 0 };

function extractJsonFromText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // fallthrough
      }
    }
    throw new Error('No valid JSON found in model output.');
  }
}

async function callLocalModel(prompt: string, opts?: { max_new_tokens?: number; temperature?: number }) {
  const body = {
    prompt,
    max_new_tokens: opts?.max_new_tokens ?? DEFAULT_MODEL_OPTS.max_new_tokens,
    temperature: opts?.temperature ?? DEFAULT_MODEL_OPTS.temperature,
  };

  const res = await fetch(LOCAL_MODEL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error('Local model error', { status: res.status, body: text });
    throw new Error(`Local model HTTP error ${res.status}`);
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.text === 'string') {
      return parsed.text as string;
    }
    if (typeof parsed === 'string') return parsed;
  } catch {
    // not JSON
  }

  return text;
}

function buildRetryPrompt(exampleJson: Record<string, unknown>): (promptText: string) => string {
  return (previousPrompt: string) =>
    `${previousPrompt}

The previous response was invalid or unparsable. Reply ONLY with a valid JSON object that matches this example exactly (use the same keys and types). Example:
${JSON.stringify(exampleJson, null, 2)}

Return only the JSON object with no commentary, no markdown, and no code fences.`;
}

export async function callLocalModelForAnalysis(
  prompt: string,
  opts?: { max_new_tokens?: number; temperature?: number }
): Promise<Analysis> {
  const raw = await callLocalModel(prompt, opts);

  try {
    const parsed = extractJsonFromText(raw);
    const validated = AnalysisSchema.parse(parsed);
    return validated;
  } catch (firstErr) {
    console.warn('First parse/validation attempt failed:', (firstErr as Error).message);

    const example = {
      summary: 'Short summary',
      metrics: { totalCost: 0, totalRevenue: 0, totalProfit: 0, profitMargin: 0 },
      monthlyTrends: [],
      recommendations: [],
    };

    const retryPrompt = buildRetryPrompt(example)(prompt);

    try {
      const raw2 = await callLocalModel(retryPrompt, opts);
      const parsed2 = extractJsonFromText(raw2);
      const validated2 = AnalysisSchema.parse(parsed2);
      return validated2;
    } catch (secondErr) {
      console.error('Retry parse/validation failed:', (secondErr as Error).message);
      const err = new Error('AI returned invalid JSON after retry. Check server logs for raw outputs.');
      // @ts-ignore
      err.details = { firstRaw: raw };
      throw err;
    }
  }
}


export async function callLocalModelForYieldPrediction(
  prompt: string,
  opts?: { max_new_tokens?: number; temperature?: number }
): Promise<YieldPredictionOutput> {
  const raw = await callLocalModel(prompt, opts);

  try {
    const parsed = extractJsonFromText(raw);
    const validated = YieldPredictionOutputSchema.parse(parsed);
    return validated;
  } catch (firstErr) {
    console.warn('First parse/validation attempt failed:', (firstErr as Error).message);

    const example = {
        predictedYield: 0,
        confidence: 0.0,
        insights: "string"
    };

    const retryPrompt = buildRetryPrompt(example)(prompt);

    try {
      const raw2 = await callLocalModel(retryPrompt, opts);
      const parsed2 = extractJsonFromText(raw2);
      const validated2 = YieldPredictionOutputSchema.parse(parsed2);
      return validated2;
    } catch (secondErr) {
      console.error('Retry parse/validation failed:', (secondErr as Error).message);
      const err = new Error('AI returned invalid JSON after retry. Check server logs for raw outputs.');
       // @ts-ignore
      err.details = { firstRaw: raw };
      throw err;
    }
  }
}